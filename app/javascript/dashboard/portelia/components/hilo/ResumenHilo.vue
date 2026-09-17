<script setup>
import { computed, nextTick, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAlert } from 'dashboard/composables';
import Button from 'dashboard/components-next/button/Button.vue';
import OpcionesHilo from './OpcionesHilo.vue';
import BusquedaHilo from './BusquedaHilo.vue';
import EnviarFichaDialog from '../propiedades/EnviarFichaDialog.vue';
import NuevaVisita from '../agenda/NuevaVisita.vue';
import { tituloDe } from '../propiedades/propiedad';

const props = defineProps({
  traspaso: { type: Object, default: null },
  chat: { type: Object, required: true },
  puedeActuar: { type: Boolean, default: false },
});
const { t } = useI18n();
const opcionesRef = ref(null);
const visitaRef = ref(null);
const enviarRef = ref(null);
const propiedadElegida = ref(null);
const propiedades = computed(() => props.traspaso?.propiedades ?? []);
const siguientePaso = computed(() => {
  if (props.traspaso?.motivo === 'visita') {
    return 'COORDINAR';
  }
  if (propiedades.value.length) {
    return 'OFRECER';
  }
  if (props.traspaso?.motivo === 'sin_match') {
    return 'AMPLIAR';
  }
  return 'CONTINUAR';
});
const enviar = async propiedad => {
  propiedadElegida.value = propiedad;
  await nextTick();
  enviarRef.value.abrir(props.chat.id);
};
</script>

<template>
  <section class="min-w-0" :aria-label="t('PORTELIA.HILO.RESUMEN')">
    <BusquedaHilo
      v-if="chat.meta?.sender?.id"
      :contact-id="chat.meta?.sender?.id ?? 0"
      :resumen="traspaso?.resumen ?? ''"
    />
    <div
      v-if="
        propiedades.length ||
        siguientePaso === 'COORDINAR' ||
        siguientePaso === 'AMPLIAR'
      "
      class="flex items-center justify-between gap-2 px-4 py-1"
    >
      <Button
        v-if="propiedades.length && siguientePaso !== 'COORDINAR'"
        :label="t('PORTELIA.HILO.OPCIONES', { n: propiedades.length })"
        icon="i-lucide-house"
        variant="faded"
        size="sm"
        aria-haspopup="dialog"
        @click="opcionesRef.abrir()"
      />
      <span
        v-else-if="siguientePaso === 'AMPLIAR'"
        class="text-xs text-n-slate-11"
        >{{ t(`PORTELIA.HILO.PASO.${siguientePaso}`) }}</span
      >
      <Button
        v-if="siguientePaso === 'COORDINAR'"
        :label="t('PORTELIA.AGENDA.NUEVA.TITULO')"
        icon="i-lucide-calendar-plus"
        variant="faded"
        size="sm"
        :disabled="!puedeActuar"
        @click="visitaRef.abrir()"
      />
    </div>
    <OpcionesHilo
      ref="opcionesRef"
      :propiedades="propiedades"
      :puede-actuar="puedeActuar"
      @enviar="enviar"
      @agendar="visitaRef.abrir($event)"
    />
    <EnviarFichaDialog
      ref="enviarRef"
      :propiedad-id="propiedadElegida?.id ?? ''"
      :propiedad-titulo="propiedadElegida ? tituloDe(propiedadElegida, t) : ''"
      :destinatario="{ id: chat.id, nombre: chat.meta?.sender?.name }"
    />
    <NuevaVisita
      ref="visitaRef"
      :contact-id="chat.meta?.sender?.id ?? 0"
      :conversation-id="chat.id"
      @creada="useAlert(t('PORTELIA.AGENDA.NUEVA.CREADA'))"
    />
  </section>
</template>
