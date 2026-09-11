import { randomUUID } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import { open, unlink } from 'node:fs/promises'
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

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

const IMAGE_SIGNATURES: ((head: Buffer) => boolean)[] = [
  (head) => head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff,
  (head) => head.subarray(0, 8).equals(PNG_SIGNATURE),
  (head) =>
    head.subarray(0, 4).toString('ascii') === 'RIFF' &&
    head.subarray(8, 12).toString('ascii') === 'WEBP',
]

export async function assertValidImage(file: Express.Multer.File) {
  const head = Buffer.alloc(12)
  const handle = await open(file.path, 'r')
  try {
    await handle.read(head, 0, head.length, 0)
  } finally {
    await handle.close()
  }

  if (!IMAGE_SIGNATURES.some((matches) => matches(head))) {
    await unlink(file.path).catch(() => {})
    throw new AppError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Isi file bukan gambar yang valid')
  }
}
