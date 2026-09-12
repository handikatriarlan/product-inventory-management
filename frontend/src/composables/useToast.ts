import { reactive } from 'vue'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  message: string
  type: ToastType
}

const toasts = reactive<Toast[]>([])
let nextId = 1

function remove(id: number) {
  const index = toasts.findIndex((toast) => toast.id === id)
  if (index !== -1) toasts.splice(index, 1)
}

function show(message: string, type: ToastType = 'info') {
  const id = nextId++
  toasts.push({ id, message, type })
  setTimeout(() => remove(id), 4000)
}

export function useToast() {
  return { toasts, show, remove }
}
