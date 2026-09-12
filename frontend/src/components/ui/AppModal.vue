<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    size?: 'sm' | 'md' | 'lg'
    closeOnOverlay?: boolean
    closeOnEscape?: boolean
    closable?: boolean
  }>(),
  { size: 'md', closeOnOverlay: true, closeOnEscape: true, closable: true },
)

const emit = defineEmits<{ close: [] }>()

const panel = ref<HTMLElement | null>(null)
const titleId = `modal-title-${Math.random().toString(36).slice(2, 9)}`

let restoreFocus: HTMLElement | null = null
let locked = false

const sizeClass = { sm: 'sm:max-w-sm', md: 'sm:max-w-lg', lg: 'sm:max-w-3xl' }[props.size]

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

const modalStack: number[] = []
let modalCounter = 0
const instanceId = ++modalCounter

let scrollLockCount = 0
let previousOverflow = ''

function lockScroll() {
  if (scrollLockCount === 0) {
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  scrollLockCount += 1
}

function unlockScroll() {
  scrollLockCount = Math.max(0, scrollLockCount - 1)
  if (scrollLockCount === 0) {
    document.body.style.overflow = previousOverflow
  }
}

function isTopModal() {
  return modalStack[modalStack.length - 1] === instanceId
}

function focusableElements(): HTMLElement[] {
  return panel.value ? Array.from(panel.value.querySelectorAll<HTMLElement>(FOCUSABLE)) : []
}

function onKeydown(event: KeyboardEvent) {
  if (!props.open || !isTopModal()) return

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

function activate() {
  restoreFocus = document.activeElement as HTMLElement | null
  modalStack.push(instanceId)
  lockScroll()
  locked = true
  window.addEventListener('keydown', onKeydown)
}

function deactivate() {
  const index = modalStack.indexOf(instanceId)
  if (index !== -1) modalStack.splice(index, 1)
  window.removeEventListener('keydown', onKeydown)
  if (locked) {
    unlockScroll()
    locked = false
  }
  restoreFocus?.focus()
  restoreFocus = null
}

watch(
  () => props.open,
  async (open) => {
    if (open && !locked) {
      activate()
      await nextTick()
      const target =
        panel.value?.querySelector<HTMLElement>('[data-autofocus]') ?? focusableElements()[0]
      ;(target ?? panel.value)?.focus()
    } else if (!open && locked) {
      deactivate()
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (locked) deactivate()
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="animate-overlay-in fixed inset-0 z-50 flex items-end justify-center bg-neutral-950/50 sm:items-center sm:p-6"
      @click.self="closeOnOverlay && emit('close')"
    >
      <section
        ref="panel"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        tabindex="-1"
        :class="[
          'animate-sheet-up flex max-h-[92dvh] w-full flex-col border-t border-neutral-900 bg-white sm:my-auto sm:max-h-[85dvh] sm:animate-pop-in sm:border',
          sizeClass,
        ]"
      >
        <div class="mx-auto mt-2 h-1 w-10 shrink-0 bg-neutral-300 sm:hidden" aria-hidden="true"></div>

        <header
          class="flex shrink-0 items-start justify-between gap-3 border-b border-neutral-200 px-4 py-3 sm:px-5 sm:py-4"
        >
          <h2
            :id="titleId"
            class="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 sm:text-xs"
          >
            {{ title }}
          </h2>
          <button
            v-if="closable"
            type="button"
            class="-m-1 p-1 text-xl leading-none text-neutral-500 hover:text-neutral-900"
            aria-label="Tutup"
            @click="emit('close')"
          >
            &times;
          </button>
        </header>

        <div class="flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5">
          <slot />
        </div>

        <footer
          v-if="$slots.footer"
          class="shrink-0 border-t border-neutral-200 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5 sm:py-4"
        >
          <slot name="footer" />
        </footer>
      </section>
    </div>
  </Teleport>
</template>
