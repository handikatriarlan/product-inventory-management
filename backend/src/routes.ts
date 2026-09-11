import { Router } from 'express'
import { sendData } from './lib/http.ts'
import { productRoutes } from './modules/product/product.routes.ts'

export const routes = Router()

routes.use('/products', productRoutes)

routes.get('/health', (_req, res) => {
  sendData(res, { status: 'ok', uptime: process.uptime() })
})
