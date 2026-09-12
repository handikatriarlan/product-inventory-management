<script setup lang="ts">
import { formatCurrency } from '../../lib/format'
import type { Product } from '../../types/product'
import AppButton from '../ui/AppButton.vue'
import LowStockBadge from './LowStockBadge.vue'
import ProductImage from './ProductImage.vue'
import StatusBadge from './StatusBadge.vue'

defineProps<{
  items: Product[]
  hasMore: boolean
  loadingMore: boolean
}>()

const emit = defineEmits<{
  detail: [product: Product]
  edit: [product: Product]
  delete: [product: Product]
  loadMore: []
}>()
</script>

<template>
  <div class="space-y-2.5">
    <ul class="space-y-2.5">
      <li v-for="product in items" :key="product.id" class="border border-neutral-200 bg-white">
        <button
          type="button"
          class="flex w-full items-start gap-3 overflow-hidden p-3 text-left active:bg-neutral-100"
          :aria-label="`Lihat detail ${product.name}`"
          @click="emit('detail', product)"
        >
          <span class="w-16 shrink-0">
            <ProductImage :src="product.imageUrl" :alt="product.name" size="lg" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="flex items-start justify-between gap-2">
              <span class="min-w-0 flex-1 line-clamp-2 text-sm font-medium leading-snug text-neutral-900">
                {{ product.name }}
              </span>
              <StatusBadge class="shrink-0" :status="product.status" />
            </span>
            <span class="mt-0.5 block truncate font-mono text-[11px] text-neutral-500">
              {{ product.sku }}
            </span>
            <span
              v-if="product.category"
              class="mt-1 block w-fit max-w-full truncate border border-neutral-200 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-neutral-600"
            >
              {{ product.category }}
            </span>
            <span class="mt-1.5 flex items-baseline justify-between gap-2">
              <span class="text-sm font-semibold tabular-nums text-neutral-900">
                {{ formatCurrency(product.price) }}
              </span>
              <span class="flex items-center gap-1.5 text-xs text-neutral-600">
                <span class="tabular-nums">Stok {{ product.stock }}</span>
                <LowStockBadge :stock="product.stock" />
              </span>
            </span>
          </span>
        </button>

        <div class="flex border-t border-neutral-100">
          <button
            type="button"
            class="flex-1 py-2.5 text-xs font-medium uppercase tracking-wide text-neutral-600 active:bg-neutral-100"
            :aria-label="`Lihat detail ${product.name}`"
            @click="emit('detail', product)"
          >
            Detail
          </button>
          <span class="w-px bg-neutral-100" aria-hidden="true"></span>
          <button
            type="button"
            class="flex-1 py-2.5 text-xs font-medium uppercase tracking-wide text-neutral-600 active:bg-neutral-100"
            :aria-label="`Edit ${product.name}`"
            @click="emit('edit', product)"
          >
            Edit
          </button>
          <span class="w-px bg-neutral-100" aria-hidden="true"></span>
          <button
            type="button"
            class="flex-1 py-2.5 text-xs font-medium uppercase tracking-wide text-neutral-900 active:bg-neutral-100"
            :aria-label="`Hapus ${product.name}`"
            @click="emit('delete', product)"
          >
            Hapus
          </button>
        </div>
      </li>
    </ul>

    <AppButton
      v-if="hasMore"
      variant="outline"
      class="w-full"
      :disabled="loadingMore"
      :aria-busy="loadingMore"
      @click="emit('loadMore')"
    >
      {{ loadingMore ? 'Memuat...' : 'Muat lebih banyak' }}
    </AppButton>
    <p v-else-if="items.length > 0" class="py-1 text-center text-[11px] uppercase tracking-wide text-neutral-500">
      Semua produk sudah ditampilkan
    </p>
  </div>
</template>
