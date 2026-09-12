<script setup lang="ts">
import { useRouter } from 'vue-router'
import AppButton from '../components/ui/AppButton.vue'

const router = useRouter()
</script>

<template>
  <section class="py-24 text-center">
    <p class="text-[11px] font-medium uppercase tracking-[0.3em] text-neutral-400">Error 404</p>
    <h1 class="mt-3 text-2xl font-semibold tracking-tight">Halaman tidak ditemukan</h1>
    <p class="mt-2 text-sm text-neutral-500">
      Alamat yang Anda tuju tidak tersedia atau sudah dipindahkan.
    </p>
    <AppButton class="mt-6" variant="outline" @click="router.push({ name: 'product-list' })">
      Kembali ke Produk
    </AppButton>
  </section>
</template>
