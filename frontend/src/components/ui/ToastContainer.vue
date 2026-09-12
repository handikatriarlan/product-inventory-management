<script setup lang="ts">
import { useToast } from '../../composables/useToast'
import type { ToastType } from '../../composables/useToast'

const { toasts, remove } = useToast()

const typeClasses: Record<ToastType, string> = {
  success: 'border-emerald-300 bg-emerald-50 text-emerald-800',
  error: 'border-red-300 bg-red-50 text-red-800',
  info: 'border-slate-300 bg-white text-slate-800',
}
</script>

<template>
  <div
    class="pointer-events-none fixed top-4 right-4 z-50 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2"
    aria-live="polite"
  >
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="pointer-events-auto flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm shadow-sm"
      :class="typeClasses[toast.type]"
    >
      <span>{{ toast.message }}</span>
      <button
        type="button"
        class="shrink-0 text-lg leading-none opacity-60 transition-opacity hover:opacity-100"
        aria-label="Tutup"
        @click="remove(toast.id)"
      >
        &times;
      </button>
    </div>
  </div>
</template>
