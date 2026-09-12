<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import AppButton from '../ui/AppButton.vue'
import AppModal from '../ui/AppModal.vue'
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

const SORT_OPTIONS: { value: ProductSortField; label: string }[] = [
  { value: 'createdAt', label: 'Terbaru ditambahkan' },
  { value: 'name', label: 'Nama (A–Z)' },
  { value: 'price', label: 'Harga' },
  { value: 'stock', label: 'Stok' },
]

const STATUS_OPTIONS: { value: '' | ProductStatus; label: string }[] = [
  { value: '', label: 'Semua' },
  { value: 'ACTIVE', label: 'Aktif' },
  { value: 'INACTIVE', label: 'Nonaktif' },
]

const sheetOpen = ref(false)
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

const activeCount = computed(() => {
  let count = 0
  if (props.category) count += 1
  if (props.status) count += 1
  if (props.sortBy !== 'createdAt' || props.order !== 'desc') count += 1
  return count
})

const chipClass = (active: boolean) => [
  'shrink-0 whitespace-nowrap border px-3 py-1.5 text-xs font-medium',
  active ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-300 text-neutral-700',
]

const optionClass = (active: boolean) => [
  'flex w-full items-center justify-between border px-3 py-2.5 text-sm',
  active ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-300 text-neutral-700',
]
</script>

<template>
  <div>
    <div
      class="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-30 -mx-3 mb-3 border-b border-neutral-200 bg-white px-3 pb-2 pt-2 md:hidden"
    >
      <label class="relative block">
        <span class="sr-only">Cari produk</span>
        <svg
          class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          v-model="searchInput"
          type="search"
          placeholder="Cari nama atau SKU..."
          class="h-10 w-full border border-neutral-300 bg-white pl-9 pr-9 text-sm text-neutral-900 placeholder:text-neutral-500 focus:border-neutral-900 focus:outline-none"
        />
        <button
          v-if="searchInput"
          type="button"
          class="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center text-neutral-500"
          aria-label="Hapus pencarian"
          @click="searchInput = ''"
        >
          &times;
        </button>
      </label>

      <div class="mt-2 flex items-center gap-2">
        <div class="relative min-w-0 flex-1">
          <div class="flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button type="button" :class="chipClass(!category)" :aria-pressed="!category" @click="emit('update:category', '')">
              Semua
            </button>
            <button
              v-for="item in categories"
              :key="item"
              type="button"
              :class="chipClass(category === item)"
              :aria-pressed="category === item"
              @click="emit('update:category', item)"
            >
              {{ item }}
            </button>
          </div>
          <span class="pointer-events-none absolute inset-y-0 right-0 w-5 bg-gradient-to-l from-white" aria-hidden="true"></span>
        </div>

        <button
          type="button"
          class="relative h-9 shrink-0 border border-neutral-300 px-3 text-xs font-medium uppercase tracking-wide text-neutral-700"
          @click="sheetOpen = true"
        >
          Filter
          <span
            v-if="activeCount"
            class="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center bg-neutral-900 px-1 text-[10px] font-semibold text-white"
          >
            {{ activeCount }}
          </span>
        </button>
      </div>
    </div>

    <AppModal :open="sheetOpen" title="Filter & Urutkan" size="sm" @close="sheetOpen = false">
      <div class="space-y-5">
        <div>
          <p class="text-[11px] font-medium uppercase tracking-widest text-neutral-500">Status</p>
          <div class="mt-2 grid grid-cols-3 gap-2">
            <button
              v-for="option in STATUS_OPTIONS"
              :key="option.value || 'all'"
              type="button"
              :class="chipClass(status === option.value)"
              :aria-pressed="status === option.value"
              @click="emit('update:status', option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <div>
          <p class="text-[11px] font-medium uppercase tracking-widest text-neutral-500">Urutkan</p>
          <div class="mt-2 space-y-2">
            <button
              v-for="option in SORT_OPTIONS"
              :key="option.value"
              type="button"
              :class="optionClass(sortBy === option.value)"
              :aria-pressed="sortBy === option.value"
              @click="emit('update:sortBy', option.value)"
            >
              <span>{{ option.label }}</span>
              <span v-if="sortBy === option.value" aria-hidden="true">&#10003;</span>
            </button>
          </div>
        </div>

        <div>
          <p class="text-[11px] font-medium uppercase tracking-widest text-neutral-500">Arah urutan</p>
          <div class="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              :class="chipClass(order === 'asc')"
              :aria-pressed="order === 'asc'"
              @click="emit('update:order', 'asc')"
            >
              Naik
            </button>
            <button
              type="button"
              :class="chipClass(order === 'desc')"
              :aria-pressed="order === 'desc'"
              @click="emit('update:order', 'desc')"
            >
              Turun
            </button>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex gap-2">
          <AppButton variant="outline" class="flex-1" @click="emit('reset')">Reset</AppButton>
          <AppButton class="flex-1" @click="sheetOpen = false">Selesai</AppButton>
        </div>
      </template>
    </AppModal>
  </div>
</template>
