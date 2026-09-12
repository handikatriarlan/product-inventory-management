<script setup lang="ts">
import { ref } from 'vue'
import { getErrorMessage } from '../../lib/api'
import { useToast } from '../../composables/useToast'
import { useProductStore } from '../../stores/product'
import { formatCurrency, formatDate } from '../../lib/format'
import type { Product } from '../../types/product'
import AppButton from '../ui/AppButton.vue'
import AppModal from '../ui/AppModal.vue'
import ConfirmDialog from '../ui/ConfirmDialog.vue'
import LowStockBadge from './LowStockBadge.vue'
import ProductImage from './ProductImage.vue'
import StatusBadge from './StatusBadge.vue'

const props = defineProps<{ product: Product }>()
const emit = defineEmits<{ close: []; edit: []; deleted: [] }>()

const store = useProductStore()
const { show } = useToast()
const confirmOpen = ref(false)
const deleting = ref(false)

async function confirmDelete() {
  deleting.value = true
  try {
    await store.remove(props.product.id)
    show(`Produk "${props.product.name}" berhasil dihapus`)
    emit('deleted')
  } catch (error) {
    show(getErrorMessage(error), 'error')
  } finally {
    deleting.value = false
    confirmOpen.value = false
  }
}
</script>

<template>
  <AppModal :open="true" title="Detail Produk" size="lg" @close="emit('close')">
    <div class="grid grid-cols-[72px_minmax(0,1fr)] gap-4 sm:grid-cols-[minmax(0,220px)_1fr] sm:gap-6">
      <ProductImage :src="product.imageUrl" :alt="product.name" size="lg" />

      <div class="space-y-4">
        <div>
          <p class="font-mono text-[11px] uppercase tracking-wide text-neutral-500 sm:text-xs">{{ product.sku }}</p>
          <h3 class="mt-1 break-words text-lg font-semibold tracking-tight sm:text-xl">{{ product.name }}</h3>
          <div class="mt-2 flex items-center gap-2">
            <StatusBadge :status="product.status" />
            <LowStockBadge :stock="product.stock" />
          </div>
        </div>

        <dl class="text-sm sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-3">
          <div class="flex items-baseline justify-between gap-3 border-b border-neutral-100 py-2 sm:block sm:border-0 sm:py-0">
            <dt class="text-xs uppercase tracking-wide text-neutral-500">Harga</dt>
            <dd class="font-medium tabular-nums sm:mt-0.5">{{ formatCurrency(product.price) }}</dd>
          </div>
          <div class="flex items-baseline justify-between gap-3 border-b border-neutral-100 py-2 sm:block sm:border-0 sm:py-0">
            <dt class="text-xs uppercase tracking-wide text-neutral-500">Stok</dt>
            <dd class="font-medium tabular-nums sm:mt-0.5">{{ product.stock }}</dd>
          </div>
          <div class="flex items-baseline justify-between gap-3 border-b border-neutral-100 py-2 sm:block sm:border-0 sm:py-0">
            <dt class="text-xs uppercase tracking-wide text-neutral-500">Kategori</dt>
            <dd class="min-w-0 break-words text-right font-medium sm:mt-0.5 sm:text-left">{{ product.category ?? '—' }}</dd>
          </div>
          <div class="flex items-baseline justify-between gap-3 border-b border-neutral-100 py-2 sm:block sm:border-0 sm:py-0">
            <dt class="text-xs uppercase tracking-wide text-neutral-500">Diperbarui</dt>
            <dd class="font-medium sm:mt-0.5">{{ formatDate(product.updatedAt) }}</dd>
          </div>
          <div class="border-b border-neutral-100 py-2 sm:col-span-2 sm:border-0 sm:py-0">
            <dt class="text-xs uppercase tracking-wide text-neutral-500">Deskripsi</dt>
            <dd class="mt-1 whitespace-pre-line break-words text-neutral-700">
              {{ product.description ?? 'Tidak ada deskripsi.' }}
            </dd>
          </div>
          <div class="py-2 sm:col-span-2 sm:py-0">
            <dt class="text-xs uppercase tracking-wide text-neutral-500">Dibuat</dt>
            <dd class="font-medium sm:mt-0.5">{{ formatDate(product.createdAt) }}</dd>
          </div>
        </dl>
      </div>
    </div>

    <template #footer>
      <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <AppButton variant="danger" class="w-full sm:w-auto" @click="confirmOpen = true">Hapus</AppButton>
        <AppButton class="w-full sm:w-auto" @click="emit('edit')">Edit</AppButton>
      </div>
    </template>
  </AppModal>

  <ConfirmDialog
    :open="confirmOpen"
    title="Hapus produk"
    :message="`Yakin ingin menghapus &quot;${product.name}&quot;? Tindakan ini tidak dapat dibatalkan.`"
    :loading="deleting"
    @confirm="confirmDelete"
    @cancel="confirmOpen = false"
  />
</template>
