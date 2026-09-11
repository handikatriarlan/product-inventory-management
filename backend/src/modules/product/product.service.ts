import { unlink } from 'node:fs/promises'
import path from 'node:path'
import { Prisma } from '../../generated/prisma/client.ts'
import type { Product } from '../../generated/prisma/client.ts'
import { AppError } from '../../lib/app-error.ts'
import { prisma } from '../../lib/prisma.ts'
import { uploadDir } from '../../lib/upload.ts'
import type { CreateProductInput, ListProductsQueryInput, UpdateProductInput } from './product.schema.ts'

function serializeProduct(product: Product) {
  return { ...product, price: Math.round(Number(product.price) * 100) / 100 }
}

async function withSkuConflict<T>(operation: () => Promise<T>) {
  try {
    return await operation()
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError(409, 'CONFLICT', 'SKU sudah digunakan')
    }
    throw error
  }
}

export async function listProducts(query: ListProductsQueryInput) {
  const where: Prisma.ProductWhereInput = {}

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { sku: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  if (query.category) {
    where.category = { equals: query.category, mode: 'insensitive' }
  }

  if (query.status) {
    where.status = query.status
  }

  const [total, products] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { [query.sortBy]: query.order },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
  ])

  return { items: products.map(serializeProduct), total }
}

export async function getCategories() {
  const rows = await prisma.product.findMany({
    where: { category: { not: null } },
    select: { category: true },
  })

  const unique = new Map<string, string>()
  for (const row of rows) {
    if (row.category && !unique.has(row.category.toLowerCase())) {
      unique.set(row.category.toLowerCase(), row.category)
    }
  }

  return [...unique.values()].sort((a, b) => a.localeCompare(b, 'id', { sensitivity: 'base' }))
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) {
    throw new AppError(404, 'NOT_FOUND', 'Produk tidak ditemukan')
  }
  return serializeProduct(product)
}

export async function createProduct(input: CreateProductInput) {
  const product = await withSkuConflict(() => prisma.product.create({ data: input }))
  return serializeProduct(product)
}

export async function updateProduct(id: string, input: UpdateProductInput) {
  await getProductById(id)
  const product = await withSkuConflict(() => prisma.product.update({ where: { id }, data: input }))
  return serializeProduct(product)
}

export async function updateProductImage(id: string, imageUrl: string) {
  const previous = await getProductById(id)
  const product = await prisma.product.update({ where: { id }, data: { imageUrl } })
  await removeUploadedFile(previous.imageUrl)
  return serializeProduct(product)
}

async function removeUploadedFile(imageUrl: string | null) {
  if (!imageUrl?.startsWith('/uploads/')) {
    return
  }
  await unlink(path.join(uploadDir, path.basename(imageUrl))).catch(() => {})
}

export async function deleteProduct(id: string) {
  const product = await getProductById(id)
  await prisma.product.delete({ where: { id } })
  await removeUploadedFile(product.imageUrl)
}
