<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { useMapGetter } from 'dashboard/composables/store';
import Button from 'dashboard/components-next/button/Button.vue';

// Arriba del hilo: de quién es la conversación y, si la secretaria la pasó, su nota de
// traspaso (content_attributes.traspaso de la nota privada que deja al asignar).
const props = defineProps({
  chat: { type: Object, required: true },
});

const store = useStore();
const { t } = useI18n();
const currentUserId = useMapGetter('getCurrentUserID');

const asignado = computed(() => props.chat.meta?.assignee);

const estado = computed(() => {
  if (!asignado.value) return 'guardia';
  return asignado.value.id === currentUserId.value ? 'mio' : 'otro';
});

const traspaso = computed(
  () =>
    [...(props.chat.messages ?? [])]
      .reverse()
      .find(mensaje => mensaje.private && mensaje.content_attributes?.traspaso)
      ?.content_attributes.traspaso
);

const tomar = () =>
  store.dispatch('assignAgent', {
    conversationId: props.chat.id,
    agentId: currentUserId.value,
  });
</script>

<template>
  <div
    class="flex flex-col gap-1.5 border-b border-n-weak bg-n-solid-1 px-3 py-2 text-sm"
  >
    <div class="flex items-center justify-between gap-2">
      <span class="flex items-center gap-1.5 font-medium text-n-slate-12">
        <span
          class="size-4 text-n-slate-11"
          :class="
            estado === 'guardia' ? 'i-lucide-bell-ring' : 'i-lucide-user-check'
          "
        />
        {{
          t(`PORTELIA.HILO.${estado.toUpperCase()}`, {
            nombre: asignado?.name,
          })
        }}
      </span>
      <Button
        v-if="estado === 'guardia'"
        :label="t('PORTELIA.HILO.TOMAR')"
        icon="i-lucide-hand"
        size="sm"
        color="blue"
        @click="tomar"
      />
    </div>
    <template v-if="traspaso">
      <p class="text-n-slate-11">
        <span class="font-medium text-n-slate-12">
          {{ t('PORTELIA.HILO.TRASPASO') }}
        </span>
        {{ traspaso.resumen }}
      </p>
      <ul v-if="traspaso.propiedades?.length" class="m-0 flex flex-col gap-0.5">
        <li
          v-for="propiedad in traspaso.propiedades"
          :key="propiedad.id"
          class="flex items-baseline gap-1.5 text-n-slate-11"
        >
          <span class="i-lucide-house size-3.5 shrink-0 translate-y-0.5" />
          <span>
            {{
              [propiedad.titulo, propiedad.motivo].filter(Boolean).join(' · ')
            }}
          </span>
        </li>
      </ul>
    </template>
  </div>
</template>
