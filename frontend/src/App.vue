<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from './components/layout/AppHeader.vue'
import ProductModalHost from './components/product/ProductModalHost.vue'
import ToastContainer from './components/ui/ToastContainer.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-white text-neutral-900">
    <AppHeader />
    <main class="mx-auto w-full max-w-6xl flex-1 px-3 py-5 sm:px-4 sm:py-8">
      <RouterView />
    </main>
    <footer class="border-t border-neutral-200">
      <p class="mx-auto max-w-6xl px-3 py-5 text-[11px] uppercase tracking-widest text-neutral-500 sm:px-4 sm:py-6">
        Seakun Product Inventory
      </p>
    </footer>
    <ProductModalHost />
    <ToastContainer />
  </div>
</template>
