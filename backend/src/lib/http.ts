import type { NextFunction, Request, Response } from 'express'
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

  console.error(`[error] ${req.method} ${req.originalUrl}`, err)

  const message =
    env.NODE_ENV === 'production'
      ? 'Terjadi kesalahan pada server'
      : err instanceof Error
        ? err.message
        : 'Terjadi kesalahan pada server'

  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message } })
}
