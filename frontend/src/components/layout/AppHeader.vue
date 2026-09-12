<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-neutral-200 bg-white pt-[env(safe-area-inset-top)]">
    <div class="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-3 sm:px-4">
      <RouterLink
        to="/products"
        class="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-900 sm:text-sm"
      >
        Product Inventory
      </RouterLink>
    </div>
  </header>
</template>
