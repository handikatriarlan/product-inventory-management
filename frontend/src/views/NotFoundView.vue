<script setup lang="ts">
import { useRouter } from 'vue-router'
import AppButton from '../components/ui/AppButton.vue'

const router = useRouter()
</script>

<template>
  <section class="py-16 text-center sm:py-24">
    <p class="text-[11px] font-medium uppercase tracking-[0.3em] text-neutral-500">Error 404</p>
    <h1 class="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">Halaman tidak ditemukan</h1>
    <p class="mt-2 text-xs text-neutral-500 sm:text-sm">
      Alamat yang Anda tuju tidak tersedia atau sudah dipindahkan.
    </p>
    <AppButton class="mt-6" variant="outline" @click="router.push({ name: 'product-list' })">
      Kembali ke Produk
    </AppButton>
  </section>
</template>
