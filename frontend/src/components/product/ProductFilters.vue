<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import AppButton from '../ui/AppButton.vue'
import type { ProductStatus } from '../../types/product'

const props = defineProps<{
  categories: string[]
  search: string
  category: string
  status: '' | ProductStatus
}>()

const emit = defineEmits<{
  'update:search': [value: string]
  'update:category': [value: string]
  'update:status': [value: ProductStatus | '']
  reset: []
}>()

const labelClass = 'block text-[11px] font-medium uppercase tracking-widest text-neutral-500'
const controlClass =
  'mt-1 w-full border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none'

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
</script>

<template>
  <div class="border border-neutral-200 bg-white p-4">
    <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
      <label class="lg:col-span-2">
        <span :class="labelClass">Cari produk</span>
        <input
          v-model="searchInput"
          type="search"
          placeholder="Nama atau SKU..."
          :class="[controlClass, 'placeholder:text-neutral-400']"
        />
      </label>

      <label>
        <span :class="labelClass">Kategori</span>
        <select
          :value="category"
          :class="controlClass"
          @change="emit('update:category', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">Semua kategori</option>
          <option v-for="item in categories" :key="item" :value="item">{{ item }}</option>
        </select>
      </label>

      <label>
        <span :class="labelClass">Status</span>
        <select
          :value="status"
          :class="controlClass"
          @change="emit('update:status', ($event.target as HTMLSelectElement).value as ProductStatus | '')"
        >
          <option value="">Semua status</option>
          <option value="ACTIVE">Aktif</option>
          <option value="INACTIVE">Nonaktif</option>
        </select>
      </label>

      <div class="flex items-end">
        <AppButton variant="outline" class="w-full" @click="emit('reset')">Reset filter</AppButton>
      </div>
    </div>
  </div>
</template>
