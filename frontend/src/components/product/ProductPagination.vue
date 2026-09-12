<script setup lang="ts">
import { computed } from 'vue'
import type { ProductListMeta } from '../../types/product'

const props = defineProps<{
  meta: ProductListMeta
}>()

const emit = defineEmits<{
  change: [page: number]
}>()

const pages = computed<(number | 'ellipsis')[]>(() => {
  const total = props.meta.totalPages
  if (total <= 1) return []

  const current = props.meta.page
  const start = Math.max(2, current - 2)
  const end = Math.min(total - 1, current + 2)
  const result: (number | 'ellipsis')[] = [1]

  if (start > 2) result.push('ellipsis')
  for (let page = start; page <= end; page += 1) result.push(page)
  if (end < total - 1) result.push('ellipsis')
  result.push(total)

  return result
})

const rangeStart = computed(() =>
  props.meta.total === 0 ? 0 : (props.meta.page - 1) * props.meta.limit + 1,
)
const rangeEnd = computed(() => Math.min(props.meta.page * props.meta.limit, props.meta.total))

const stepClass =
  'border border-neutral-300 px-3 py-1 text-xs font-medium uppercase tracking-wide text-neutral-700 hover:border-neutral-900 disabled:pointer-events-none disabled:opacity-40'
</script>

<template>
  <div
    v-if="meta.total > 0"
    class="flex flex-col items-center justify-between gap-3 pt-1 sm:flex-row"
  >
    <p class="text-xs uppercase tracking-wide text-neutral-500">
      Menampilkan {{ rangeStart }}–{{ rangeEnd }} dari {{ meta.total }} produk
    </p>

    <nav v-if="meta.totalPages > 1" class="flex items-center gap-1" aria-label="Navigasi halaman">
      <button
        type="button"
        :class="stepClass"
        :disabled="meta.page <= 1"
        @click="emit('change', meta.page - 1)"
      >
        Sebelumnya
      </button>

      <template v-for="(page, index) in pages" :key="`${page}-${index}`">
        <span v-if="page === 'ellipsis'" class="px-2 text-sm text-neutral-400">…</span>
        <button
          v-else
          type="button"
          class="min-w-9 border px-3 py-1 text-xs font-medium tabular-nums"
          :class="
            page === meta.page
              ? 'border-neutral-900 bg-neutral-900 text-white'
              : 'border-neutral-300 text-neutral-700 hover:border-neutral-900'
          "
          :aria-current="page === meta.page ? 'page' : undefined"
          @click="emit('change', page)"
        >
          {{ page }}
        </button>
      </template>

      <button
        type="button"
        :class="stepClass"
        :disabled="meta.page >= meta.totalPages"
        @click="emit('change', meta.page + 1)"
      >
        Berikutnya
      </button>
    </nav>
  </div>
</template>
