import { reactive } from 'vue'
import type { Product } from '../types/product'

type ModalMode = 'create' | 'edit' | 'detail'

const state = reactive<{ mode: ModalMode | null; product: Product | null }>({
  mode: null,
  product: null,
})

function openCreate() {
  state.mode = 'create'
  state.product = null
}

function openEdit(product: Product) {
  state.mode = 'edit'
  state.product = product
}

function openDetail(product: Product) {
  state.mode = 'detail'
  state.product = product
}

function close() {
  state.mode = null
  state.product = null
}

export function useProductModals() {
  return { state, openCreate, openEdit, openDetail, close }
}
