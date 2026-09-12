<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import type { ProductSortField, ProductStatus } from '../../types/product'

const props = defineProps<{
  categories: string[]
  search: string
  category: string
  status: '' | ProductStatus
  sortBy: ProductSortField
  order: 'asc' | 'desc'
}>()

const emit = defineEmits<{
  'update:search': [value: string]
  'update:category': [value: string]
  'update:status': [value: ProductStatus | '']
  'update:sortBy': [value: ProductSortField]
  'update:order': [value: 'asc' | 'desc']
  reset: []
}>()

const searchInput = ref(props.search)
let debounce: ReturnType<typeof setTimeout> | undefined

watch(
  () => props.search,
  (value) => {
    if (value !== searchInput.value) searchInput.value = value
  },
)

watch(searchInput, (value) => {
  clearTimeout(debounce)
  debounce = setTimeout(() => {
    if (value !== props.search) emit('update:search', value)
  }, 300)
})

onBeforeUnmount(() => clearTimeout(debounce))

const sortOptions: { value: ProductSortField; label: string }[] = [
  { value: 'createdAt', label: 'Terbaru' },
  { value: 'name', label: 'Nama' },
  { value: 'price', label: 'Harga' },
  { value: 'stock', label: 'Stok' },
  { value: 'updatedAt', label: 'Terakhir diperbarui' },
]
</script>

<template>
  <div class="rounded-xl border border-slate-200 bg-white p-4">
    <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
      <label class="lg:col-span-2">
        <span class="mb-1 block text-xs font-medium text-slate-600">Cari produk</span>
        <input
          v-model="searchInput"
          type="search"
          placeholder="Nama atau SKU..."
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
      </label>

      <label>
        <span class="mb-1 block text-xs font-medium text-slate-600">Kategori</span>
        <select
          :value="category"
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          @change="emit('update:category', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">Semua kategori</option>
          <option v-for="item in categories" :key="item" :value="item">{{ item }}</option>
        </select>
      </label>

      <label>
        <span class="mb-1 block text-xs font-medium text-slate-600">Status</span>
        <select
          :value="status"
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          @change="emit('update:status', ($event.target as HTMLSelectElement).value as ProductStatus | '')"
        >
          <option value="">Semua status</option>
          <option value="ACTIVE">Aktif</option>
          <option value="INACTIVE">Nonaktif</option>
        </select>
      </label>

      <div>
        <span class="mb-1 block text-xs font-medium text-slate-600">Urutkan</span>
        <div class="flex gap-2">
          <select
            :value="sortBy"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            @change="emit('update:sortBy', ($event.target as HTMLSelectElement).value as ProductSortField)"
          >
            <option v-for="option in sortOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <button
            type="button"
            class="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
            :aria-label="order === 'asc' ? 'Urutan naik' : 'Urutan turun'"
            @click="emit('update:order', order === 'asc' ? 'desc' : 'asc')"
          >
            {{ order === 'asc' ? '↑' : '↓' }}
          </button>
        </div>
      </div>
    </div>

    <div class="mt-3 flex justify-end">
      <button
        type="button"
        class="text-sm text-slate-600 underline hover:text-slate-900"
        @click="emit('reset')"
      >
        Reset filter
      </button>
    </div>
  </div>
</template>
