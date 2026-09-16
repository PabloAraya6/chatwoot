<script setup>
import { ref, computed } from 'vue';
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
  visitas: { type: Array, required: true },
});

const emit = defineEmits(['creada']);

const { t } = useI18n();

const dialogRef = ref(null);

const propiedadId = ref('');

const veredicto = ref('');

const motivo = ref('');

const guardando = ref(false);

const VEREDICTOS = ['le_gusto', 'no_le_gusto', 'lo_piensa'];

const opcionesPropiedad = computed(() =>
  props.propiedades.map(p => ({ value: p.id, label: nombrePropiedad(p) }))
);

const opcionesVeredicto = VEREDICTOS.map(value => ({
  value,
  label: t(`PORTELIA.FICHA.VEREDICTO.${value}`),
}));

const incompleto = computed(() => !propiedadId.value || !veredicto.value);

// La Reacción nace casi siempre después de una Visita: si hay una realizada a esa Propiedad,
// queda enlazada sin preguntar.
const visitaRealizada = () =>
  props.visitas.find(
    v => v.propiedadId === propiedadId.value && v.estado === 'realizada'
  );

// Desde la Agenda llega con la Propiedad de la Visita que se acaba de marcar realizada.
const abrir = (propiedadInicial = '') => {
  propiedadId.value = propiedadInicial;
  veredicto.value = '';
  motivo.value = '';
  dialogRef.value?.open();
};

const guardar = async () => {
  if (guardando.value || incompleto.value) return;
  guardando.value = true;

  try {
    const { data } = await miApi.post('reacciones', {
      contactId: props.contactId,
      propiedadId: propiedadId.value,
      veredicto: veredicto.value,
      motivo: motivo.value.trim() || undefined,
      visitaId: visitaRealizada()?.id,
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
    :title="t('PORTELIA.FICHA.REACCIONES.NUEVA')"
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
        {{ t('PORTELIA.FICHA.REACCIONES.VEREDICTO') }}
        <Select
          v-model="veredicto"
          :options="opcionesVeredicto"
          :placeholder="t('PORTELIA.FICHA.ELEGIR')"
          class="[&>select]:w-full w-full"
        />
      </label>
      <Input
        v-model="motivo"
        :label="t('PORTELIA.FICHA.REACCIONES.MOTIVO')"
        :placeholder="t('PORTELIA.FICHA.REACCIONES.MOTIVO_EJEMPLO')"
      />
    </div>
  </Dialog>
</template>
