import { unlink } from 'node:fs/promises'
import type { Request, Response } from 'express'
import { AppError } from '../../lib/app-error.ts'
import { sendData, sendList } from '../../lib/http.ts'
import { assertValidImage } from '../../lib/upload.ts'
import {
  createProductSchema,
  listProductsQuerySchema,
  productIdParamSchema,
  updateProductSchema,
} from './product.schema.ts'
import * as productService from './product.service.ts'

export async function list(req: Request, res: Response) {
  const { page, limit, ...query } = listProductsQuerySchema.parse(req.query)
  const { items, total } = await productService.listProducts({ page, limit, ...query })
  sendList(res, items, { page, limit, total, totalPages: Math.ceil(total / limit) })
}

export async function categories(_req: Request, res: Response) {
  sendData(res, await productService.getCategories())
}

export async function getById(req: Request, res: Response) {
  const { id } = productIdParamSchema.parse(req.params)
  sendData(res, await productService.getProductById(id))
}

export async function create(req: Request, res: Response) {
  const input = createProductSchema.parse(req.body)
  sendData(res, await productService.createProduct(input), 201)
}

export async function update(req: Request, res: Response) {
  const { id } = productIdParamSchema.parse(req.params)
  const input = updateProductSchema.parse(req.body)
  sendData(res, await productService.updateProduct(id, input))
}

export async function uploadImage(req: Request, res: Response) {
  if (!req.file) {
    throw new AppError(400, 'VALIDATION_ERROR', 'File gambar wajib diunggah')
  }
  try {
    const { id } = productIdParamSchema.parse(req.params)
    await assertValidImage(req.file)
    const product = await productService.updateProductImage(id, `/uploads/${req.file.filename}`)
    sendData(res, product)
  } catch (error) {
    await unlink(req.file.path).catch(() => {})
    throw error
  }
}

export async function remove(req: Request, res: Response) {
  const { id } = productIdParamSchema.parse(req.params)
  await productService.deleteProduct(id)
  res.status(204).send()
}
