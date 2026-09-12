<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import ConfirmDialog from '../components/ui/ConfirmDialog.vue'
import LowStockBadge from '../components/product/LowStockBadge.vue'
import ProductImage from '../components/product/ProductImage.vue'
import StatusBadge from '../components/product/StatusBadge.vue'
import { useToast } from '../composables/useToast'
import { api, ApiError, getErrorMessage } from '../lib/api'
import { formatCurrency, formatDate } from '../lib/format'
import type { Product } from '../types/product'

const route = useRoute()
const router = useRouter()
const { show } = useToast()

const product = ref<Product | null>(null)
const loading = ref(true)
const notFound = ref(false)
const loadError = ref('')
const confirmOpen = ref(false)
const deleting = ref(false)

async function loadProduct(id: string) {
  loading.value = true
  notFound.value = false
  loadError.value = ''
  try {
    const { data } = await api.get<{ data: Product }>(`/products/${id}`)
    product.value = data.data
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound.value = true
    } else {
      loadError.value = getErrorMessage(error)
    }
  } finally {
    loading.value = false
  }
}

function retry() {
  const id = route.params.id
  if (typeof id === 'string') loadProduct(id)
}

async function handleDelete() {
  if (!product.value) return
  deleting.value = true
  try {
    await api.delete(`/products/${product.value.id}`)
    show('Produk berhasil dihapus', 'success')
    router.push({ name: 'product-list' })
  } catch (error) {
    show(getErrorMessage(error), 'error')
  } finally {
    deleting.value = false
    confirmOpen.value = false
  }
}

watch(
  () => route.params.id,
  (id) => {
    if (typeof id === 'string') loadProduct(id)
  },
  { immediate: true },
)
</script>

<template>
  <section class="mx-auto max-w-4xl">
    <div v-if="loading" class="animate-pulse space-y-6">
      <div class="h-8 w-48 rounded bg-slate-200" />
      <div class="grid gap-6 md:grid-cols-2">
        <div class="aspect-square w-full rounded-xl bg-slate-200" />
        <div class="space-y-3">
          <div class="h-5 w-3/4 rounded bg-slate-200" />
          <div class="h-5 w-1/2 rounded bg-slate-200" />
          <div class="h-5 w-2/3 rounded bg-slate-200" />
        </div>
      </div>
    </div>

    <div
      v-else-if="notFound"
      class="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center"
    >
      <h1 class="text-xl font-semibold text-slate-900">Produk tidak ditemukan</h1>
      <p class="mt-2 text-sm text-slate-600">Produk yang Anda cari tidak tersedia atau telah dihapus.</p>
      <RouterLink
        :to="{ name: 'product-list' }"
        class="mt-4 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
      >
        Kembali ke daftar
      </RouterLink>
    </div>

    <div v-else-if="loadError" class="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center">
      <p class="text-sm text-red-700">{{ loadError }}</p>
      <button
        type="button"
        class="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        @click="retry"
      >
        Coba lagi
      </button>
    </div>

    <div v-else-if="product" class="space-y-6">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="text-sm text-slate-500">SKU: {{ product.sku }}</p>
          <h1 class="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            {{ product.name }}
          </h1>
        </div>
        <div class="flex gap-2">
          <RouterLink
            :to="{ name: 'product-edit', params: { id: product.id } }"
            class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Edit
          </RouterLink>
          <button
            type="button"
            class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            @click="confirmOpen = true"
          >
            Hapus
          </button>
        </div>
      </div>

      <div class="grid gap-6 md:grid-cols-2">
        <ProductImage :src="product.imageUrl" :alt="product.name" size="lg" />

        <dl class="space-y-4">
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">Status</dt>
            <dd class="mt-1"><StatusBadge :status="product.status" /></dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">Harga</dt>
            <dd class="mt-1 text-lg font-semibold text-slate-900">
              {{ formatCurrency(product.price) }}
            </dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">Stok</dt>
            <dd class="mt-1 flex items-center gap-2 text-slate-900">
              {{ product.stock }}
              <LowStockBadge :stock="product.stock" />
            </dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">Kategori</dt>
            <dd class="mt-1 text-slate-900">{{ product.category || '-' }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">Deskripsi</dt>
            <dd class="mt-1 whitespace-pre-line text-slate-700">{{ product.description || '-' }}</dd>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">Dibuat</dt>
              <dd class="mt-1 text-sm text-slate-700">{{ formatDate(product.createdAt) }}</dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">Diperbarui</dt>
              <dd class="mt-1 text-sm text-slate-700">{{ formatDate(product.updatedAt) }}</dd>
            </div>
          </div>
        </dl>
      </div>
    </div>

    <ConfirmDialog
      :open="confirmOpen"
      title="Hapus produk"
      :message="`Yakin ingin menghapus ${product?.name ?? 'produk ini'}?`"
      :loading="deleting"
      @confirm="handleDelete"
      @cancel="confirmOpen = false"
    />
  </section>
</template>
