<script setup>
import { computed, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { useAlert } from 'dashboard/composables';
import { useAbortableRequest } from 'dashboard/composables/useAbortableRequest';
import { useMapGetter } from 'dashboard/composables/store';
import ConversationApi from 'dashboard/api/inbox/conversation';
import Banner from 'dashboard/components-next/banner/Banner.vue';
import Button from 'dashboard/components-next/button/Button.vue';
import miApi from '../api/miApi';

// Arriba del hilo: de quién es la conversación y, si la secretaria la pasó, su nota de
// traspaso (content_attributes.traspaso de la nota privada que deja al asignar). Si un humano
// ya habló, la secretaria calla en esta conversación (ticket 08): se dice y se puede
// devolvérsela, que la desasigna y la deja atendiendo de nuevo.
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

const tomando = ref(false);

const tomar = async () => {
  if (tomando.value) return;
  tomando.value = true;
  const conversationId = props.chat.id;

  try {
    const { data } = await ConversationApi.assignAgent({
      conversationId,
      agentId: currentUserId.value,
    });
    await store.dispatch('setCurrentChatAssignee', {
      conversationId,
      assignee: data,
    });
  } catch {
    useAlert(t('PORTELIA.HILO.TOMAR_ERROR'));
  } finally {
    tomando.value = false;
  }
};

// El estado lo deriva la API del mismo hilo que lee la secretaria; se relee cuando cambia
// la conversación o llega un mensaje, que es lo único que lo mueve.
const secretaria = ref(null);

const devolviendo = ref(false);

const estadoFallido = ref(false);

const { run } = useAbortableRequest();

const leerSecretaria = async () => {
  secretaria.value = null;
  estadoFallido.value = false;

  try {
    const respuesta = await run(signal =>
      miApi.get(`conversaciones/${props.chat.id}/secretaria`, { signal })
    );
    if (respuesta) secretaria.value = respuesta.data;
  } catch {
    estadoFallido.value = true;
  }
};

watch(() => [props.chat.id, props.chat.messages?.length], leerSecretaria, {
  immediate: true,
});

const calla = computed(
  () => secretaria.value?.estado === 'humano' && secretaria.value.modo !== 'off'
);

const devolver = async () => {
  if (devolviendo.value) return;
  devolviendo.value = true;

  try {
    await miApi.post(`conversaciones/${props.chat.id}/secretaria`);
    useAlert(t('PORTELIA.HILO.DEVUELTA'));
    await leerSecretaria();
  } catch {
    useAlert(t('PORTELIA.HILO.DEVOLVER_ERROR'));
  } finally {
    devolviendo.value = false;
  }
};
</script>

<template>
  <!-- En el celular el botón flotante del panel del contacto se superpone al borde derecho. -->
  <div
    class="flex flex-col gap-1.5 border-b border-n-weak bg-n-solid-1 px-3 py-2 text-sm max-md:pe-20 break-words min-w-0"
  >
    <div
      class="flex flex-wrap items-center justify-between gap-2 [&_button]:min-h-11 [&_button]:min-w-11"
    >
      <span
        class="flex min-w-0 items-center gap-1.5 font-medium text-n-slate-12"
      >
        <span
          class="size-4 text-n-slate-11"
          :class="
            estado === 'guardia' ? 'i-lucide-bell-ring' : 'i-lucide-user-check'
          "
        />
        <span v-if="estado === 'guardia'" class="md:hidden">
          {{ t('PORTELIA.BANDEJA.GUARDIA') }}
        </span>
        <span :class="{ 'hidden md:inline': estado === 'guardia' }">
          {{
            t(`PORTELIA.HILO.${estado.toUpperCase()}`, {
              nombre: asignado?.name,
            })
          }}
        </span>
      </span>
      <Button
        v-if="estado === 'guardia'"
        :label="t('PORTELIA.HILO.TOMAR')"
        icon="i-lucide-hand"
        size="sm"
        color="blue"
        :is-loading="tomando"
        :disabled="tomando"
        @click="tomar"
      />
    </div>
    <Banner
      v-if="estadoFallido"
      color="amber"
      role="alert"
      :action-label="t('PORTELIA.REINTENTAR')"
      @action="leerSecretaria"
    >
      {{ t('PORTELIA.HILO.ESTADO_ERROR') }}
    </Banner>
    <div v-if="calla" class="flex flex-wrap items-center justify-between gap-2">
      <span class="flex items-center gap-1.5 text-n-slate-11">
        <span class="i-lucide-bot-off size-4 shrink-0" />
        {{ t('PORTELIA.HILO.CALLA') }}
      </span>
      <Button
        :label="t('PORTELIA.HILO.DEVOLVER')"
        icon="i-lucide-bot"
        size="sm"
        variant="faded"
        color="slate"
        :is-loading="devolviendo"
        :disabled="devolviendo"
        @click="devolver"
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
