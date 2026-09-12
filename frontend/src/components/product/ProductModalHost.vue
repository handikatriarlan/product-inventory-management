<script setup lang="ts">
import { useProductModals } from '../../composables/useProductModals'
import { useProductStore } from '../../stores/product'
import ProductDetailModal from './ProductDetailModal.vue'
import ProductFormModal from './ProductFormModal.vue'

const { state, close, openEdit } = useProductModals()
const store = useProductStore()

function onSaved() {
  store.fetchList()
  close()
}

function onEditCurrent() {
  if (state.product) openEdit(state.product)
}
</script>

<template>
  <ProductFormModal
    v-if="state.mode === 'create'"
    mode="create"
    @close="close"
    @saved="onSaved"
  />
  <ProductFormModal
    v-else-if="state.mode === 'edit' && state.product"
    :key="state.product.id"
    mode="edit"
    :product="state.product"
    @close="close"
    @saved="onSaved"
  />
  <ProductDetailModal
    v-else-if="state.mode === 'detail' && state.product"
    :key="state.product.id"
    :product="state.product"
    @close="close"
    @edit="onEditCurrent"
    @deleted="close"
  />
</template>
