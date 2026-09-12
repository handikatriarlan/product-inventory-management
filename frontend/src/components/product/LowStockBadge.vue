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
    class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
    :class="isOut ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'"
  >
    {{ isOut ? 'Stok habis' : 'Stok menipis' }}
  </span>
</template>
