<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import DialogoAsesor from '../DialogoAsesor.vue';
import TextArea from 'dashboard/components-next/textarea/TextArea.vue';

// Cancelar pide el motivo: sin él, ni el asesor ni la secretaria saben después por qué.
const props = defineProps({ guardando: { type: Boolean, default: false } });

const emit = defineEmits(['cancelar']);

const { t } = useI18n();

const dialogRef = ref(null);

const motivo = ref('');

const vacio = computed(() => !motivo.value.trim());

const abrir = () => {
  motivo.value = '';
  dialogRef.value?.open();
};

const cerrar = () => dialogRef.value?.close();

const confirmar = () => {
  if (props.guardando || vacio.value) return;
  emit('cancelar', motivo.value.trim());
};

defineExpose({ abrir, cerrar });
</script>

<template>
  <DialogoAsesor
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
    />
  </DialogoAsesor>
</template>
