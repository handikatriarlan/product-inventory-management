import { Router } from 'express'
import { uploadRateLimiter } from '../../lib/rate-limit.ts'
import { upload } from '../../lib/upload.ts'
import * as productController from './product.controller.ts'

export const productRoutes = Router()

productRoutes.get('/', productController.list)
productRoutes.post('/', productController.create)
productRoutes.get('/categories', productController.categories)
productRoutes.get('/:id', productController.getById)
productRoutes.patch('/:id', productController.update)
productRoutes.post(
  '/:id/image',
  uploadRateLimiter,
  upload.single('image'),
  productController.uploadImage,
)
productRoutes.delete('/:id', productController.remove)
