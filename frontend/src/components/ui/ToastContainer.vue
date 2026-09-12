<script setup lang="ts">
import { useToast } from '../../composables/useToast'
import type { ToastType } from '../../composables/useToast'

const { toasts, remove } = useToast()

const labels: Record<ToastType, string> = {
  success: 'Berhasil',
  error: 'Gagal',
  info: 'Info',
}
</script>

<template>
  <div
    class="pointer-events-none fixed top-4 right-4 z-[60] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2"
    aria-live="polite"
  >
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="pointer-events-auto flex items-start justify-between gap-3 border border-neutral-200 border-l-4 border-l-neutral-900 bg-white px-4 py-3 text-sm shadow-sm"
    >
      <div>
        <p class="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
          {{ labels[toast.type] }}
        </p>
        <p class="mt-0.5 text-neutral-900">{{ toast.message }}</p>
      </div>
      <button
        type="button"
        class="-mt-1 shrink-0 text-lg leading-none text-neutral-400 hover:text-neutral-900"
        aria-label="Tutup"
        @click="remove(toast.id)"
      >
        &times;
      </button>
    </div>
  </div>
</template>
