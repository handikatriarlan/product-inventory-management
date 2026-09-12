<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from './components/layout/AppHeader.vue'
import ToastContainer from './components/ui/ToastContainer.vue'
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <AppHeader />
    <main class="mx-auto w-full max-w-6xl px-4 py-6">
      <RouterView />
    </main>
    <ToastContainer />
  </div>
</template>
