import { computed, reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import { api, getErrorMessage } from '../lib/api'
import type {
  Product,
  ProductListMeta,
  ProductListResponse,
  ProductSortField,
  ProductStatus,
} from '../types/product'

export interface ProductListQuery {
  page: number
  limit: number
  search: string
  category: string
  status: '' | ProductStatus
  sortBy: ProductSortField
  order: 'asc' | 'desc'
}

export const useProductStore = defineStore('product', () => {
  const items = ref<Product[]>([])
  const meta = ref<ProductListMeta>({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const categories = ref<string[]>([])
  const loading = ref(false)
  const loadingMore = ref(false)
  const error = ref<string | null>(null)

  const query = reactive<ProductListQuery>({
    page: 1,
    limit: 10,
    search: '',
    category: '',
    status: '',
    sortBy: 'createdAt',
    order: 'desc',
  })

  const isEmpty = computed(() => items.value.length === 0)
  const hasMore = computed(() => meta.value.totalPages > meta.value.page)

  function setQuery(patch: Partial<ProductListQuery>) {
    Object.assign(query, patch)
  }

  function buildParams(page: number): Record<string, string | number> {
    const params: Record<string, string | number> = {
      page,
      limit: query.limit,
      sortBy: query.sortBy,
      order: query.order,
    }
    if (query.search.trim()) params.search = query.search.trim()
    if (query.category) params.category = query.category
    if (query.status) params.status = query.status
    return params
  }

  let fetchToken = 0

  async function fetchList() {
    const token = ++fetchToken
    loading.value = true
    error.value = null
    try {
      const { data } = await api.get<ProductListResponse>('/products', {
        params: buildParams(query.page),
      })
      if (token !== fetchToken) return
      items.value = data.data
      meta.value = data.meta
    } catch (err) {
      if (token !== fetchToken) return
      error.value = getErrorMessage(err)
    } finally {
      if (token === fetchToken) loading.value = false
    }
  }

  async function fetchMore() {
    if (loading.value || loadingMore.value || !hasMore.value) return
    const token = fetchToken
    loadingMore.value = true
    try {
      const { data } = await api.get<ProductListResponse>('/products', {
        params: buildParams(meta.value.page + 1),
      })
      if (token !== fetchToken) return
      items.value = [...items.value, ...data.data]
      meta.value = data.meta
    } catch (err) {
      if (token !== fetchToken) return
      error.value = getErrorMessage(err)
    } finally {
      loadingMore.value = false
    }
  }

  async function fetchCategories() {
    try {
      const { data } = await api.get<{ data: string[] }>('/products/categories')
      categories.value = data.data
    } catch {
      categories.value = []
    }
  }

  async function remove(id: string) {
    await api.delete(`/products/${id}`)
    items.value = items.value.filter((product) => product.id !== id)
    const total = Math.max(0, meta.value.total - 1)
    meta.value = { ...meta.value, total, totalPages: Math.ceil(total / meta.value.limit) }
  }

  return {
    items,
    meta,
    categories,
    loading,
    loadingMore,
    error,
    query,
    isEmpty,
    hasMore,
    setQuery,
    fetchList,
    fetchMore,
    fetchCategories,
    remove,
  }
})
