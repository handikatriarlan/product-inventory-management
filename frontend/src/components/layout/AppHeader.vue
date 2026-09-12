<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <header class="border-b border-neutral-200 bg-white">
    <div class="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
      <RouterLink
        to="/products"
        class="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-900"
      >
        Product Inventory
      </RouterLink>
    </div>
  </header>
</template>
