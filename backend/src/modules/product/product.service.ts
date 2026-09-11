import type { Prisma, Product } from '../../generated/prisma/client.ts'
import { AppError } from '../../lib/app-error.ts'
import { prisma } from '../../lib/prisma.ts'
import type { CreateProductInput, ListProductsQueryInput, UpdateProductInput } from './product.schema.ts'

function serializeProduct(product: Product) {
  return { ...product, price: Math.round(Number(product.price) * 100) / 100 }
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
    distinct: ['category'],
    select: { category: true },
    orderBy: { category: 'asc' },
  })

  return rows.map((row) => row.category).filter((category): category is string => category !== null)
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
