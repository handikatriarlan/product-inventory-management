<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="py-16 text-center">
    <p class="text-sm font-semibold text-slate-500">404</p>
    <h1 class="mt-2 text-2xl font-semibold tracking-tight">Halaman tidak ditemukan</h1>
    <RouterLink
      to="/products"
      class="mt-4 inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
    >
      Kembali ke Products
    </RouterLink>
  </section>
</template>
