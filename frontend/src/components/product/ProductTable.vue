<script setup lang="ts">
import { formatCurrency, formatDate } from '../../lib/format'
import type { Product, ProductSortField } from '../../types/product'
import LowStockBadge from './LowStockBadge.vue'
import ProductImage from './ProductImage.vue'
import StatusBadge from './StatusBadge.vue'

defineProps<{
  items: Product[]
  sortBy: ProductSortField
  order: 'asc' | 'desc'
}>()

const emit = defineEmits<{
  detail: [product: Product]
  edit: [product: Product]
  delete: [product: Product]
  sort: [field: ProductSortField]
}>()

function sortIndicator(field: ProductSortField, sortBy: ProductSortField, order: 'asc' | 'desc') {
  return sortBy === field ? (order === 'asc' ? '↑' : '↓') : ''
}

function ariaSort(field: ProductSortField, sortBy: ProductSortField, order: 'asc' | 'desc') {
  if (sortBy !== field) return 'none'
  return order === 'asc' ? 'ascending' : 'descending'
}
</script>

<template>
  <div>
    <div class="hidden overflow-x-auto border border-neutral-200 md:block">
      <table class="w-full text-left text-sm">
        <thead
          class="border-b border-neutral-200 bg-neutral-50 text-[11px] uppercase tracking-widest text-neutral-500"
        >
          <tr>
            <th scope="col" class="px-4 py-3 font-medium">Produk</th>
            <th scope="col" class="px-4 py-3 font-medium" :aria-sort="ariaSort('name', sortBy, order)">
              <button
                type="button"
                class="inline-flex items-center gap-1 uppercase tracking-widest hover:text-neutral-900"
                @click="emit('sort', 'name')"
              >
                Nama <span aria-hidden="true">{{ sortIndicator('name', sortBy, order) }}</span>
              </button>
            </th>
            <th
              scope="col"
              class="px-4 py-3 text-right font-medium"
              :aria-sort="ariaSort('price', sortBy, order)"
            >
              <button
                type="button"
                class="inline-flex items-center gap-1 uppercase tracking-widest hover:text-neutral-900"
                @click="emit('sort', 'price')"
              >
                Harga <span aria-hidden="true">{{ sortIndicator('price', sortBy, order) }}</span>
              </button>
            </th>
            <th
              scope="col"
              class="px-4 py-3 text-right font-medium"
              :aria-sort="ariaSort('stock', sortBy, order)"
            >
              <button
                type="button"
                class="inline-flex items-center gap-1 uppercase tracking-widest hover:text-neutral-900"
                @click="emit('sort', 'stock')"
              >
                Stok <span aria-hidden="true">{{ sortIndicator('stock', sortBy, order) }}</span>
              </button>
            </th>
            <th scope="col" class="px-4 py-3 font-medium">Status</th>
            <th scope="col" class="px-4 py-3 font-medium" :aria-sort="ariaSort('createdAt', sortBy, order)">
              <button
                type="button"
                class="inline-flex items-center gap-1 uppercase tracking-widest hover:text-neutral-900"
                @click="emit('sort', 'createdAt')"
              >
                Dibuat <span aria-hidden="true">{{ sortIndicator('createdAt', sortBy, order) }}</span>
              </button>
            </th>
            <th scope="col" class="px-4 py-3 text-right font-medium">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-100">
          <tr v-for="product in items" :key="product.id" class="hover:bg-neutral-50">
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <ProductImage :src="product.imageUrl" :alt="product.name" />
                <span class="font-mono text-xs text-neutral-500">{{ product.sku }}</span>
              </div>
            </td>
            <td class="px-4 py-3">
              <p class="break-words font-medium text-neutral-900">{{ product.name }}</p>
              <p v-if="product.category" class="text-xs text-neutral-500">{{ product.category }}</p>
            </td>
            <td class="px-4 py-3 text-right tabular-nums text-neutral-700">
              {{ formatCurrency(product.price) }}
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-2">
                <span class="tabular-nums text-neutral-700">{{ product.stock }}</span>
                <LowStockBadge :stock="product.stock" />
              </div>
            </td>
            <td class="px-4 py-3"><StatusBadge :status="product.status" /></td>
            <td class="px-4 py-3 whitespace-nowrap text-xs text-neutral-500">
              {{ formatDate(product.createdAt) }}
            </td>
            <td class="px-4 py-3">
              <div class="flex justify-end gap-4 text-xs font-medium uppercase tracking-wide">
                <button
                  type="button"
                  class="text-neutral-500 hover:text-neutral-900"
                  @click="emit('detail', product)"
                >
                  Detail
                </button>
                <button
                  type="button"
                  class="text-neutral-500 hover:text-neutral-900"
                  @click="emit('edit', product)"
                >
                  Edit
                </button>
                <button
                  type="button"
                  class="text-neutral-900 hover:underline"
                  @click="emit('delete', product)"
                >
                  Hapus
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
