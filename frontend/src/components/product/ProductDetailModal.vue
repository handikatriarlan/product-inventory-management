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
    <div class="grid gap-6 sm:grid-cols-[minmax(0,220px)_1fr]">
      <ProductImage :src="product.imageUrl" :alt="product.name" size="lg" />

      <div class="space-y-4">
        <div>
          <p class="font-mono text-xs uppercase tracking-wide text-neutral-500">{{ product.sku }}</p>
          <h3 class="mt-1 text-xl font-semibold tracking-tight">{{ product.name }}</h3>
          <div class="mt-2 flex items-center gap-2">
            <StatusBadge :status="product.status" />
            <LowStockBadge :stock="product.stock" />
          </div>
        </div>

        <dl class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt class="text-xs uppercase tracking-wide text-neutral-500">Harga</dt>
            <dd class="mt-0.5 font-medium">{{ formatCurrency(product.price) }}</dd>
          </div>
          <div>
            <dt class="text-xs uppercase tracking-wide text-neutral-500">Stok</dt>
            <dd class="mt-0.5 font-medium">{{ product.stock }}</dd>
          </div>
          <div>
            <dt class="text-xs uppercase tracking-wide text-neutral-500">Kategori</dt>
            <dd class="mt-0.5 font-medium">{{ product.category ?? '—' }}</dd>
          </div>
          <div>
            <dt class="text-xs uppercase tracking-wide text-neutral-500">Diperbarui</dt>
            <dd class="mt-0.5 font-medium">{{ formatDate(product.updatedAt) }}</dd>
          </div>
          <div class="col-span-2">
            <dt class="text-xs uppercase tracking-wide text-neutral-500">Deskripsi</dt>
            <dd class="mt-0.5 whitespace-pre-line text-neutral-700">
              {{ product.description ?? 'Tidak ada deskripsi.' }}
            </dd>
          </div>
          <div class="col-span-2">
            <dt class="text-xs uppercase tracking-wide text-neutral-500">Dibuat</dt>
            <dd class="mt-0.5 font-medium">{{ formatDate(product.createdAt) }}</dd>
          </div>
        </dl>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-between gap-2">
        <AppButton variant="danger" @click="confirmOpen = true">Hapus</AppButton>
        <AppButton @click="emit('edit')">Edit</AppButton>
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
