<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAlert } from 'dashboard/composables';
import { useAbortableRequest } from 'dashboard/composables/useAbortableRequest';
import { conversacionesPropias } from '../../api/conversaciones';
import Banner from 'dashboard/components-next/banner/Banner.vue';
import DialogoAsesor from '../DialogoAsesor.vue';
import Select from 'dashboard/components-next/select/Select.vue';
import Spinner from 'dashboard/components-next/spinner/Spinner.vue';
import miApi from '../../api/miApi';

const props = defineProps({
  propiedadId: { type: String, required: true },
});

const { t } = useI18n();

const dialogRef = ref(null);

const conversaciones = ref([]);

const conversacionId = ref('');

const { run, isPending: cargando } = useAbortableRequest();

const fallo = ref(false);

const enviando = ref(false);

const opciones = computed(() =>
  conversaciones.value.map(conversacion => ({
    value: String(conversacion.id),
    label: [
      conversacion.meta?.sender?.name ||
        conversacion.meta?.sender?.phone_number ||
        `#${conversacion.id}`,
      conversacion.last_non_activity_message?.content,
    ]
      .filter(Boolean)
      .join(' · ')
      .slice(0, 80),
  }))
);

// Las conversaciones abiertas del asesor: la ficha sólo se manda a quien ya está hablando.
const cargar = async () => {
  conversaciones.value = [];
  fallo.value = false;

  try {
    const respuesta = await run(conversacionesPropias);

    if (respuesta) conversaciones.value = respuesta;
  } catch {
    fallo.value = true;
  }
};

const puedeEnviar = computed(
  () =>
    !cargando.value &&
    !fallo.value &&
    opciones.value.some(opcion => opcion.value === conversacionId.value)
);

const enviar = async () => {
  if (!puedeEnviar.value || enviando.value) return;
  enviando.value = true;

  try {
    const { data } = await miApi.post(
      `propiedades/${props.propiedadId}/enviar`,
      {
        conversationId: Number(conversacionId.value),
      }
    );

    useAlert(
      t(
        data.conFoto
          ? 'PORTELIA.PROPIEDADES.ENVIAR.ENVIADA'
          : 'PORTELIA.PROPIEDADES.ENVIAR.ENVIADA_SIN_FOTO'
      )
    );
    dialogRef.value.close();
  } catch (e) {
    useAlert(e.response?.data?.error || t('PORTELIA.PROPIEDADES.ENVIAR.ERROR'));
  } finally {
    enviando.value = false;
  }
};

const abrir = (conversacionInicial = '') => {
  conversacionId.value = conversacionInicial ? String(conversacionInicial) : '';
  dialogRef.value.open();
  cargar();
};

defineExpose({ abrir });
</script>

<template>
  <DialogoAsesor
    ref="dialogRef"
    :title="t('PORTELIA.PROPIEDADES.ENVIAR.TITULO')"
    :description="t('PORTELIA.PROPIEDADES.ENVIAR.DESCRIPCION')"
    :confirm-button-label="t('PORTELIA.PROPIEDADES.ENVIAR.CONFIRMAR')"
    :is-loading="enviando"
    :disable-confirm-button="!puedeEnviar"
    @confirm="enviar"
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
      {{ t('PORTELIA.PROPIEDADES.ENVIAR.ERROR_CARGA') }}
    </Banner>
    <p v-else-if="!opciones.length" class="mb-0 text-sm text-n-slate-11">
      {{ t('PORTELIA.PROPIEDADES.ENVIAR.SIN_CONVERSACIONES') }}
    </p>
    <label v-else class="flex flex-col gap-1">
      <span class="text-sm font-medium text-n-slate-12">
        {{ t('PORTELIA.PROPIEDADES.ENVIAR.CONVERSACION') }}
      </span>
      <Select
        v-model="conversacionId"
        :options="opciones"
        :placeholder="t('PORTELIA.PROPIEDADES.ENVIAR.ELEGIR')"
        class="!w-full [&>select]:w-full"
      />
    </label>
  </DialogoAsesor>
</template>
