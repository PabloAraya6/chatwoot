<script setup>
import { useI18n } from 'vue-i18n';
import TextBubble from 'dashboard/components-next/message/bubbles/Text/Index.vue';
const { t } = useI18n();
</script>

<template>
  <details class="group min-w-0 max-w-full text-sm text-n-slate-11">
    <summary
      class="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-lg px-3 py-2 hover:bg-n-alpha-2 focus-visible:outline focus-visible:outline-n-brand [&::-webkit-details-marker]:hidden"
    >
      <span class="i-lucide-notebook-pen size-4 shrink-0" />
      {{ t('PORTELIA.HILO.NOTA_ORIGINAL') }}
      <span
        class="i-lucide-chevron-down size-4 shrink-0 group-open:rotate-180"
      />
    </summary>
    <TextBubble />
  </details>
</template>
