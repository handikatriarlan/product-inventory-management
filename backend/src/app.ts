import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { env } from './config/env.ts'
import { errorHandler, notFoundHandler } from './lib/http.ts'
import { ensureUploadDir, uploadDir } from './lib/upload.ts'
import { routes } from './routes.ts'

ensureUploadDir()

export const app = express()

app.disable('x-powered-by')
if (env.NODE_ENV === 'production') {
  app.set('trust proxy', 1)
}
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(cors({ origin: env.CORS_ORIGIN }))
app.use(express.json({ limit: '1mb' }))
app.use('/uploads', express.static(uploadDir, { maxAge: '7d', immutable: true }))
app.use(routes)
app.use(notFoundHandler)
app.use(errorHandler)
