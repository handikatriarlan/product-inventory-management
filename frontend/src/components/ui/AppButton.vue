<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'solid' | 'outline' | 'ghost' | 'danger'
    size?: 'sm' | 'md'
    type?: 'button' | 'submit'
    disabled?: boolean
  }>(),
  { variant: 'solid', size: 'md', type: 'button' },
)

const variantClass = computed(
  () =>
    ({
      solid: 'bg-neutral-900 text-white hover:bg-neutral-700',
      outline: 'border border-neutral-300 bg-white text-neutral-900 hover:border-neutral-900',
      ghost: 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
      danger: 'border border-neutral-900 bg-white text-neutral-900 hover:bg-neutral-900 hover:text-white',
    })[props.variant],
)

const classes = computed(() => [
  'inline-flex items-center justify-center gap-1.5 font-medium uppercase tracking-wide transition-colors',
  'disabled:pointer-events-none disabled:opacity-40',
  props.size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-4 py-2 text-sm',
  variantClass.value,
])
</script>

<template>
  <button :type="type" :disabled="disabled" :class="classes">
    <slot />
  </button>
</template>
