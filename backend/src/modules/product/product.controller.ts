import type { Request, Response } from 'express'
import { sendData, sendList } from '../../lib/http.ts'
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

export async function remove(req: Request, res: Response) {
  const { id } = productIdParamSchema.parse(req.params)
  await productService.deleteProduct(id)
  res.status(204).send()
}
