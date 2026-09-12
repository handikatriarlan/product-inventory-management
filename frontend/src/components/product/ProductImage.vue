<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import placeholderUrl from '../../assets/placeholder.svg'

const props = defineProps<{
  src?: string | null
  alt: string
}>()

const failed = ref(false)

watch(
  () => props.src,
  () => {
    failed.value = false
  },
)

const resolvedSrc = computed(() => (!props.src || failed.value ? placeholderUrl : props.src))
</script>

<template>
  <img
    :src="resolvedSrc"
    :alt="alt"
    :title="alt"
    loading="lazy"
    class="h-12 w-12 rounded-lg bg-slate-100 object-cover"
    @error="failed = true"
  />
</template>
