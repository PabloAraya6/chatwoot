<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAbortableRequest } from 'dashboard/composables/useAbortableRequest';
import Banner from 'dashboard/components-next/banner/Banner.vue';
import Label from 'dashboard/components-next/label/Label.vue';
import Spinner from 'dashboard/components-next/spinner/Spinner.vue';
import DialogoAsesor from '../DialogoAsesor.vue';
import miApi from '../../api/miApi';
import { fechaCorta } from './formato';

const { t, te } = useI18n();
const dialogRef = ref(null);
const busquedaId = ref('');
const cambios = ref([]);
const fallo = ref(false);
const { run, abort, isPending: cargando } = useAbortableRequest();

const cargar = async () => {
  cambios.value = [];
  fallo.value = false;
  try {
    const respuesta = await run(signal =>
      miApi.get(
        `cambios?objeto=busqueda&id=${encodeURIComponent(busquedaId.value)}`,
        { signal }
      )
    );
    if (respuesta) cambios.value = respuesta.data;
  } catch {
    fallo.value = true;
  }
};

const abrir = id => {
  busquedaId.value = id;
  dialogRef.value?.open();
  return cargar();
};

const campo = nombre => {
  const clave = `PORTELIA.FICHA.CAMPOS.${nombre}`;
  return te(clave) ? t(clave) : nombre;
};

const valor = dato => {
  if (dato === null || dato === '' || (Array.isArray(dato) && !dato.length))
    return t('PORTELIA.FICHA.SIN_DATO');
  if (typeof dato === 'boolean')
    return t(dato ? 'PORTELIA.FICHA.SI' : 'PORTELIA.FICHA.NO');
  return Array.isArray(dato) ? dato.join(', ') : String(dato);
};

defineExpose({ abrir });
</script>

<template>
  <DialogoAsesor
    ref="dialogRef"
    :title="t('PORTELIA.FICHA.HISTORIAL.TITULO')"
    :description="t('PORTELIA.FICHA.HISTORIAL.DESCRIPCION')"
    :show-confirm-button="false"
    :cancel-button-label="t('PORTELIA.FICHA.HISTORIAL.CERRAR')"
    @close="abort"
  >
    <div v-if="cargando" class="flex justify-center py-6"><Spinner /></div>
    <Banner
      v-else-if="fallo"
      color="ruby"
      role="alert"
      :action-label="t('PORTELIA.REINTENTAR')"
      @action="cargar"
    >
      {{ t('PORTELIA.FICHA.HISTORIAL.ERROR') }}
    </Banner>
    <p v-else-if="!cambios.length" class="text-sm text-n-slate-11">
      {{ t('PORTELIA.FICHA.HISTORIAL.VACIO') }}
    </p>
    <ol v-else class="flex flex-col gap-4 p-0 m-0 list-none">
      <li
        v-for="cambio in cambios"
        :key="cambio.id"
        class="flex flex-col gap-2 pb-4 border-b border-n-weak last:border-0"
      >
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="text-sm font-medium text-n-slate-12">{{
            campo(cambio.campo)
          }}</span>
          <Label
            :label="t(`PORTELIA.FICHA.PROCEDENCIA.${cambio.procedencia}`)"
            :color="cambio.procedencia === 'asistente' ? 'iris' : 'slate'"
            compact
          />
        </div>
        <time :datetime="cambio.at" class="text-xs text-n-slate-11">{{
          fechaCorta(cambio.at)
        }}</time>
        <dl class="grid grid-cols-2 gap-3 m-0 text-sm">
          <div class="min-w-0">
            <dt class="text-n-slate-11">
              {{ t('PORTELIA.FICHA.HISTORIAL.ANTES') }}
            </dt>
            <dd class="m-0 text-n-slate-12 break-words">
              {{ valor(cambio.antes) }}
            </dd>
          </div>
          <div class="min-w-0">
            <dt class="text-n-slate-11">
              {{ t('PORTELIA.FICHA.HISTORIAL.DESPUES') }}
            </dt>
            <dd class="m-0 text-n-slate-12 break-words">
              {{ valor(cambio.despues) }}
            </dd>
          </div>
        </dl>
      </li>
    </ol>
  </DialogoAsesor>
</template>
