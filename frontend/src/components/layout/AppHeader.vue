<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <header class="border-b border-slate-200 bg-white">
    <div class="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
      <RouterLink to="/products" class="text-lg font-semibold tracking-tight text-slate-900">
        Product Inventory
      </RouterLink>

      <nav class="flex items-center gap-1 text-sm">
        <RouterLink
          to="/products"
          exact-active-class="bg-slate-900 text-white hover:bg-slate-900 hover:text-white"
          class="rounded-md px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          Products
        </RouterLink>
        <RouterLink
          to="/products/new"
          exact-active-class="bg-slate-900 text-white hover:bg-slate-900 hover:text-white"
          class="rounded-md px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          Add Product
        </RouterLink>
      </nav>
    </div>
  </header>
</template>
