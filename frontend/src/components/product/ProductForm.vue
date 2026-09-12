<script setup lang="ts">
import { onBeforeUnmount, reactive, ref } from 'vue'
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES, MAX_IMAGE_SIZE_MB } from '../../lib/constants'
import type { ProductPayload, ProductStatus } from '../../types/product'
import AppButton from '../ui/AppButton.vue'

const props = defineProps<{
  initial?: Partial<ProductPayload>
  submitting?: boolean
  submitLabel?: string
  existingImageUrl?: string | null
  serverErrors?: Record<string, string>
  uploadProgress?: number | null
}>()

const emit = defineEmits<{
  submit: [{ payload: ProductPayload; imageFile: File | null }]
  cancel: []
}>()

const MAX_PRICE = 9_999_999_999.99
const MAX_STOCK = 2_147_483_647

const labelClass = 'block text-xs font-medium uppercase tracking-wide text-neutral-500'
const inputClass =
  'mt-1 w-full border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none'

const form = reactive({
  sku: props.initial?.sku ?? '',
  name: props.initial?.name ?? '',
  description: props.initial?.description ?? '',
  price: (props.initial?.price ?? '') as number | '',
  stock: (props.initial?.stock ?? '') as number | '',
  category: props.initial?.category ?? '',
  status: (props.initial?.status ?? 'ACTIVE') as ProductStatus,
})

const errors = reactive<Record<string, string>>({})
const fileInput = ref<HTMLInputElement | null>(null)
const imageFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const fileError = ref('')

function errorFor(field: string): string | undefined {
  return props.serverErrors?.[field] || errors[field]
}

function fieldClass(field: string): string[] {
  return [inputClass, errorFor(field) ? 'border-neutral-900 bg-neutral-50' : '']
}

function validate(): boolean {
  for (const key of Object.keys(errors)) delete errors[key]

  const sku = form.sku.trim()
  if (!sku) errors.sku = 'SKU wajib diisi'
  else if (sku.length > 50) errors.sku = 'SKU maksimal 50 karakter'

  const name = form.name.trim()
  if (!name) errors.name = 'Nama wajib diisi'
  else if (name.length > 200) errors.name = 'Nama maksimal 200 karakter'

  if (form.description.trim().length > 2000) errors.description = 'Deskripsi maksimal 2000 karakter'

  const price = form.price
  if (price === '') errors.price = 'Harga wajib diisi'
  else if (typeof price !== 'number' || Number.isNaN(price)) errors.price = 'Harga harus berupa angka'
  else if (price < 0) errors.price = 'Harga tidak boleh negatif'
  else if (price > MAX_PRICE) errors.price = 'Harga maksimal 9.999.999.999,99'
  else if (Number(price.toFixed(2)) !== price) errors.price = 'Harga maksimal 2 desimal'

  const stock = form.stock
  if (stock === '') errors.stock = 'Stok wajib diisi'
  else if (typeof stock !== 'number' || !Number.isInteger(stock)) errors.stock = 'Stok harus bilangan bulat'
  else if (stock < 0) errors.stock = 'Stok tidak boleh negatif'
  else if (stock > MAX_STOCK) errors.stock = 'Stok maksimal 2.147.483.647'

  if (form.category.trim().length > 100) errors.category = 'Kategori maksimal 100 karakter'

  return Object.keys(errors).length === 0
}

function buildPayload(): ProductPayload {
  return {
    sku: form.sku.trim(),
    name: form.name.trim(),
    description: form.description.trim() || null,
    price: Number(form.price),
    stock: Number(form.stock),
    category: form.category.trim() || null,
    status: form.status,
  }
}

function revokePreview() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }
}

function clearImage() {
  revokePreview()
  imageFile.value = null
  fileError.value = ''
  if (fileInput.value) fileInput.value.value = ''
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    clearImage()
    fileError.value = 'Format gambar harus JPG, PNG, atau WEBP'
    return
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    clearImage()
    fileError.value = `Ukuran gambar maksimal ${MAX_IMAGE_SIZE_MB} MB`
    return
  }

  revokePreview()
  fileError.value = ''
  imageFile.value = file
  previewUrl.value = URL.createObjectURL(file)
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function handleSubmit() {
  if (!validate()) {
    const firstField = Object.keys(errors)[0]
    if (firstField) document.getElementById(`field-${firstField}`)?.focus()
    return
  }

  emit('submit', { payload: buildPayload(), imageFile: imageFile.value })
}

onBeforeUnmount(revokePreview)
</script>

<template>
  <form class="space-y-6" novalidate @submit.prevent="handleSubmit">
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <label for="field-sku" :class="labelClass">SKU</label>
        <input
          id="field-sku"
          v-model="form.sku"
          type="text"
          maxlength="50"
          :class="fieldClass('sku')"
          :aria-invalid="Boolean(errorFor('sku'))"
          :aria-describedby="errorFor('sku') ? 'error-sku' : undefined"
        />
        <p v-if="errorFor('sku')" id="error-sku" class="mt-1 text-xs font-medium text-neutral-900">
          {{ errorFor('sku') }}
        </p>
      </div>

      <div>
        <label for="field-name" :class="labelClass">Nama</label>
        <input
          id="field-name"
          v-model="form.name"
          type="text"
          maxlength="200"
          :class="fieldClass('name')"
          :aria-invalid="Boolean(errorFor('name'))"
          :aria-describedby="errorFor('name') ? 'error-name' : undefined"
        />
        <p v-if="errorFor('name')" id="error-name" class="mt-1 text-xs font-medium text-neutral-900">
          {{ errorFor('name') }}
        </p>
      </div>

      <div class="md:col-span-2">
        <label for="field-description" :class="labelClass">Deskripsi</label>
        <textarea
          id="field-description"
          v-model="form.description"
          rows="3"
          :class="fieldClass('description')"
          :aria-invalid="Boolean(errorFor('description'))"
          :aria-describedby="errorFor('description') ? 'error-description' : undefined"
        ></textarea>
        <p v-if="errorFor('description')" id="error-description" class="mt-1 text-xs font-medium text-neutral-900">
          {{ errorFor('description') }}
        </p>
      </div>

      <div>
        <label for="field-price" :class="labelClass">Harga (Rp)</label>
        <input
          id="field-price"
          v-model.number="form.price"
          type="number"
          min="0"
          step="0.01"
          :class="fieldClass('price')"
          :aria-invalid="Boolean(errorFor('price'))"
          :aria-describedby="errorFor('price') ? 'error-price' : undefined"
        />
        <p v-if="errorFor('price')" id="error-price" class="mt-1 text-xs font-medium text-neutral-900">
          {{ errorFor('price') }}
        </p>
      </div>

      <div>
        <label for="field-stock" :class="labelClass">Stok</label>
        <input
          id="field-stock"
          v-model.number="form.stock"
          type="number"
          min="0"
          step="1"
          :class="fieldClass('stock')"
          :aria-invalid="Boolean(errorFor('stock'))"
          :aria-describedby="errorFor('stock') ? 'error-stock' : undefined"
        />
        <p v-if="errorFor('stock')" id="error-stock" class="mt-1 text-xs font-medium text-neutral-900">
          {{ errorFor('stock') }}
        </p>
      </div>

      <div>
        <label for="field-category" :class="labelClass">Kategori</label>
        <input
          id="field-category"
          v-model="form.category"
          type="text"
          maxlength="100"
          :class="fieldClass('category')"
          :aria-invalid="Boolean(errorFor('category'))"
          :aria-describedby="errorFor('category') ? 'error-category' : undefined"
        />
        <p v-if="errorFor('category')" id="error-category" class="mt-1 text-xs font-medium text-neutral-900">
          {{ errorFor('category') }}
        </p>
      </div>

      <div>
        <label for="field-status" :class="labelClass">Status</label>
        <select id="field-status" v-model="form.status" :class="inputClass">
          <option value="ACTIVE">Aktif</option>
          <option value="INACTIVE">Nonaktif</option>
        </select>
      </div>

      <div class="md:col-span-2">
        <label for="field-image" :class="labelClass">Gambar</label>
        <input
          id="field-image"
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          class="mt-1 block w-full text-sm text-neutral-600 file:mr-3 file:border file:border-neutral-900 file:bg-neutral-900 file:px-3 file:py-1.5 file:text-xs file:font-medium file:uppercase file:tracking-wide file:text-white hover:file:bg-neutral-700"
          @change="handleFileChange"
        />
        <p class="mt-1 text-xs text-neutral-500">JPG, PNG, atau WEBP. Maksimal {{ MAX_IMAGE_SIZE_MB }} MB.</p>
        <p v-if="fileError" class="mt-1 text-xs font-medium text-neutral-900">{{ fileError }}</p>

        <div v-if="previewUrl || existingImageUrl" class="mt-3 flex items-center gap-3">
          <img
            :src="previewUrl ?? existingImageUrl ?? ''"
            alt="Pratinjau gambar produk"
            class="h-20 w-20 border border-neutral-200 bg-neutral-100 object-cover"
          />
          <div class="text-sm text-neutral-600">
            <p v-if="imageFile">{{ imageFile.name }} &middot; {{ formatFileSize(imageFile.size) }}</p>
            <p v-else>Gambar saat ini</p>
            <AppButton variant="ghost" size="sm" class="mt-1 -ml-2.5" @click="clearImage">Hapus pilihan</AppButton>
          </div>
        </div>
      </div>
    </div>

    <div v-if="uploadProgress !== null && uploadProgress !== undefined" class="space-y-1">
      <div class="flex justify-between text-xs uppercase tracking-wide text-neutral-500">
        <span>Mengunggah gambar</span>
        <span>{{ uploadProgress }}%</span>
      </div>
      <progress class="h-1 w-full accent-neutral-900" :value="uploadProgress" max="100"></progress>
    </div>

    <div class="flex items-center justify-end gap-3">
      <AppButton variant="outline" :disabled="submitting" @click="emit('cancel')">Batal</AppButton>
      <AppButton type="submit" :disabled="submitting">
        {{ submitting ? 'Menyimpan...' : (submitLabel ?? 'Simpan') }}
      </AppButton>
    </div>
  </form>
</template>
