<script setup lang="ts">
import { computed } from 'vue'
import { LOW_STOCK_THRESHOLD } from '../../lib/constants'

const props = defineProps<{
  stock: number
}>()

const isOut = computed(() => props.stock === 0)
const visible = computed(() => props.stock <= LOW_STOCK_THRESHOLD)
</script>

<template>
  <span
    v-if="visible"
    class="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide"
    :class="isOut ? 'bg-neutral-900 px-1.5 py-0.5 text-white' : 'text-neutral-700'"
  >
    <span aria-hidden="true">&#9679;</span>
    {{ isOut ? 'Stok habis' : 'Stok menipis' }}
  </span>
</template>
