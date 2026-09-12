<script setup lang="ts">
import { ref } from 'vue'
import { api, ApiError, getErrorMessage } from '../../lib/api'
import { useToast } from '../../composables/useToast'
import type { Product, ProductPayload } from '../../types/product'
import AppModal from '../ui/AppModal.vue'
import ProductForm from './ProductForm.vue'

const props = defineProps<{
  mode: 'create' | 'edit'
  product?: Product | null
}>()

const emit = defineEmits<{ close: []; saved: [] }>()

const { show } = useToast()
const submitting = ref(false)
const uploadProgress = ref<number | null>(null)
const serverErrors = ref<Record<string, string>>({})

const initial = props.product
  ? {
      sku: props.product.sku,
      name: props.product.name,
      description: props.product.description ?? '',
      price: props.product.price,
      stock: props.product.stock,
      category: props.product.category ?? '',
      status: props.product.status,
    }
  : undefined

async function uploadImage(productId: string, imageFile: File) {
  const formData = new FormData()
  formData.append('image', imageFile)
  await api.post(`/products/${productId}/image`, formData, {
    onUploadProgress: (event) => {
      uploadProgress.value = event.total ? Math.round((event.loaded * 100) / event.total) : null
    },
  })
}

function applyValidationErrors(error: unknown) {
  if (!(error instanceof ApiError)) return
  if (error.code === 'CONFLICT') {
    serverErrors.value = { sku: error.message }
    return
  }
  if (error.details?.length) {
    serverErrors.value = Object.fromEntries(error.details.map((detail) => [detail.path, detail.message]))
  }
}

function clearServerError(field: string) {
  if (!serverErrors.value[field]) return
  const next = { ...serverErrors.value }
  delete next[field]
  serverErrors.value = next
}

async function handleSubmit({ payload, imageFile }: { payload: ProductPayload; imageFile: File | null }) {
  submitting.value = true
  serverErrors.value = {}
  try {
    const { data } =
      props.mode === 'create'
        ? await api.post<{ data: Product }>('/products', payload)
        : await api.patch<{ data: Product }>(`/products/${props.product?.id}`, payload)

    if (imageFile) {
      try {
        await uploadImage(data.data.id, imageFile)
      } catch (error) {
        show(`Produk tersimpan, tetapi gambar gagal diunggah: ${getErrorMessage(error)}`, 'error')
      }
    }

    show(props.mode === 'create' ? 'Produk berhasil ditambahkan' : 'Perubahan berhasil disimpan', 'success')
    emit('saved')
  } catch (error) {
    applyValidationErrors(error)
    show(getErrorMessage(error), 'error')
  } finally {
    submitting.value = false
    uploadProgress.value = null
  }
}
</script>

<template>
  <AppModal
    :open="true"
    :title="mode === 'create' ? 'Tambah Produk' : 'Ubah Produk'"
    size="lg"
    @close="emit('close')"
  >
    <ProductForm
      :initial="initial"
      :submitting="submitting"
      :upload-progress="uploadProgress"
      :existing-image-url="product?.imageUrl ?? null"
      :server-errors="serverErrors"
      :submit-label="mode === 'create' ? 'Tambah Produk' : 'Simpan Perubahan'"
      @submit="handleSubmit"
      @clear-server-error="clearServerError"
      @cancel="emit('close')"
    />
  </AppModal>
</template>
