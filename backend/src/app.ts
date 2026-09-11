import cors from 'cors'
import express from 'express'
import { env } from './config/env.ts'
import { errorHandler, notFoundHandler } from './lib/http.ts'
import { ensureUploadDir, uploadDir } from './lib/upload.ts'
import { routes } from './routes.ts'

ensureUploadDir()

export const app = express()

app.disable('x-powered-by')
app.use(cors({ origin: env.CORS_ORIGIN }))
app.use(express.json({ limit: '1mb' }))
app.use('/uploads', express.static(uploadDir))
app.use(routes)
app.use(notFoundHandler)
app.use(errorHandler)
