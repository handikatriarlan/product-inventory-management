import { Router } from 'express'
import { AppError } from './lib/app-error.ts'
import { sendData } from './lib/http.ts'
import { pingDatabase } from './lib/prisma.ts'
import { productRoutes } from './modules/product/product.routes.ts'

export const routes = Router()

routes.use('/products', productRoutes)

routes.get('/health', async (_req, res) => {
  try {
    await pingDatabase()
  } catch {
    throw new AppError(503, 'SERVICE_UNAVAILABLE', 'Database tidak tersedia')
  }

  sendData(res, { status: 'ok', database: 'up', uptime: process.uptime() })
})
