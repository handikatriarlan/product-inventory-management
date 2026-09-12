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
</script>

<template>
  <div
    v-if="meta.total > 0"
    class="flex flex-col items-center justify-between gap-3 sm:flex-row"
  >
    <p class="text-sm text-slate-600">
      Menampilkan {{ rangeStart }}–{{ rangeEnd }} dari {{ meta.total }} produk
    </p>

    <nav v-if="meta.totalPages > 1" class="flex items-center gap-1" aria-label="Navigasi halaman">
      <button
        type="button"
        class="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="meta.page <= 1"
        @click="emit('change', meta.page - 1)"
      >
        Sebelumnya
      </button>

      <template v-for="(page, index) in pages" :key="`${page}-${index}`">
        <span v-if="page === 'ellipsis'" class="px-2 text-sm text-slate-400">…</span>
        <button
          v-else
          type="button"
          class="min-w-9 rounded-md border px-3 py-1 text-sm"
          :class="
            page === meta.page
              ? 'border-slate-900 bg-slate-900 text-white'
              : 'border-slate-300 text-slate-700 hover:bg-slate-100'
          "
          :aria-current="page === meta.page ? 'page' : undefined"
          @click="emit('change', page)"
        >
          {{ page }}
        </button>
      </template>

      <button
        type="button"
        class="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="meta.page >= meta.totalPages"
        @click="emit('change', meta.page + 1)"
      >
        Berikutnya
      </button>
    </nav>
  </div>
</template>
