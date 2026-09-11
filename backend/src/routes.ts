import { Router } from 'express'
import { sendData } from './lib/http.ts'

export const routes = Router()

routes.get('/health', (_req, res) => {
  sendData(res, { status: 'ok', uptime: process.uptime() })
})
