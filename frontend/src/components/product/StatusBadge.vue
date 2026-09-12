<script setup lang="ts">
import type { ProductStatus } from '../../types/product'

defineProps<{
  status: ProductStatus
}>()
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
    :class="status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'"
  >
    {{ status === 'ACTIVE' ? 'Aktif' : 'Nonaktif' }}
  </span>
</template>
