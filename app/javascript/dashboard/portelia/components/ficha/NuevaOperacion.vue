<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAlert } from 'dashboard/composables';
import Dialog from 'dashboard/components-next/dialog/Dialog.vue';
import Select from 'dashboard/components-next/select/Select.vue';
import Input from 'dashboard/components-next/input/Input.vue';
import miApi from '../../api/miApi';
import { nombrePropiedad } from './formato';

const props = defineProps({
  contactId: { type: Number, required: true },
  propiedades: { type: Array, required: true },
});

const emit = defineEmits(['creada']);

const { t } = useI18n();

const dialogRef = ref(null);
const propiedadId = ref('');
const tipo = ref('');
const precio = ref('');
const moneda = ref('USD');
const guardando = ref(false);

const opcionesPropiedad = computed(() =>
  props.propiedades.map(p => ({ value: p.id, label: nombrePropiedad(p) }))
);
const opcionesTipo = ['venta', 'alquiler'].map(value => ({
  value,
  label: value,
}));
const opcionesMoneda = ['USD', 'ARS'].map(value => ({ value, label: value }));

const incompleto = computed(() => !propiedadId.value || !tipo.value);

// La Propiedad elegida trae operación y precio: se proponen y el asesor corrige el cierre.
const alElegirPropiedad = () => {
  const propiedad = props.propiedades.find(p => p.id === propiedadId.value);
  if (!propiedad) return;
  if (['venta', 'alquiler'].includes(propiedad.operacion))
    tipo.value = propiedad.operacion;
  if (propiedad.precio) precio.value = propiedad.precio;
  if (propiedad.moneda) moneda.value = propiedad.moneda;
};
watch(propiedadId, alElegirPropiedad);

const abrir = () => {
  propiedadId.value = '';
  tipo.value = '';
  precio.value = '';
  moneda.value = 'USD';
  dialogRef.value?.open();
};

const guardar = async () => {
  guardando.value = true;
  try {
    const { data } = await miApi.post('operaciones', {
      contactId: props.contactId,
      propiedadId: propiedadId.value,
      tipo: tipo.value,
      ...(precio.value
        ? { precio: Number(precio.value), moneda: moneda.value }
        : {}),
    });
    emit('creada', data);
    dialogRef.value?.close();
  } catch (error) {
    useAlert(error?.response?.data?.error || t('PORTELIA.FICHA.ERROR_GUARDAR'));
  } finally {
    guardando.value = false;
  }
};

defineExpose({ abrir });
</script>

<template>
  <Dialog
    ref="dialogRef"
    :title="t('PORTELIA.FICHA.OPERACIONES.NUEVA')"
    :description="t('PORTELIA.FICHA.OPERACIONES.DESCRIPCION')"
    :confirm-button-label="t('PORTELIA.FICHA.GUARDAR')"
    :disable-confirm-button="incompleto"
    :is-loading="guardando"
    overflow-y-auto
    @confirm="guardar"
  >
    <div class="flex flex-col gap-4">
      <label class="flex flex-col gap-1 text-sm text-n-slate-12">
        {{ t('PORTELIA.FICHA.PROPIEDAD') }}
        <Select
          v-model="propiedadId"
          :options="opcionesPropiedad"
          :placeholder="t('PORTELIA.FICHA.ELEGIR_PROPIEDAD')"
          class="[&>select]:w-full w-full"
        />
      </label>
      <label class="flex flex-col gap-1 text-sm text-n-slate-12">
        {{ t('PORTELIA.FICHA.OPERACIONES.TIPO') }}
        <Select
          v-model="tipo"
          :options="opcionesTipo"
          :placeholder="t('PORTELIA.FICHA.ELEGIR')"
          class="[&>select]:w-full w-full"
        />
      </label>
      <div class="grid grid-cols-[1fr,auto] items-end gap-2">
        <Input
          v-model="precio"
          type="number"
          :label="t('PORTELIA.FICHA.OPERACIONES.PRECIO')"
          placeholder="0"
        />
        <Select v-model="moneda" :options="opcionesMoneda" />
      </div>
    </div>
  </Dialog>
</template>
