<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Dialog from 'dashboard/components-next/dialog/Dialog.vue';
import TextArea from 'dashboard/components-next/textarea/TextArea.vue';

// Cancelar pide el motivo: sin él, ni el asesor ni la secretaria saben después por qué.
const emit = defineEmits(['cancelar']);

const { t } = useI18n();

const dialogRef = ref(null);

const motivo = ref('');

const guardando = ref(false);

const vacio = computed(() => !motivo.value.trim());

const abrir = () => {
  motivo.value = '';
  guardando.value = false;
  dialogRef.value?.open();
};

const cerrar = () => dialogRef.value?.close();

const confirmar = () => {
  guardando.value = true;
  emit('cancelar', motivo.value.trim());
};

defineExpose({ abrir, cerrar });
</script>

<template>
  <Dialog
    ref="dialogRef"
    type="alert"
    :title="t('PORTELIA.AGENDA.CANCELAR.TITULO')"
    :description="t('PORTELIA.AGENDA.CANCELAR.DESCRIPCION')"
    :confirm-button-label="t('PORTELIA.AGENDA.CANCELAR.CONFIRMAR')"
    :disable-confirm-button="vacio"
    :is-loading="guardando"
    @confirm="confirmar"
  >
    <TextArea
      v-model="motivo"
      :label="t('PORTELIA.AGENDA.CANCELAR.MOTIVO')"
      :placeholder="t('PORTELIA.AGENDA.CANCELAR.MOTIVO_EJEMPLO')"
      autofocus
    />
  </Dialog>
</template>
