<script setup lang="ts">
import type { ProductStatus } from '../../types/product'

defineProps<{
  status: ProductStatus
}>()
</script>

<template>
  <span
    class="inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
    :class="status === 'ACTIVE' ? 'bg-neutral-900 text-white' : 'border border-neutral-300 text-neutral-500'"
  >
    {{ status === 'ACTIVE' ? 'Aktif' : 'Nonaktif' }}
  </span>
</template>
