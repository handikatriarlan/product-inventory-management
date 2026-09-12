<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import ProductForm from '../components/product/ProductForm.vue'
import { ApiError, api, getErrorMessage } from '../lib/api'
import { useToast } from '../composables/useToast'
import type { Product, ProductPayload } from '../types/product'

const route = useRoute()
const router = useRouter()
const { show } = useToast()

const product = ref<Product | null>(null)
const loading = ref(true)
const notFound = ref(false)
const loadError = ref('')

const submitting = ref(false)
const uploadProgress = ref<number | null>(null)
const serverErrors = ref<Record<string, string>>({})

const initial = computed<Partial<ProductPayload> | undefined>(() => {
  const current = product.value
  if (!current) return undefined
  return {
    sku: current.sku,
    name: current.name,
    description: current.description ?? '',
    price: current.price,
    stock: current.stock,
    category: current.category ?? '',
    status: current.status,
  }
})

async function loadProduct(id: string) {
  loading.value = true
  notFound.value = false
  loadError.value = ''

  try {
    const { data } = await api.get<{ data: Product }>(`/products/${id}`)
    product.value = data.data
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound.value = true
    else loadError.value = getErrorMessage(error)
  } finally {
    loading.value = false
  }
}

watch(
  () => route.params.id,
  (id) => {
    if (typeof id === 'string') loadProduct(id)
  },
  { immediate: true },
)

function goToDetail() {
  router.push({ name: 'product-detail', params: { id: route.params.id } })
}

async function handleSubmit({ payload, imageFile }: { payload: ProductPayload; imageFile: File | null }) {
  const current = product.value
  if (!current) return

  submitting.value = true
  serverErrors.value = {}

  try {
    await api.patch(`/products/${current.id}`, payload)

    if (imageFile) {
      const formData = new FormData()
      formData.append('image', imageFile)
      await api.post(`/products/${current.id}/image`, formData, {
        onUploadProgress: (event) => {
          uploadProgress.value = event.total ? Math.round((event.loaded * 100) / event.total) : 0
        },
      })
    }

    show('Perubahan produk berhasil disimpan', 'success')
    goToDetail()
  } catch (error) {
    if (error instanceof ApiError && error.code === 'CONFLICT') {
      serverErrors.value = { sku: error.message }
    } else if (error instanceof ApiError && error.status === 404) {
      notFound.value = true
    } else if (error instanceof ApiError && error.details?.length) {
      serverErrors.value = Object.fromEntries(error.details.map((detail) => [detail.path, detail.message]))
    }
    show(getErrorMessage(error), 'error')
  } finally {
    submitting.value = false
    uploadProgress.value = null
  }
}
</script>

<template>
  <section class="mx-auto max-w-3xl">
    <h1 class="text-2xl font-semibold tracking-tight">Ubah Produk</h1>

    <div v-if="loading" class="mt-6 space-y-3">
      <div v-for="index in 6" :key="index" class="h-10 animate-pulse rounded bg-slate-200"></div>
    </div>

    <div v-else-if="notFound" class="mt-6 rounded-lg border border-slate-200 bg-white p-8 text-center">
      <p class="text-sm text-slate-600">Produk tidak ditemukan.</p>
      <RouterLink
        :to="{ name: 'product-list' }"
        class="mt-4 inline-block text-sm font-medium text-slate-900 underline"
      >
        Kembali ke daftar produk
      </RouterLink>
    </div>

    <div v-else-if="loadError" class="mt-6 rounded-lg border border-red-200 bg-red-50 p-8 text-center">
      <p class="text-sm text-red-700">{{ loadError }}</p>
      <button
        type="button"
        class="mt-4 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        @click="loadProduct(String(route.params.id))"
      >
        Coba lagi
      </button>
    </div>

    <div v-else-if="product" class="mt-6 rounded-lg border border-slate-200 bg-white p-6">
      <ProductForm
        :key="product.id"
        :initial="initial"
        :existing-image-url="product.imageUrl"
        :submitting="submitting"
        :server-errors="serverErrors"
        submit-label="Simpan Perubahan"
        @submit="handleSubmit"
        @cancel="goToDetail"
      />

      <progress
        v-if="uploadProgress !== null"
        class="mt-4 w-full"
        :value="uploadProgress"
        max="100"
      ></progress>
    </div>
  </section>
</template>
