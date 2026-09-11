import type { NextFunction, Request, Response } from 'express'
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

  console.error(`[error] ${req.method} ${req.originalUrl}`, err)

  const message =
    env.NODE_ENV === 'production'
      ? 'Terjadi kesalahan pada server'
      : err instanceof Error
        ? err.message
        : 'Terjadi kesalahan pada server'

  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message } })
}
