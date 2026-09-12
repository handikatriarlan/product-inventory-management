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

  const hasPrev = computed(() => query.page > 1)
  const hasNext = computed(() => query.page < meta.value.totalPages)
  const isEmpty = computed(() => items.value.length === 0)

  async function fetchList() {
    loading.value = true
    error.value = null
    try {
      const params: Record<string, string | number> = {
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy,
        order: query.order,
      }
      if (query.search.trim()) params.search = query.search.trim()
      if (query.category) params.category = query.category
      if (query.status) params.status = query.status

      const { data } = await api.get<ProductListResponse>('/products', { params })
      items.value = data.data
      meta.value = data.meta
    } catch (err) {
      error.value = getErrorMessage(err)
    } finally {
      loading.value = false
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
    if (items.value.length === 1 && query.page > 1) query.page -= 1
    await fetchList()
  }

  function resetFilters() {
    query.page = 1
    query.search = ''
    query.category = ''
    query.status = ''
    query.sortBy = 'createdAt'
    query.order = 'desc'
  }

  return {
    items,
    meta,
    categories,
    loading,
    error,
    query,
    hasPrev,
    hasNext,
    isEmpty,
    fetchList,
    fetchCategories,
    remove,
    resetFilters,
  }
})
