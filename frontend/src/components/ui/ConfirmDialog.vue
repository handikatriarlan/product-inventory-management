<script setup lang="ts">
import AppButton from './AppButton.vue'
import AppModal from './AppModal.vue'

withDefaults(
  defineProps<{
    open: boolean
    title: string
    message: string
    loading?: boolean
  }>(),
  { loading: false },
)

const emit = defineEmits<{ confirm: []; cancel: [] }>()
</script>

<template>
  <AppModal
    :open="open"
    :title="title"
    size="sm"
    :close-on-overlay="!loading"
    :close-on-escape="!loading"
    @close="emit('cancel')"
  >
    <p class="text-sm leading-relaxed text-neutral-600">{{ message }}</p>

    <template #footer>
      <div class="flex justify-end gap-2">
        <AppButton variant="outline" :disabled="loading" @click="emit('cancel')">Batal</AppButton>
        <AppButton variant="danger" :disabled="loading" @click="emit('confirm')">
          {{ loading ? 'Menghapus...' : 'Hapus' }}
        </AppButton>
      </div>
    </template>
  </AppModal>
</template>
