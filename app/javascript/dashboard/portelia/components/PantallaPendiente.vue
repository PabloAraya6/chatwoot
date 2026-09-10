<script setup>
import { useI18n } from 'vue-i18n';

defineProps({
  titulo: { type: String, required: true },
});

const { t } = useI18n();
</script>

<template>
  <div class="flex flex-col gap-2 p-6 w-full h-full bg-n-background">
    <h1 class="text-xl font-medium text-n-slate-12">{{ t(titulo) }}</h1>
    <p class="text-sm text-n-slate-11">{{ t('PORTELIA.PENDIENTE.DETALLE') }}</p>
  </div>
</template>
