export type ProductStatus = 'ACTIVE' | 'INACTIVE'

export interface Product {
  id: string
  sku: string
  name: string
  description: string | null
  price: number
  stock: number
  category: string | null
  status: ProductStatus
  imageUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface ProductListMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ProductListResponse {
  data: Product[]
  meta: ProductListMeta
}

export type ProductSortField = 'name' | 'price' | 'stock' | 'createdAt' | 'updatedAt'

export interface ProductQuery {
  page?: number
  limit?: number
  search?: string
  category?: string
  status?: ProductStatus
  sortBy?: ProductSortField
  order?: 'asc' | 'desc'
}

export interface ProductPayload {
  sku: string
  name: string
  description?: string
  price: number
  stock: number
  category?: string
  status: ProductStatus
}
