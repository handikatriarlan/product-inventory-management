import type { NextFunction, Request, Response } from 'express'
import multer from 'multer'
import { ZodError } from 'zod'
import { Prisma } from '../generated/prisma/client.ts'
import { env } from '../config/env.ts'
import { AppError } from './app-error.ts'

export function sendData(res: Response, data: unknown, status = 200) {
  res.status(status).json({ data })
}

export function sendList(res: Response, data: unknown[], meta: unknown) {
  res.status(200).json({ data, meta })
}

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(new AppError(404, 'NOT_FOUND', `Route ${req.method} ${req.originalUrl} tidak ditemukan`))
}

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) {
    next(err)
    return
  }

  if (err instanceof AppError) {
    const error: { code: string; message: string; details?: unknown } = {
      code: err.code,
      message: err.message,
    }
    if (err.details !== undefined) {
      error.details = err.details
    }
    res.status(err.status).json({ error })
    return
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request tidak valid',
        details: err.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      },
    })
    return
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (CONNECTION_ERROR_CODES.has(err.code)) {
      res.status(503).json({
        error: { code: 'SERVICE_UNAVAILABLE', message: 'Database tidak tersedia' },
      })
      return
    }
    if (err.code === 'P2002') {
      const target = err.meta?.target
      const fields = Array.isArray(target)
        ? target.join(', ')
        : typeof target === 'string'
          ? target
          : undefined
      const error: { code: string; message: string; details?: unknown } = {
        code: 'CONFLICT',
        message: fields ? `Nilai unik sudah digunakan: ${fields}` : 'Nilai unik sudah digunakan',
      }
      if (fields) {
        error.details = { target: fields }
      }
      res.status(409).json({ error })
      return
    }
    if (err.code === 'P2025') {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Data tidak ditemukan' } })
      return
    }
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    res.status(503).json({
      error: { code: 'SERVICE_UNAVAILABLE', message: 'Database tidak tersedia' },
    })
    return
  }

  if (isPayloadTooLarge(err)) {
    res.status(413).json({
      error: { code: 'PAYLOAD_TOO_LARGE', message: 'Ukuran body melebihi batas' },
    })
    return
  }

  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Body request bukan JSON yang valid' },
    })
    return
  }

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({
        error: { code: 'PAYLOAD_TOO_LARGE', message: 'Ukuran file melebihi batas' },
      })
      return
    }
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: err.message } })
    return
  }

  console.error(`[error] ${req.method} ${req.originalUrl}`, err)

  const message =
    env.NODE_ENV === 'production'
      ? 'Terjadi kesalahan pada server'
      : err instanceof Error
        ? err.message
        : 'Terjadi kesalahan pada server'

  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message } })
}

function isPayloadTooLarge(err: unknown) {
  return typeof err === 'object' && err !== null && (err as { type?: string }).type === 'entity.too.large'
}

const CONNECTION_ERROR_CODES = new Set([
  'P1001',
  'P1002',
  'P1008',
  'P1017',
  'ECONNREFUSED',
  'ECONNRESET',
  'ENOTFOUND',
  'EHOSTUNREACH',
  'ETIMEDOUT',
])
