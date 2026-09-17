<script setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAlert } from 'dashboard/composables';
import { useAbortableRequest } from 'dashboard/composables/useAbortableRequest';
import { useAccount } from 'dashboard/composables/useAccount';
import { useMapGetter } from 'dashboard/composables/store';
import Button from 'dashboard/components-next/button/Button.vue';
import Spinner from 'dashboard/components-next/spinner/Spinner.vue';
import EstadoVacio from '../EstadoVacio.vue';
import NuevaVisita from '../agenda/NuevaVisita.vue';
import { fechaCorta, nombrePropiedad } from '../ficha/formato';
import miApi from '../../api/miApi';

const props = defineProps({ chat: { type: Object, required: true } });
const { t } = useI18n();
const { accountScopedRoute } = useAccount();
const currentUserId = useMapGetter('getCurrentUserID');
const { run, isPending } = useAbortableRequest();
const visitas = ref([]);
const fallo = ref(false);
const nuevaVisita = ref(null);
const puedeAgendar = computed(
  () =>
    props.chat.meta?.assignee?.id === currentUserId.value &&
    props.chat.status === 'open' &&
    props.chat.can_reply !== false
);
const cargar = async () => {
  visitas.value = [];
  fallo.value = false;
  try {
    const respuesta = await run(signal =>
      miApi.get(`personas/${props.chat.meta.sender.id}`, { signal })
    );
    if (respuesta) {
      visitas.value = respuesta.data.visitas;
    }
  } catch {
    fallo.value = true;
  }
};
const creada = () => {
  useAlert(t('PORTELIA.AGENDA.NUEVA.CREADA'));
  cargar();
};
watch(() => props.chat.id, cargar, { immediate: true });
</script>

<template>
  <section
    class="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4"
    :aria-label="t('PORTELIA.FICHA.VISITAS.TITULO')"
  >
    <div class="flex min-h-11 flex-wrap items-center justify-end gap-2">
      <Button
        v-if="visitas.length"
        :label="t('PORTELIA.AGENDA.NUEVA.TITULO')"
        icon="i-lucide-calendar-plus"
        variant="faded"
        :disabled="!puedeAgendar"
        class="me-auto"
        @click="nuevaVisita?.abrir()"
      />
      <RouterLink
        :to="accountScopedRoute('portelia_agenda')"
        class="flex min-h-11 items-center text-sm text-n-slate-11 hover:underline"
      >
        {{ t('PORTELIA.AGENDA.TITULO') }}
      </RouterLink>
    </div>
    <div v-if="isPending" class="flex flex-1 items-center justify-center">
      <Spinner />
    </div>
    <div
      v-else-if="fallo"
      role="alert"
      class="flex flex-1 flex-col items-center justify-center gap-2 text-center text-sm text-n-slate-11"
    >
      <p>{{ t('PORTELIA.AGENDA.ERROR_CARGA') }}</p>
      <Button
        :label="t('PORTELIA.REINTENTAR')"
        variant="ghost"
        color="slate"
        @click="cargar"
      />
    </div>
    <EstadoVacio
      v-else-if="!visitas.length"
      :title="t('PORTELIA.FICHA.VISITAS.VACIAS_TITULO')"
      :detail="t('PORTELIA.FICHA.VISITAS.VACIAS_DETALLE')"
      icon="i-lucide-calendar-days"
    >
      <template #actions>
        <Button
          :label="t('PORTELIA.AGENDA.NUEVA.TITULO')"
          icon="i-lucide-calendar-plus"
          :disabled="!puedeAgendar"
          @click="nuevaVisita?.abrir()"
        />
      </template>
    </EstadoVacio>
    <article
      v-for="visita in visitas"
      :key="visita.id"
      class="flex flex-col gap-1 border-b border-n-weak pb-4"
    >
      <time :datetime="visita.at" class="text-sm font-medium text-n-slate-12">{{
        fechaCorta(visita.at)
      }}</time>
      <p class="mb-0 text-sm text-n-slate-12">
        {{ nombrePropiedad(visita.propiedad) }}
      </p>
      <span class="text-xs text-n-slate-11">{{
        t(`PORTELIA.FICHA.VISITAS.ESTADO.${visita.estado}`)
      }}</span>
    </article>
    <NuevaVisita
      ref="nuevaVisita"
      :contact-id="chat.meta.sender.id"
      :conversation-id="chat.id"
      @creada="creada"
    />
  </section>
</template>
