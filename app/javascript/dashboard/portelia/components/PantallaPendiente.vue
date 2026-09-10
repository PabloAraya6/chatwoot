<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  pantalla: { type: String, required: true },
});

const { t } = useI18n();

const titulo = computed(
  () =>
    ({
      propiedades: t('PORTELIA.SIDEBAR.PROPIEDADES'),
      agenda: t('PORTELIA.SIDEBAR.AGENDA'),
      configuracion: t('PORTELIA.SIDEBAR.CONFIGURACION'),
    })[props.pantalla]
);
</script>

<template>
  <div class="flex flex-col gap-2 p-6 w-full h-full bg-n-background">
    <h1 class="text-xl font-medium text-n-slate-12">{{ titulo }}</h1>
    <p class="text-sm text-n-slate-11">{{ t('PORTELIA.PENDIENTE.DETALLE') }}</p>
  </div>
</template>
