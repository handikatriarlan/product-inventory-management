<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import placeholderUrl from '../../assets/placeholder.svg'

const props = defineProps<{
  src?: string | null
  alt: string
  size?: 'md' | 'lg'
}>()

const failed = ref(false)

watch(
  () => props.src,
  () => {
    failed.value = false
  },
)

const resolvedSrc = computed(() => (!props.src || failed.value ? placeholderUrl : props.src))

const sizeClass = computed(() =>
  props.size === 'lg' ? 'w-full aspect-square rounded-xl' : 'h-12 w-12 rounded-lg',
)
</script>

<template>
  <img
    :src="resolvedSrc"
    :alt="alt"
    :title="alt"
    loading="lazy"
    :class="sizeClass"
    class="bg-slate-100 object-cover"
    @error="failed = true"
  />
</template>
