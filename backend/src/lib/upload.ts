import { randomUUID } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import type { Request } from 'express'
import multer from 'multer'
import { env } from '../config/env.ts'
import { AppError } from './app-error.ts'

export const uploadDir = path.resolve(env.UPLOAD_DIR)

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function ensureUploadDir() {
  mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
})

function fileFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(new AppError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Format gambar harus jpg, png, atau webp'))
    return
  }
  cb(null, true)
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.MAX_UPLOAD_SIZE_MB * 1024 * 1024, files: 1 },
})
