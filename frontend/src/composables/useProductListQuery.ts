import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { LocationQuery } from 'vue-router'
import { useProductStore } from '../stores/product'
import type { ProductListQuery } from '../stores/product'
import type { ProductSortField, ProductStatus } from '../types/product'

const SORT_FIELDS: ProductSortField[] = ['name', 'price', 'stock', 'createdAt', 'updatedAt']
const STATUSES: ProductStatus[] = ['ACTIVE', 'INACTIVE']

const DEFAULTS: ProductListQuery = {
  page: 1,
  limit: 10,
  search: '',
  category: '',
  status: '',
  sortBy: 'createdAt',
  order: 'desc',
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

function readInt(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = Number(value)
  if (!Number.isInteger(parsed)) return fallback
  return Math.min(Math.max(parsed, min), max)
}

function readQuery(params: LocationQuery): ProductListQuery {
  const status = readString(params.status)
  const sortBy = readString(params.sortBy)

  return {
    page: readInt(params.page, DEFAULTS.page, 1, 1_000_000),
    limit: readInt(params.limit, DEFAULTS.limit, 1, 100),
    search: readString(params.search) ?? '',
    category: readString(params.category) ?? '',
    status: STATUSES.includes(status as ProductStatus) ? (status as ProductStatus) : '',
    sortBy: SORT_FIELDS.includes(sortBy as ProductSortField)
      ? (sortBy as ProductSortField)
      : DEFAULTS.sortBy,
    order: params.order === 'asc' || params.order === 'desc' ? params.order : DEFAULTS.order,
  }
}

function buildQuery(query: ProductListQuery): Record<string, string> {
  const params: Record<string, string> = {}
  if (query.page !== DEFAULTS.page) params.page = String(query.page)
  if (query.limit !== DEFAULTS.limit) params.limit = String(query.limit)
  if (query.search) params.search = query.search
  if (query.category) params.category = query.category
  if (query.status) params.status = query.status
  if (query.sortBy !== DEFAULTS.sortBy) params.sortBy = query.sortBy
  if (query.order !== DEFAULTS.order) params.order = query.order
  return params
}

export function useProductListQuery() {
  const route = useRoute()
  const router = useRouter()
  const store = useProductStore()

  watch(
    () => route.query,
    () => {
      store.setQuery(readQuery(route.query))
      store.fetchList()
    },
    { immediate: true },
  )

  function updateQuery(patch: Partial<ProductListQuery>, options: { replace?: boolean } = {}) {
    const next = { ...store.query, ...patch }
    const navigate = options.replace ? router.replace : router.push
    navigate({ name: 'product-list', query: buildQuery(next) })
  }

  return {
    updateQuery,
    resetQuery: () => updateQuery({ ...DEFAULTS }, { replace: true }),
  }
}
