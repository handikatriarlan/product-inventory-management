import type { Product } from '../../generated/prisma/client.ts'
import { AppError } from '../../lib/app-error.ts'
import { prisma } from '../../lib/prisma.ts'
import type { CreateProductInput, UpdateProductInput } from './product.schema.ts'

function serializeProduct(product: Product) {
  return { ...product, price: Math.round(Number(product.price) * 100) / 100 }
}

export async function listProducts() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } })
  return products.map(serializeProduct)
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) {
    throw new AppError(404, 'NOT_FOUND', 'Produk tidak ditemukan')
  }
  return serializeProduct(product)
}

export async function createProduct(input: CreateProductInput) {
  const product = await prisma.product.create({ data: input })
  return serializeProduct(product)
}

export async function updateProduct(id: string, input: UpdateProductInput) {
  await getProductById(id)
  const product = await prisma.product.update({ where: { id }, data: input })
  return serializeProduct(product)
}

export async function deleteProduct(id: string) {
  await getProductById(id)
  await prisma.product.delete({ where: { id } })
}
