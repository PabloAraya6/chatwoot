<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAccount } from 'dashboard/composables/useAccount';
import CardLayout from 'dashboard/components-next/CardLayout.vue';
import Label from 'dashboard/components-next/label/Label.vue';
import Button from 'dashboard/components-next/button/Button.vue';
import { nombrePropiedad } from '../ficha/formato';
import { COLOR_ESTADO, TRANSICIONES, horaDe } from './visita';

// Una Visita en la Agenda: hora, Persona, Propiedad, estado y los taps que la mueven. Qué
// taps existen lo dice la tabla de transiciones; el orden y el color, esta lista.
const props = defineProps({
  visita: { type: Object, required: true },
  nombrePersona: { type: String, default: '' },
  ocupada: { type: Boolean, default: false },
});

const emit = defineEmits(['mover']);

const { t } = useI18n();
const { accountScopedRoute } = useAccount();

const ACCIONES = [
  { estado: 'confirmada', icon: 'i-lucide-check', color: 'blue' },
  { estado: 'realizada', icon: 'i-lucide-check-check', color: 'teal' },
  { estado: 'no_se_presento', icon: 'i-lucide-user-x', color: 'slate' },
  { estado: 'cancelada', icon: 'i-lucide-x', color: 'ruby' },
];

const acciones = computed(() =>
  ACCIONES.filter(accion =>
    TRANSICIONES[props.visita.estado].includes(accion.estado)
  )
);

const rutaHilo = computed(() =>
  props.visita.conversationId
    ? accountScopedRoute('inbox_conversation', {
        conversation_id: props.visita.conversationId,
      })
    : accountScopedRoute('contacts_edit', { contactId: props.visita.contactId })
);

const rutaPropiedad = computed(() =>
  accountScopedRoute('portelia_propiedad', {
    propiedadId: props.visita.propiedadId,
  })
);
</script>

<template>
  <CardLayout layout="row" class="!items-start gap-4">
    <div class="flex flex-col items-start w-14 shrink-0 gap-1.5">
      <span class="text-lg font-medium text-n-slate-12">
        {{ horaDe(visita.at) }}
      </span>
      <Label
        :label="t(`PORTELIA.FICHA.VISITAS.ESTADO.${visita.estado}`)"
        :color="COLOR_ESTADO[visita.estado]"
        compact
      />
    </div>
    <div class="flex flex-col flex-1 min-w-0 gap-1">
      <RouterLink
        :to="rutaHilo"
        class="text-base font-medium truncate text-n-slate-12 hover:underline"
      >
        {{ nombrePersona || t('PORTELIA.AGENDA.PERSONA_SIN_NOMBRE') }}
      </RouterLink>
      <RouterLink
        :to="rutaPropiedad"
        class="text-sm truncate text-n-slate-11 hover:underline"
      >
        {{ nombrePropiedad(visita.propiedad) }}
      </RouterLink>
      <p v-if="visita.motivoCancelacion" class="mb-0 text-sm text-n-slate-11">
        {{ visita.motivoCancelacion }}
      </p>
      <div v-if="acciones.length" class="flex flex-wrap gap-1.5 mt-1">
        <Button
          v-for="accion in acciones"
          :key="accion.estado"
          :label="t(`PORTELIA.AGENDA.ACCION.${accion.estado}`)"
          :icon="accion.icon"
          :color="accion.color"
          variant="faded"
          size="xs"
          :disabled="ocupada"
          @click="emit('mover', accion.estado)"
        />
      </div>
    </div>
  </CardLayout>
</template>
