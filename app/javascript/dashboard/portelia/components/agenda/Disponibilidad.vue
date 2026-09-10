<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAlert } from 'dashboard/composables';
import Dialog from 'dashboard/components-next/dialog/Dialog.vue';
import Input from 'dashboard/components-next/input/Input.vue';
import Button from 'dashboard/components-next/button/Button.vue';
import Spinner from 'dashboard/components-next/spinner/Spinner.vue';
import miApi from '../../api/miApi';
import { DIAS_SEMANA } from './visita';

// Las franjas semanales del asesor (ticket 11 del mapa anterior: disponibilidad declarada, sin
// calendario externo). El PUT reemplaza la lista entera, así que acá se edita entera.
const emit = defineEmits(['guardada']);

const { t } = useI18n();

const dialogRef = ref(null);
const franjas = ref([]);
const cargando = ref(false);
const guardando = ref(false);

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

const abrir = async () => {
  dialogRef.value?.open();
  cargando.value = true;
  try {
    franjas.value = (await miApi.get('disponibilidad')).data.map(
      ({ diaSemana, desde, hasta }) => ({ diaSemana, desde, hasta })
    );
  } catch {
    useAlert(t('PORTELIA.AGENDA.ERROR_CARGA'));
  } finally {
    cargando.value = false;
  }
};

const guardar = async () => {
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
  <Dialog
    ref="dialogRef"
    :title="t('PORTELIA.AGENDA.FRANJAS.TITULO')"
    :description="t('PORTELIA.AGENDA.FRANJAS.DESCRIPCION')"
    :confirm-button-label="t('PORTELIA.FICHA.GUARDAR')"
    :disable-confirm-button="hayInvalidas"
    :is-loading="guardando"
    overflow-y-auto
    @confirm="guardar"
  >
    <div v-if="cargando" class="flex justify-center py-4">
      <Spinner />
    </div>
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
          <Input v-model="franja.desde" type="time" size="sm" class="flex-1" />
          <span class="text-sm text-n-slate-11">
            {{ t('PORTELIA.AGENDA.FRANJAS.HASTA') }}
          </span>
          <Input v-model="franja.hasta" type="time" size="sm" class="flex-1" />
          <Button
            variant="ghost"
            color="slate"
            size="xs"
            icon="i-lucide-trash-2"
            @click="quitar(franja)"
          />
        </div>
      </div>
    </div>
  </Dialog>
</template>
