<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'dashboard/components-next/button/Button.vue';
import DialogoAsesor from '../DialogoAsesor.vue';
import PropiedadSugerida from './PropiedadSugerida.vue';

const props = defineProps({
  propiedades: { type: Array, required: true },
  puedeActuar: { type: Boolean, default: false },
});
const emit = defineEmits(['enviar', 'agendar']);
const { t } = useI18n();
const LIMITE_INICIAL = 2;
const dialogo = ref(null);
const mostrarTodas = ref(false);
const visibles = computed(() =>
  mostrarTodas.value
    ? props.propiedades
    : props.propiedades.slice(0, LIMITE_INICIAL)
);
defineExpose({
  abrir: () => {
    mostrarTodas.value = false;
    dialogo.value.open();
  },
});
</script>

<template>
  <DialogoAsesor
    ref="dialogo"
    :title="t('PORTELIA.HILO.OPCIONES', { n: propiedades.length })"
    :show-confirm-button="false"
    :cancel-button-label="t('PORTELIA.FICHA.HISTORIAL.CERRAR')"
  >
    <p v-if="!puedeActuar" class="mb-3 text-sm text-n-amber-11">
      {{ t('PORTELIA.HILO.TOMAR_PARA_ACTUAR') }}
    </p>
    <div class="flex min-w-0 flex-col divide-y divide-n-weak">
      <PropiedadSugerida
        v-for="propiedad in visibles"
        :key="propiedad.id"
        :sugerencia="propiedad"
        :puede-actuar="puedeActuar"
        @enviar="
          dialogo.close();
          emit('enviar', $event);
        "
        @agendar="
          dialogo.close();
          emit('agendar', $event);
        "
      />
    </div>
    <Button
      v-if="!mostrarTodas && propiedades.length > LIMITE_INICIAL"
      :label="t('PORTELIA.HILO.VER_MAS', { n: propiedades.length })"
      variant="ghost"
      color="slate"
      class="mt-3 w-full"
      @click="mostrarTodas = true"
    />
  </DialogoAsesor>
</template>
