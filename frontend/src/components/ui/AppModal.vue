<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    size?: 'sm' | 'md' | 'lg'
    closeOnOverlay?: boolean
    closeOnEscape?: boolean
  }>(),
  { size: 'md', closeOnOverlay: true, closeOnEscape: true },
)

const emit = defineEmits<{ close: [] }>()

const panel = ref<HTMLElement | null>(null)
const titleId = `modal-title-${Math.random().toString(36).slice(2, 9)}`
let restoreFocus: HTMLElement | null = null

const sizeClass = { sm: 'sm:max-w-sm', md: 'sm:max-w-lg', lg: 'sm:max-w-3xl' }[props.size]

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

function focusableElements(): HTMLElement[] {
  return panel.value ? Array.from(panel.value.querySelectorAll<HTMLElement>(FOCUSABLE)) : []
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    if (!props.closeOnEscape) return
    event.preventDefault()
    emit('close')
    return
  }
  if (event.key !== 'Tab') return

  const elements = focusableElements()
  const first = elements[0]
  const last = elements[elements.length - 1]
  if (!first || !last) return

  const active = document.activeElement
  const inside = panel.value?.contains(active) ?? false

  if (event.shiftKey && (active === first || !inside)) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(
  () => props.open,
  async (open) => {
    if (open) {
      restoreFocus = document.activeElement as HTMLElement | null
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', onKeydown)
      await nextTick()
      ;(focusableElements()[0] ?? panel.value)?.focus()
    } else {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeydown)
      restoreFocus?.focus()
      restoreFocus = null
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex justify-center overflow-y-auto bg-neutral-950/50 sm:items-center sm:p-6"
      @click.self="closeOnOverlay && emit('close')"
    >
      <section
        ref="panel"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        tabindex="-1"
        :class="['w-full border border-neutral-900 bg-white sm:my-auto', sizeClass]"
      >
        <header class="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-4">
          <h2 :id="titleId" class="text-xs font-semibold uppercase tracking-widest text-neutral-900">
            {{ title }}
          </h2>
          <button
            type="button"
            class="-mt-1 text-xl leading-none text-neutral-400 hover:text-neutral-900"
            aria-label="Tutup"
            @click="emit('close')"
          >
            &times;
          </button>
        </header>

        <div class="px-5 py-5">
          <slot />
        </div>

        <footer v-if="$slots.footer" class="border-t border-neutral-200 px-5 py-4">
          <slot name="footer" />
        </footer>
      </section>
    </div>
  </Teleport>
</template>
