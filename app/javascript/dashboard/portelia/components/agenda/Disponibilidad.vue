<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAbortableRequest } from 'dashboard/composables/useAbortableRequest';
import { useAlert } from 'dashboard/composables';
import DialogoAsesor from '../DialogoAsesor.vue';
import Input from 'dashboard/components-next/input/Input.vue';
import Button from 'dashboard/components-next/button/Button.vue';
import Banner from 'dashboard/components-next/banner/Banner.vue';
import Spinner from 'dashboard/components-next/spinner/Spinner.vue';
import miApi from '../../api/miApi';
import { DIAS_SEMANA } from './visita';

// Las franjas semanales del asesor (ticket 11 del mapa anterior: disponibilidad declarada, sin
// calendario externo). El PUT reemplaza la lista entera, así que acá se edita entera.
const emit = defineEmits(['guardada']);

const { t } = useI18n();

const dialogRef = ref(null);

const franjas = ref([]);

const { run, abort, isPending: cargando } = useAbortableRequest();

const guardando = ref(false);

const cargada = ref(false);

const fallo = ref(false);

const porDia = computed(() =>
  DIAS_SEMANA.map(diaSemana => ({
    diaSemana,
    franjas: franjas.value.filter(franja => franja.diaSemana === diaSemana),
  }))
);

const invalida = franja =>
  !franja.desde || !franja.hasta || franja.desde >= franja.hasta;

const hayInvalidas = computed(() => franjas.value.some(invalida));

const agregar = diaSemana =>
  franjas.value.push({ diaSemana, desde: '09:00', hasta: '13:00' });

const quitar = franja => {
  franjas.value = franjas.value.filter(otra => otra !== franja);
};

const cargar = async () => {
  cargada.value = false;
  fallo.value = false;

  try {
    const respuesta = await run(signal =>
      miApi.get('disponibilidad', { signal })
    );
    if (!respuesta) return;
    franjas.value = respuesta.data.map(({ diaSemana, desde, hasta }) => ({
      diaSemana,
      desde,
      hasta,
    }));
    cargada.value = true;
  } catch {
    fallo.value = true;
  }
};

const abrir = () => {
  dialogRef.value?.open();
  return cargar();
};

const guardar = async () => {
  if (guardando.value || cargando.value || !cargada.value || hayInvalidas.value)
    return;
  guardando.value = true;

  try {
    const { data } = await miApi.put('disponibilidad', {
      franjas: franjas.value,
    });

    emit('guardada', data);
    useAlert(t('PORTELIA.AGENDA.FRANJAS.GUARDADAS'));
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
    :title="t('PORTELIA.AGENDA.FRANJAS.TITULO')"
    :description="t('PORTELIA.AGENDA.FRANJAS.DESCRIPCION')"
    :confirm-button-label="t('PORTELIA.FICHA.GUARDAR')"
    :disable-confirm-button="!cargada || cargando || hayInvalidas"
    :is-loading="guardando"
    overflow-y-auto
    @confirm="guardar"
    @close="abort"
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
    <div v-else class="flex flex-col gap-3">
      <div
        v-for="dia in porDia"
        :key="dia.diaSemana"
        class="flex flex-col gap-2 pb-3 border-b border-n-weak last:border-b-0"
      >
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-n-slate-12">
            {{ t(`PORTELIA.AGENDA.DIA.${dia.diaSemana}`) }}
          </span>
          <Button
            type="button"
            variant="faded"
            color="slate"
            size="xs"
            icon="i-lucide-plus"
            :label="t('PORTELIA.AGENDA.FRANJAS.AGREGAR')"
            @click="agregar(dia.diaSemana)"
          />
        </div>
        <p v-if="!dia.franjas.length" class="mb-0 text-sm text-n-slate-11">
          {{ t('PORTELIA.AGENDA.FRANJAS.SIN_FRANJA') }}
        </p>
        <div
          v-for="(franja, indice) in dia.franjas"
          :key="indice"
          class="flex items-center gap-2"
        >
          <Input
            v-model="franja.desde"
            type="time"
            class="flex-1"
            :aria-label="
              t('PORTELIA.AGENDA.FRANJAS.DESDE_DIA', {
                dia: t(`PORTELIA.AGENDA.DIA.${dia.diaSemana}`),
              })
            "
          />
          <span class="text-sm text-n-slate-11">
            {{ t('PORTELIA.AGENDA.FRANJAS.HASTA') }}
          </span>
          <Input
            v-model="franja.hasta"
            type="time"
            class="flex-1"
            :aria-label="
              t('PORTELIA.AGENDA.FRANJAS.HASTA_DIA', {
                dia: t(`PORTELIA.AGENDA.DIA.${dia.diaSemana}`),
              })
            "
          />
          <Button
            type="button"
            variant="ghost"
            color="slate"
            size="xs"
            icon="i-lucide-trash-2"
            :aria-label="t('PORTELIA.AGENDA.FRANJAS.QUITAR')"
            @click="quitar(franja)"
          />
        </div>
      </div>
    </div>
  </DialogoAsesor>
</template>
