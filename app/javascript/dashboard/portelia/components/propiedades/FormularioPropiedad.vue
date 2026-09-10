<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useAlert } from 'dashboard/composables';
import { useAccount } from 'dashboard/composables/useAccount';
import Breadcrumb from 'dashboard/components-next/breadcrumb/Breadcrumb.vue';
import Button from 'dashboard/components-next/button/Button.vue';
import Checkbox from 'dashboard/components-next/checkbox/Checkbox.vue';
import Input from 'dashboard/components-next/input/Input.vue';
import Select from 'dashboard/components-next/select/Select.vue';
import Spinner from 'dashboard/components-next/spinner/Spinner.vue';
import TextArea from 'dashboard/components-next/textarea/TextArea.vue';
import miApi from '../../api/miApi';
import {
  ESTADOS,
  MONEDAS,
  OPERACIONES,
  TIPOS,
  opcionesDe,
  tituloDe,
} from './propiedad';

const props = defineProps({
  propiedadId: { type: String, default: '' },
});

const { t } = useI18n();
const router = useRouter();
const { accountScopedRoute } = useAccount();

const esNueva = computed(() => !props.propiedadId);
const cargando = ref(!esNueva.value);
const guardando = ref(false);
const error = ref('');
const original = ref(null);

// Los campos del formulario son texto; se vuelven números y listas al guardar. Los que la
// Propiedad no tiene quedan vacíos y no viajan: la API escribe por delta, nunca null.
const NUMERICOS = [
  'precio',
  'expensas',
  'superficieTotalM2',
  'superficieCubiertaM2',
  'ambientes',
  'dormitorios',
  'banos',
];
const TEXTOS = [
  'direccion',
  'zona',
  'ciudad',
  'condicion',
  'descripcion',
  'urlRecorrido',
  'urlAviso',
];

const campos = reactive({
  tipo: 'departamento',
  operacion: 'venta',
  estado: 'disponible',
  moneda: '',
  cochera: false,
  amenities: '',
  fotos: '',
  ...Object.fromEntries([...NUMERICOS, ...TEXTOS].map(campo => [campo, ''])),
});

const migas = computed(() => [
  { label: t('PORTELIA.PROPIEDADES.TITULO') },
  {
    label: esNueva.value
      ? t('PORTELIA.PROPIEDADES.FORMULARIO.NUEVA')
      : original.value
        ? tituloDe(original.value, t)
        : '',
  },
]);

const opciones = {
  tipo: computed(() => opcionesDe(TIPOS, t, 'TIPO')),
  operacion: computed(() => opcionesDe(OPERACIONES, t, 'OPERACION')),
  estado: computed(() => opcionesDe(ESTADOS, t, 'ESTADO')),
  moneda: computed(() => [
    { value: '', label: t('PORTELIA.PROPIEDADES.FORMULARIO.SIN_MONEDA') },
    ...MONEDAS.map(moneda => ({ value: moneda, label: moneda })),
  ]),
};

const lineas = texto =>
  texto
    .split(/\r?\n|,/)
    .map(linea => linea.trim())
    .filter(Boolean);

const aPropiedad = () => {
  const propiedad = {
    tipo: campos.tipo,
    operacion: campos.operacion,
    estado: campos.estado,
    cochera: campos.cochera,
    amenities: lineas(campos.amenities),
    fotos: lineas(campos.fotos),
  };
  if (campos.moneda) propiedad.moneda = campos.moneda;
  NUMERICOS.forEach(campo => {
    if (String(campos[campo]).trim() !== '') propiedad[campo] = Number(campos[campo]);
  });
  TEXTOS.forEach(campo => {
    if (campos[campo].trim()) propiedad[campo] = campos[campo].trim();
  });
  return propiedad;
};

const desdePropiedad = propiedad => {
  campos.tipo = propiedad.tipo;
  campos.operacion = propiedad.operacion;
  campos.estado = propiedad.estado;
  campos.moneda = propiedad.moneda ?? '';
  campos.cochera = propiedad.cochera ?? false;
  campos.amenities = propiedad.amenities.join(', ');
  campos.fotos = propiedad.fotos.join('\n');
  NUMERICOS.forEach(campo => {
    campos[campo] = propiedad[campo] === undefined ? '' : String(propiedad[campo]);
  });
  TEXTOS.forEach(campo => {
    campos[campo] = propiedad[campo] ?? '';
  });
};

// Al editar viaja sólo lo que cambió: así la procedencia pasa a `humano` campo por campo.
const delta = () => {
  const ahora = aPropiedad();
  const antes = original.value;
  return Object.fromEntries(
    Object.entries(ahora).filter(
      ([campo, valor]) => JSON.stringify(valor) !== JSON.stringify(antes[campo])
    )
  );
};

const cargar = async () => {
  try {
    original.value = (await miApi.get(`propiedades/${props.propiedadId}`)).data;
    desdePropiedad(original.value);
  } catch {
    useAlert(t('PORTELIA.PROPIEDADES.FICHA.NO_EXISTE'));
    router.replace(accountScopedRoute('portelia_propiedades'));
  } finally {
    cargando.value = false;
  }
};

const irAFicha = id =>
  router.push(accountScopedRoute('portelia_propiedad', { propiedadId: id }));

const cancelar = () =>
  esNueva.value
    ? router.push(accountScopedRoute('portelia_propiedades'))
    : irAFicha(props.propiedadId);

const guardar = async () => {
  if (guardando.value) return;
  guardando.value = true;
  error.value = '';
  try {
    const respuesta = esNueva.value
      ? await miApi.post('propiedades', aPropiedad())
      : await miApi.patch(`propiedades/${props.propiedadId}`, delta());
    useAlert(t('PORTELIA.PROPIEDADES.FORMULARIO.GUARDADA'));
    irAFicha(respuesta.data.id);
  } catch (e) {
    error.value =
      e.response?.data?.error || t('PORTELIA.PROPIEDADES.FORMULARIO.ERROR');
  } finally {
    guardando.value = false;
  }
};

onMounted(() => {
  if (!esNueva.value) cargar();
});
</script>

<template>
  <section class="flex w-full h-full overflow-hidden bg-n-surface-1">
    <div class="flex flex-col w-full h-full">
      <header class="sticky top-0 z-10 px-6">
        <div class="w-full py-6 mx-auto max-w-[40.625rem]">
          <Breadcrumb :items="migas" @click="cancelar" />
        </div>
      </header>
      <main class="flex-1 px-6 pb-6 overflow-y-auto">
        <div v-if="cargando" class="flex justify-center py-20">
          <Spinner />
        </div>
        <form
          v-else
          class="flex flex-col w-full gap-6 mx-auto max-w-[40.625rem]"
          @submit.prevent="guardar"
        >
          <fieldset class="grid grid-cols-1 gap-4 p-0 m-0 border-0 sm:grid-cols-2">
            <label class="flex flex-col gap-1">
              <span class="text-sm font-medium text-n-slate-12">
                {{ t('PORTELIA.PROPIEDADES.FORMULARIO.TIPO') }}
              </span>
              <Select v-model="campos.tipo" :options="opciones.tipo.value" class="!w-full [&>select]:w-full" />
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-sm font-medium text-n-slate-12">
                {{ t('PORTELIA.PROPIEDADES.FORMULARIO.OPERACION') }}
              </span>
              <Select v-model="campos.operacion" :options="opciones.operacion.value" class="!w-full [&>select]:w-full" />
            </label>
            <label v-if="!esNueva" class="flex flex-col gap-1">
              <span class="text-sm font-medium text-n-slate-12">
                {{ t('PORTELIA.PROPIEDADES.FORMULARIO.ESTADO') }}
              </span>
              <Select v-model="campos.estado" :options="opciones.estado.value" class="!w-full [&>select]:w-full" />
            </label>
            <Input v-model="campos.direccion" :label="t('PORTELIA.PROPIEDADES.FORMULARIO.DIRECCION')" />
            <Input v-model="campos.zona" :label="t('PORTELIA.PROPIEDADES.FORMULARIO.ZONA')" />
            <Input v-model="campos.ciudad" :label="t('PORTELIA.PROPIEDADES.FORMULARIO.CIUDAD')" />
          </fieldset>

          <fieldset class="grid grid-cols-2 gap-4 p-0 m-0 border-0 sm:grid-cols-3">
            <Input v-model="campos.precio" type="number" min="0" :label="t('PORTELIA.PROPIEDADES.FORMULARIO.PRECIO')" />
            <label class="flex flex-col gap-1">
              <span class="text-sm font-medium text-n-slate-12">
                {{ t('PORTELIA.PROPIEDADES.FORMULARIO.MONEDA') }}
              </span>
              <Select v-model="campos.moneda" :options="opciones.moneda.value" class="!w-full [&>select]:w-full" />
            </label>
            <Input v-model="campos.expensas" type="number" min="0" :label="t('PORTELIA.PROPIEDADES.FORMULARIO.EXPENSAS')" />
            <Input v-model="campos.superficieCubiertaM2" type="number" min="1" :label="t('PORTELIA.PROPIEDADES.FORMULARIO.SUPERFICIE_CUBIERTA')" />
            <Input v-model="campos.superficieTotalM2" type="number" min="1" :label="t('PORTELIA.PROPIEDADES.FORMULARIO.SUPERFICIE_TOTAL')" />
            <Input v-model="campos.ambientes" type="number" min="1" :label="t('PORTELIA.PROPIEDADES.FORMULARIO.AMBIENTES')" />
            <Input v-model="campos.dormitorios" type="number" min="0" :label="t('PORTELIA.PROPIEDADES.FORMULARIO.DORMITORIOS')" />
            <Input v-model="campos.banos" type="number" min="0" :label="t('PORTELIA.PROPIEDADES.FORMULARIO.BANOS')" />
            <label class="flex items-center self-end gap-2 h-10 text-sm text-n-slate-12">
              <Checkbox v-model="campos.cochera" />
              {{ t('PORTELIA.PROPIEDADES.FORMULARIO.COCHERA') }}
            </label>
          </fieldset>

          <fieldset class="flex flex-col gap-4 p-0 m-0 border-0">
            <Input v-model="campos.condicion" :label="t('PORTELIA.PROPIEDADES.FORMULARIO.CONDICION')" :placeholder="t('PORTELIA.PROPIEDADES.FORMULARIO.CONDICION_EJEMPLO')" />
            <TextArea v-model="campos.descripcion" :label="t('PORTELIA.PROPIEDADES.FORMULARIO.DESCRIPCION')" :max-length="4000" auto-height />
            <Input v-model="campos.amenities" :label="t('PORTELIA.PROPIEDADES.FORMULARIO.AMENITIES')" :message="t('PORTELIA.PROPIEDADES.FORMULARIO.AMENITIES_AYUDA')" />
            <TextArea v-model="campos.fotos" :label="t('PORTELIA.PROPIEDADES.FORMULARIO.FOTOS')" :max-length="8000" auto-height />
            <p class="mb-0 -mt-3 text-xs text-n-slate-11">
              {{ t('PORTELIA.PROPIEDADES.FORMULARIO.FOTOS_AYUDA') }}
            </p>
            <Input v-model="campos.urlRecorrido" type="url" :label="t('PORTELIA.PROPIEDADES.FORMULARIO.RECORRIDO')" />
            <Input v-model="campos.urlAviso" type="url" :label="t('PORTELIA.PROPIEDADES.FORMULARIO.AVISO')" />
          </fieldset>

          <p v-if="error" class="mb-0 text-sm text-n-ruby-11">{{ error }}</p>

          <div class="flex items-center justify-end gap-2">
            <Button
              :label="t('PORTELIA.PROPIEDADES.FORMULARIO.CANCELAR')"
              variant="link"
              color="slate"
              type="button"
              @click="cancelar"
            />
            <Button
              type="submit"
              :label="t('PORTELIA.PROPIEDADES.FORMULARIO.GUARDAR')"
              :is-loading="guardando"
            />
          </div>
        </form>
      </main>
    </div>
  </section>
</template>
