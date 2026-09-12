<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import ProductFilters from '../components/product/ProductFilters.vue'
import ProductMobileList from '../components/product/ProductMobileList.vue'
import ProductMobileToolbar from '../components/product/ProductMobileToolbar.vue'
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
const { items, meta, categories, loading, loadingMore, error, isEmpty, hasMore, query } =
  storeToRefs(store)
const { fetchList, fetchMore } = store

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

function onSortByChange(value: ProductSortField) {
  updateQuery({ sortBy: value, page: 1 })
}

function onOrderChange(value: 'asc' | 'desc') {
  updateQuery({ order: value, page: 1 })
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
  <section class="space-y-4 pb-24 sm:space-y-5 md:pb-0">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-xl font-semibold tracking-tight sm:text-2xl">Produk</h1>
        <p class="mt-1 text-xs text-neutral-500 sm:text-sm">
          <template v-if="meta.total > 0">{{ meta.total }} produk terdaftar.</template>
          <template v-else>Kelola inventori produk Anda.</template>
        </p>
      </div>
      <span class="hidden md:inline-flex">
        <AppButton size="sm" @click="openCreate">Tambah Produk</AppButton>
      </span>
    </div>

    <ProductMobileToolbar
      class="md:hidden"
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
      @reset="resetQuery"
    />

    <ProductFilters
      class="hidden md:block"
      :categories="categories"
      :search="query.search"
      :category="query.category"
      :status="query.status"
      @update:search="onSearchChange"
      @update:category="onCategoryChange"
      @update:status="onStatusChange"
      @reset="resetQuery"
    />

    <div v-if="loading && items.length === 0" class="space-y-2.5" aria-busy="true">
      <div v-for="n in 5" :key="n" class="h-24 animate-pulse border border-neutral-100 bg-neutral-100 md:h-14" />
    </div>

    <div v-else-if="error" class="border border-neutral-900 p-6 text-center sm:p-8">
      <p class="text-xs text-neutral-700 sm:text-sm">{{ error }}</p>
      <AppButton variant="outline" size="sm" class="mt-4" @click="fetchList">Coba lagi</AppButton>
    </div>

    <div v-else-if="isEmpty" class="border border-dashed border-neutral-300 p-8 text-center sm:p-12">
      <p class="text-xs text-neutral-600 sm:text-sm">Belum ada produk yang cocok.</p>
      <AppButton size="sm" class="mt-4" @click="openCreate">Tambah Produk</AppButton>
    </div>

    <template v-else>
      <ProductMobileList
        class="md:hidden"
        :items="items"
        :has-more="hasMore"
        :loading-more="loadingMore"
        @detail="openDetail"
        @edit="openEdit"
        @delete="requestDelete"
        @load-more="fetchMore"
      />

      <div class="hidden space-y-5 md:block">
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
      </div>
    </template>

    <button
      type="button"
      class="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-4 z-40 flex h-14 w-14 items-center justify-center border border-neutral-900 bg-neutral-900 text-white shadow-lg active:bg-neutral-700 md:hidden"
      aria-label="Tambah produk"
      @click="openCreate"
    >
      <svg
        class="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        aria-hidden="true"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
    </button>

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
