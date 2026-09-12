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
  delete: [product: Product]
  sort: [field: ProductSortField]
}>()

function sortIndicator(field: ProductSortField, sortBy: ProductSortField, order: 'asc' | 'desc') {
  return sortBy === field ? (order === 'asc' ? '↑' : '↓') : ''
}
</script>

<template>
  <div>
    <div class="hidden overflow-x-auto md:block">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th class="px-3 py-3 font-medium">Gambar</th>
            <th class="px-3 py-3 font-medium">SKU</th>
            <th class="px-3 py-3 font-medium">
              <button type="button" class="inline-flex items-center gap-1" @click="emit('sort', 'name')">
                Nama <span>{{ sortIndicator('name', sortBy, order) }}</span>
              </button>
            </th>
            <th class="px-3 py-3 font-medium">
              <button type="button" class="inline-flex items-center gap-1" @click="emit('sort', 'price')">
                Harga <span>{{ sortIndicator('price', sortBy, order) }}</span>
              </button>
            </th>
            <th class="px-3 py-3 font-medium">
              <button type="button" class="inline-flex items-center gap-1" @click="emit('sort', 'stock')">
                Stok <span>{{ sortIndicator('stock', sortBy, order) }}</span>
              </button>
            </th>
            <th class="px-3 py-3 font-medium">Status</th>
            <th class="px-3 py-3 font-medium">Dibuat</th>
            <th class="px-3 py-3 text-right font-medium">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="product in items" :key="product.id" class="hover:bg-slate-50">
            <td class="px-3 py-3">
              <ProductImage :src="product.imageUrl" :alt="product.name" />
            </td>
            <td class="px-3 py-3 font-mono text-xs text-slate-500">{{ product.sku }}</td>
            <td class="px-3 py-3">
              <p class="font-medium text-slate-900">{{ product.name }}</p>
              <p v-if="product.category" class="text-xs text-slate-500">{{ product.category }}</p>
            </td>
            <td class="px-3 py-3 text-slate-700">{{ formatCurrency(product.price) }}</td>
            <td class="px-3 py-3">
              <div class="flex items-center gap-2">
                <span class="text-slate-700">{{ product.stock }}</span>
                <LowStockBadge :stock="product.stock" />
              </div>
            </td>
            <td class="px-3 py-3"><StatusBadge :status="product.status" /></td>
            <td class="px-3 py-3 text-slate-500">{{ formatDate(product.createdAt) }}</td>
            <td class="px-3 py-3">
              <div class="flex justify-end gap-3">
                <RouterLink
                  :to="{ name: 'product-detail', params: { id: product.id } }"
                  class="text-slate-600 hover:text-slate-900"
                >
                  Detail
                </RouterLink>
                <RouterLink
                  :to="{ name: 'product-edit', params: { id: product.id } }"
                  class="text-slate-600 hover:text-slate-900"
                >
                  Edit
                </RouterLink>
                <button
                  type="button"
                  class="text-red-600 hover:text-red-700"
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

    <div class="space-y-3 md:hidden">
      <article
        v-for="product in items"
        :key="product.id"
        class="rounded-xl border border-slate-200 bg-white p-4"
      >
        <div class="flex gap-3">
          <ProductImage :src="product.imageUrl" :alt="product.name" class="h-16 w-16" />
          <div class="min-w-0 flex-1">
            <p class="font-medium text-slate-900">{{ product.name }}</p>
            <p class="font-mono text-xs text-slate-500">{{ product.sku }}</p>
            <p v-if="product.category" class="text-xs text-slate-500">{{ product.category }}</p>
          </div>
          <StatusBadge :status="product.status" />
        </div>

        <dl class="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div>
            <dt class="text-xs text-slate-500">Harga</dt>
            <dd class="text-slate-700">{{ formatCurrency(product.price) }}</dd>
          </div>
          <div>
            <dt class="text-xs text-slate-500">Stok</dt>
            <dd class="flex items-center gap-2 text-slate-700">
              {{ product.stock }}
              <LowStockBadge :stock="product.stock" />
            </dd>
          </div>
          <div class="col-span-2">
            <dt class="text-xs text-slate-500">Dibuat</dt>
            <dd class="text-slate-600">{{ formatDate(product.createdAt) }}</dd>
          </div>
        </dl>

        <div class="mt-3 flex gap-4 text-sm">
          <RouterLink
            :to="{ name: 'product-detail', params: { id: product.id } }"
            class="text-slate-600 hover:text-slate-900"
          >
            Detail
          </RouterLink>
          <RouterLink
            :to="{ name: 'product-edit', params: { id: product.id } }"
            class="text-slate-600 hover:text-slate-900"
          >
            Edit
          </RouterLink>
          <button type="button" class="text-red-600 hover:text-red-700" @click="emit('delete', product)">
            Hapus
          </button>
        </div>
      </article>
    </div>
  </div>
</template>
