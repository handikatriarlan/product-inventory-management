<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ProductForm from '../components/product/ProductForm.vue'
import { useToast } from '../composables/useToast'
import { ApiError, api, getErrorMessage } from '../lib/api'
import type { ProductPayload } from '../types/product'

const router = useRouter()
const { show } = useToast()

const submitting = ref(false)
const uploadProgress = ref<number | null>(null)
const serverErrors = ref<Record<string, string>>({})

async function handleSubmit({ payload, imageFile }: { payload: ProductPayload; imageFile: File | null }) {
  submitting.value = true
  uploadProgress.value = null
  serverErrors.value = {}

  try {
    const response = await api.post<{ data: { id: string } }>('/products', payload)
    const productId = response.data.data.id

    if (imageFile) {
      const formData = new FormData()
      formData.append('image', imageFile)
      uploadProgress.value = 0

      try {
        await api.post(`/products/${productId}/image`, formData, {
          onUploadProgress: (event) => {
            if (event.total) {
              uploadProgress.value = Math.round((event.loaded * 100) / event.total)
            }
          },
        })
      } catch {
        show('Produk dibuat, gambar gagal diunggah', 'error')
        await router.push({ name: 'product-edit', params: { id: productId } })
        return
      }
    }

    show('Produk berhasil ditambahkan', 'success')
    await router.push({ name: 'product-list' })
  } catch (error) {
    if (error instanceof ApiError && error.code === 'CONFLICT') {
      serverErrors.value = { sku: error.message }
    } else if (error instanceof ApiError && error.details) {
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
    <h1 class="text-2xl font-semibold tracking-tight">Tambah Produk</h1>
    <p class="mt-2 text-sm text-slate-600">Lengkapi data produk, lalu simpan.</p>

    <ProductForm
      class="mt-6"
      :submitting="submitting"
      :server-errors="serverErrors"
      submit-label="Tambah Produk"
      @submit="handleSubmit"
      @cancel="router.push({ name: 'product-list' })"
    />

    <div v-if="uploadProgress !== null" class="mt-4">
      <p class="mb-1 text-sm text-slate-600">Mengunggah gambar... {{ uploadProgress }}%</p>
      <progress class="w-full" :value="uploadProgress" max="100"></progress>
    </div>
  </section>
</template>
