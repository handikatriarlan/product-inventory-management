<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import ProductPagination from '../components/product/ProductPagination.vue'
import ProductFilters from '../components/product/ProductFilters.vue'
import ProductTable from '../components/product/ProductTable.vue'
import ConfirmDialog from '../components/ui/ConfirmDialog.vue'
import { useToast } from '../composables/useToast'
import { getErrorMessage } from '../lib/api'
import { useProductStore } from '../stores/product'
import type { Product, ProductSortField, ProductStatus } from '../types/product'

const router = useRouter()
const store = useProductStore()
const { show } = useToast()
const { items, meta, categories, loading, error, isEmpty, query } = storeToRefs(store)
const { fetchList, fetchCategories, remove, resetFilters } = store

const target = ref<Product | null>(null)
const deleting = ref(false)

onMounted(() => {
  fetchCategories()
  fetchList()
})

function reloadFromFirstPage() {
  query.value.page = 1
  fetchList()
}

function onSearchChange(value: string) {
  query.value.search = value
  reloadFromFirstPage()
}

function onCategoryChange(value: string) {
  query.value.category = value
  reloadFromFirstPage()
}

function onStatusChange(value: ProductStatus | '') {
  query.value.status = value
  reloadFromFirstPage()
}

function onSortByChange(value: ProductSortField) {
  query.value.sortBy = value
  reloadFromFirstPage()
}

function onOrderChange(value: 'asc' | 'desc') {
  query.value.order = value
  reloadFromFirstPage()
}

function onSort(field: ProductSortField) {
  if (query.value.sortBy === field) {
    query.value.order = query.value.order === 'asc' ? 'desc' : 'asc'
  } else {
    query.value.sortBy = field
    query.value.order = 'asc'
  }
  reloadFromFirstPage()
}

function onReset() {
  resetFilters()
  fetchList()
}

function onPageChange(page: number) {
  query.value.page = page
  fetchList()
}

function requestDelete(product: Product) {
  target.value = product
}

function cancelDelete() {
  if (!deleting.value) target.value = null
}

async function confirmDelete() {
  const product = target.value
  if (!product) return

  deleting.value = true
  try {
    await remove(product.id)
    show(`Produk "${product.name}" berhasil dihapus`)
  } catch (err) {
    show(getErrorMessage(err), 'error')
  } finally {
    deleting.value = false
    target.value = null
  }
}
</script>

<template>
  <section class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold text-slate-900">Produk</h1>
        <p class="text-sm text-slate-600">Kelola inventori produk Anda.</p>
      </div>
      <button
        type="button"
        class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        @click="router.push({ name: 'product-create' })"
      >
        Tambah Produk
      </button>
    </div>

    <ProductFilters
      :categories="categories"
      :search="query.search"
      :category="query.category"
      :status="query.status"
      :sort-by="query.sortBy"
      :order="query.order"
      @update:search="onSearchChange"
      @update:category="onCategoryChange"
      @update:status="onStatusChange"
      @update:sort-by="onSortByChange"
      @update:order="onOrderChange"
      @reset="onReset"
    />

    <div v-if="loading && items.length === 0" class="space-y-3" aria-busy="true">
      <div v-for="n in 5" :key="n" class="h-16 animate-pulse rounded-xl bg-slate-200" />
    </div>

    <div v-else-if="error" class="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <p class="text-sm text-red-700">{{ error }}</p>
      <button
        type="button"
        class="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        @click="fetchList"
      >
        Coba lagi
      </button>
    </div>

    <div
      v-else-if="isEmpty"
      class="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center"
    >
      <p class="text-slate-700">Belum ada produk.</p>
      <button
        type="button"
        class="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        @click="router.push({ name: 'product-create' })"
      >
        Tambah Produk
      </button>
    </div>

    <template v-else>
      <ProductTable
        :items="items"
        :sort-by="query.sortBy"
        :order="query.order"
        @sort="onSort"
        @delete="requestDelete"
      />
      <ProductPagination :meta="meta" @change="onPageChange" />
    </template>

    <ConfirmDialog
      :open="target !== null"
      title="Hapus produk"
      :message="
        target ? `Yakin ingin menghapus &quot;${target.name}&quot;? Tindakan ini tidak dapat dibatalkan.` : ''
      "
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </section>
</template>
