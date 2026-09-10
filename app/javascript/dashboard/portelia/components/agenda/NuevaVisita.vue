<script setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAlert } from 'dashboard/composables';
import ConversationApi from 'dashboard/api/inbox/conversation';
import Dialog from 'dashboard/components-next/dialog/Dialog.vue';
import Select from 'dashboard/components-next/select/Select.vue';
import Input from 'dashboard/components-next/input/Input.vue';
import Spinner from 'dashboard/components-next/spinner/Spinner.vue';
import miApi from '../../api/miApi';
import { nombrePropiedad } from '../ficha/formato';
import { hoy } from './visita';

// Agendar una Visita: la Persona (una conversación abierta del asesor, o la del hilo desde el
// que se abre), la Propiedad, el día y un hueco libre. Los huecos los calcula la API con las
// franjas y las Visitas del asesor, los mismos que ofrece la secretaria.
const props = defineProps({
  contactId: { type: Number, default: 0 },
  conversationId: { type: Number, default: 0 },
});

const emit = defineEmits(['creada']);

const { t } = useI18n();

const dialogRef = ref(null);
const conversaciones = ref([]);
const propiedades = ref([]);
const huecos = ref([]);
const conversacionId = ref('');
const propiedadId = ref('');
const dia = ref(hoy());
const at = ref('');
const cargando = ref(false);
const buscandoHuecos = ref(false);
const guardando = ref(false);

const desdeElHilo = computed(() => props.contactId > 0);

const opcionesPersona = computed(() =>
  conversaciones.value.map(conversacion => ({
    value: String(conversacion.id),
    label:
      conversacion.meta?.sender?.name ||
      conversacion.meta?.sender?.phone_number ||
      `#${conversacion.id}`,
  }))
);
const opcionesPropiedad = computed(() =>
  propiedades.value
    .filter(propiedad => propiedad.estado === 'disponible')
    .map(propiedad => ({
      value: propiedad.id,
      label: nombrePropiedad(propiedad),
    }))
);
const opcionesHueco = computed(() =>
  huecos.value.map(hueco => ({ value: hueco.at, label: hueco.etiqueta }))
);

const contactoElegido = computed(() => {
  if (desdeElHilo.value) return props.contactId;
  const conversacion = conversaciones.value.find(
    c => String(c.id) === conversacionId.value
  );
  return conversacion?.meta?.sender?.id ?? 0;
});

const incompleto = computed(
  () => !contactoElegido.value || !propiedadId.value || !at.value
);

const cargar = async () => {
  cargando.value = true;
  try {
    const pedidos = [miApi.get('propiedades')];
    if (!desdeElHilo.value)
      pedidos.push(
        ConversationApi.get({ status: 'open', assigneeType: 'me', page: 1 })
      );
    const [lista, abiertas] = await Promise.all(pedidos);
    propiedades.value = lista.data;
    conversaciones.value = abiertas?.data?.data?.payload ?? [];
  } catch {
    useAlert(t('PORTELIA.AGENDA.ERROR_CARGA'));
  } finally {
    cargando.value = false;
  }
};

const buscarHuecos = async () => {
  at.value = '';
  huecos.value = [];
  if (!dia.value) return;
  buscandoHuecos.value = true;
  try {
    huecos.value = (await miApi.get(`agenda/huecos?dia=${dia.value}`)).data;
  } catch {
    huecos.value = [];
  } finally {
    buscandoHuecos.value = false;
  }
};
watch(dia, buscarHuecos);

const abrir = () => {
  conversacionId.value = '';
  propiedadId.value = '';
  dia.value = hoy();
  dialogRef.value?.open();
  cargar();
  buscarHuecos();
};

const guardar = async () => {
  guardando.value = true;
  try {
    const conversacion = desdeElHilo.value
      ? props.conversationId
      : Number(conversacionId.value);
    const { data } = await miApi.post('visitas', {
      contactId: contactoElegido.value,
      ...(conversacion ? { conversationId: conversacion } : {}),
      propiedadId: propiedadId.value,
      at: at.value,
      duracionMin: 30,
    });
    emit('creada', data);
    dialogRef.value?.close();
  } catch (error) {
    useAlert(
      error?.response?.data?.error || t('PORTELIA.AGENDA.ERROR_GUARDAR')
    );
  } finally {
    guardando.value = false;
  }
};

defineExpose({ abrir });
</script>

<template>
  <Dialog
    ref="dialogRef"
    :title="t('PORTELIA.AGENDA.NUEVA.TITULO')"
    :description="t('PORTELIA.AGENDA.NUEVA.DESCRIPCION')"
    :confirm-button-label="t('PORTELIA.AGENDA.NUEVA.CONFIRMAR')"
    :disable-confirm-button="incompleto"
    :is-loading="guardando"
    overflow-y-auto
    @confirm="guardar"
  >
    <div v-if="cargando" class="flex justify-center py-4">
      <Spinner />
    </div>
    <div v-else class="flex flex-col gap-4">
      <label
        v-if="!desdeElHilo"
        class="flex flex-col gap-1 text-sm text-n-slate-12"
      >
        {{ t('PORTELIA.AGENDA.NUEVA.PERSONA') }}
        <Select
          v-model="conversacionId"
          :options="opcionesPersona"
          :placeholder="
            opcionesPersona.length
              ? t('PORTELIA.AGENDA.NUEVA.ELEGIR_PERSONA')
              : t('PORTELIA.AGENDA.NUEVA.SIN_CONVERSACIONES')
          "
          class="[&>select]:w-full w-full"
        />
      </label>
      <label class="flex flex-col gap-1 text-sm text-n-slate-12">
        {{ t('PORTELIA.FICHA.PROPIEDAD') }}
        <Select
          v-model="propiedadId"
          :options="opcionesPropiedad"
          :placeholder="t('PORTELIA.FICHA.ELEGIR_PROPIEDAD')"
          class="[&>select]:w-full w-full"
        />
      </label>
      <Input
        v-model="dia"
        type="date"
        :min="hoy()"
        :label="t('PORTELIA.AGENDA.NUEVA.DIA')"
      />
      <label class="flex flex-col gap-1 text-sm text-n-slate-12">
        {{ t('PORTELIA.AGENDA.NUEVA.HORARIO') }}
        <div v-if="buscandoHuecos" class="flex py-2">
          <Spinner />
        </div>
        <Select
          v-else-if="opcionesHueco.length"
          v-model="at"
          :options="opcionesHueco"
          :placeholder="t('PORTELIA.AGENDA.NUEVA.ELEGIR_HORARIO')"
          class="[&>select]:w-full w-full"
        />
        <span v-else class="text-n-slate-11">
          {{ t('PORTELIA.AGENDA.NUEVA.SIN_HUECOS') }}
        </span>
      </label>
    </div>
  </Dialog>
</template>
