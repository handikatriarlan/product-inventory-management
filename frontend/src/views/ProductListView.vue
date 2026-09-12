<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import ProductFilters from '../components/product/ProductFilters.vue'
import ProductPagination from '../components/product/ProductPagination.vue'
import ProductTable from '../components/product/ProductTable.vue'
import AppButton from '../components/ui/AppButton.vue'
import ConfirmDialog from '../components/ui/ConfirmDialog.vue'
import { useProductListQuery } from '../composables/useProductListQuery'
import { useProductModals } from '../composables/useProductModals'
import { useToast } from '../composables/useToast'
import { getErrorMessage } from '../lib/api'
import { useProductStore } from '../stores/product'
import type { Product, ProductSortField, ProductStatus } from '../types/product'

const store = useProductStore()
const { show } = useToast()
const { openCreate, openEdit, openDetail } = useProductModals()
const { updateQuery, resetQuery } = useProductListQuery()
const { items, meta, categories, loading, error, isEmpty, query } = storeToRefs(store)
const { fetchList } = store

const target = ref<Product | null>(null)
const deleting = ref(false)

onMounted(() => {
  store.fetchCategories()
})

function onSearchChange(value: string) {
  updateQuery({ search: value, page: 1 }, { replace: true })
}

function onCategoryChange(value: string) {
  updateQuery({ category: value, page: 1 })
}

function onStatusChange(value: ProductStatus | '') {
  updateQuery({ status: value, page: 1 })
}

function onSort(field: ProductSortField) {
  const order = query.value.sortBy === field && query.value.order === 'asc' ? 'desc' : 'asc'
  updateQuery({ sortBy: field, order, page: 1 })
}

function onPageChange(page: number) {
  updateQuery({ page })
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
    await store.remove(product.id)
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
  <section class="space-y-5">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Produk</h1>
        <p class="mt-1 text-sm text-neutral-500">
          <template v-if="meta.total > 0">{{ meta.total }} produk terdaftar.</template>
          <template v-else>Kelola inventori produk Anda.</template>
        </p>
      </div>
      <AppButton size="sm" @click="openCreate">Tambah Produk</AppButton>
    </div>

    <ProductFilters
      :categories="categories"
      :search="query.search"
      :category="query.category"
      :status="query.status"
      @update:search="onSearchChange"
      @update:category="onCategoryChange"
      @update:status="onStatusChange"
      @reset="resetQuery"
    />

    <div v-if="loading && items.length === 0" class="space-y-2" aria-busy="true">
      <div v-for="n in 6" :key="n" class="h-14 animate-pulse border border-neutral-100 bg-neutral-100" />
    </div>

    <div v-else-if="error" class="border border-neutral-900 p-8 text-center">
      <p class="text-sm text-neutral-700">{{ error }}</p>
      <AppButton variant="outline" size="sm" class="mt-4" @click="fetchList">Coba lagi</AppButton>
    </div>

    <div v-else-if="isEmpty" class="border border-dashed border-neutral-300 p-12 text-center">
      <p class="text-sm text-neutral-600">Belum ada produk yang cocok.</p>
      <AppButton size="sm" class="mt-4" @click="openCreate">Tambah Produk</AppButton>
    </div>

    <template v-else>
      <ProductTable
        :items="items"
        :sort-by="query.sortBy"
        :order="query.order"
        @sort="onSort"
        @detail="openDetail"
        @edit="openEdit"
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
