<script setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAbortableRequest } from 'dashboard/composables/useAbortableRequest';
import Banner from 'dashboard/components-next/banner/Banner.vue';
import { useAlert } from 'dashboard/composables';
import { conversacionesPropias } from '../../api/conversaciones';
import DialogoAsesor from '../DialogoAsesor.vue';
import Select from 'dashboard/components-next/select/Select.vue';
import Input from 'dashboard/components-next/input/Input.vue';
import Spinner from 'dashboard/components-next/spinner/Spinner.vue';
import miApi from '../../api/miApi';
import { listarTodasLasPropiedades } from '../../api/propiedades';
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

const {
  run: runDatos,
  abort: abortDatos,
  isPending: cargando,
} = useAbortableRequest();

const { run, abort, isPending: buscandoHuecos } = useAbortableRequest();

const fallo = ref(false);

const falloHuecos = ref(false);

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
  () =>
    cargando.value ||
    fallo.value ||
    buscandoHuecos.value ||
    falloHuecos.value ||
    !contactoElegido.value ||
    !opcionesPropiedad.value.some(p => p.value === propiedadId.value) ||
    !huecos.value.some(h => h.at === at.value)
);

const cargar = async () => {
  fallo.value = false;
  propiedades.value = [];
  conversaciones.value = [];
  try {
    const respuesta = await runDatos(signal =>
      Promise.all([
        listarTodasLasPropiedades(signal),
        desdeElHilo.value ? Promise.resolve([]) : conversacionesPropias(signal),
      ])
    );
    if (!respuesta) return;
    const [lista, abiertas] = respuesta;
    propiedades.value = lista;
    conversaciones.value = abiertas;
  } catch {
    fallo.value = true;
  }
};

const buscarHuecos = async () => {
  abort();
  at.value = '';
  huecos.value = [];
  falloHuecos.value = false;
  if (!dia.value) return;

  try {
    const respuesta = await run(signal =>
      miApi.get(`agenda/huecos?dia=${dia.value}`, { signal })
    );
    if (respuesta) huecos.value = respuesta.data;
  } catch {
    falloHuecos.value = true;
  }
};

watch(dia, buscarHuecos);

const abrir = (propiedadInicial = '') => {
  conversacionId.value = '';
  propiedadId.value = propiedadInicial;
  const mismoDia = dia.value === hoy();
  dia.value = hoy();
  dialogRef.value?.open();
  cargar();
  if (mismoDia) buscarHuecos();
};

const guardar = async () => {
  if (guardando.value || incompleto.value) return;
  guardando.value = true;

  try {
    const conversacion = desdeElHilo.value
      ? props.conversationId
      : Number(conversacionId.value);

    const { data } = await miApi.post('visitas', {
      contactId: contactoElegido.value,
      conversationId: conversacion || undefined,
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
  <DialogoAsesor
    ref="dialogRef"
    :title="t('PORTELIA.AGENDA.NUEVA.TITULO')"
    :description="t('PORTELIA.AGENDA.NUEVA.DESCRIPCION')"
    :confirm-button-label="t('PORTELIA.AGENDA.NUEVA.CONFIRMAR')"
    :disable-confirm-button="incompleto"
    :is-loading="guardando"
    overflow-y-auto
    @confirm="guardar"
    @close="
      abort();
      abortDatos();
    "
  >
    <div v-if="cargando" class="flex justify-center py-4">
      <Spinner />
    </div>
    <Banner
      v-else-if="fallo"
      color="ruby"
      role="alert"
      :action-label="t('PORTELIA.REINTENTAR')"
      @action="cargar"
    >
      {{ t('PORTELIA.AGENDA.ERROR_CARGA') }}
    </Banner>
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
        <Banner
          v-else-if="falloHuecos"
          color="ruby"
          role="alert"
          :action-label="t('PORTELIA.REINTENTAR')"
          @action="buscarHuecos"
          >{{ t('PORTELIA.AGENDA.NUEVA.ERROR_HUECOS') }}</Banner
        >
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
  </DialogoAsesor>
</template>
