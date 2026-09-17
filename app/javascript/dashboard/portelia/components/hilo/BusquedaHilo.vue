<script setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAbortableRequest } from 'dashboard/composables/useAbortableRequest';
import Button from 'dashboard/components-next/button/Button.vue';
import miApi from '../../api/miApi';
import { encabezadoBusqueda, detalleBusqueda } from './brief';
import { useUISettings } from 'dashboard/composables/useUISettings';
import { useEmitter } from 'dashboard/composables/emitter';
import { BUSQUEDA_ACTUALIZADA } from '../ficha/eventos';

const props = defineProps({
  contactId: { type: Number, required: true },
  resumen: { type: String, default: '' },
});
const { t } = useI18n();
const { updateUISettings } = useUISettings();
const busquedas = ref([]);
const fallo = ref(false);
const { run } = useAbortableRequest();
const vigentes = computed(() => busquedas.value.filter(b => b.vigente));
const cargar = async () => {
  busquedas.value = [];
  fallo.value = false;
  try {
    const respuesta = await run(signal =>
      miApi.get(`personas/${props.contactId}`, { signal })
    );
    if (respuesta) {
      busquedas.value = respuesta.data.busquedas;
    }
  } catch {
    fallo.value = true;
  }
};
watch(() => [props.contactId, props.resumen], cargar, { immediate: true });
useEmitter(BUSQUEDA_ACTUALIZADA, busqueda => {
  busquedas.value = busquedas.value.map(b =>
    b.id === busqueda.id ? busqueda : b
  );
});
</script>

<template>
  <div class="min-w-0 px-4 pt-2">
    <details
      v-if="vigentes.length || resumen"
      class="group text-sm text-n-slate-11"
    >
      <summary
        class="flex min-h-11 cursor-pointer list-none items-start justify-between gap-2 [&::-webkit-details-marker]:hidden"
      >
        <span class="min-w-0">
          <span
            v-if="vigentes.length"
            class="block font-medium text-n-slate-12"
            >{{ encabezadoBusqueda(vigentes[0], t) }}</span
          >
          <span v-if="vigentes.length" class="block text-xs leading-5">{{
            detalleBusqueda(vigentes[0], t)
          }}</span>
          <span v-else class="line-clamp-2 text-sm leading-5 text-n-slate-12">{{
            resumen
          }}</span>
        </span>
        <span
          class="i-lucide-chevron-down mt-1 size-4 shrink-0 group-open:rotate-180"
        />
      </summary>
      <div class="max-h-40 overflow-y-auto py-2">
        <p v-if="resumen && vigentes.length" class="mb-2 leading-relaxed">
          {{ resumen }}
        </p>
        <p
          v-for="busqueda in vigentes.slice(1)"
          :key="busqueda.id"
          class="mb-2"
        >
          {{ encabezadoBusqueda(busqueda, t) }}<br />{{
            detalleBusqueda(busqueda, t)
          }}
        </p>
        <Button
          :label="t('PORTELIA.FICHA.BUSQUEDA.TITULO')"
          icon="i-lucide-pencil"
          variant="ghost"
          color="slate"
          size="sm"
          @click="
            updateUISettings({
              is_contact_sidebar_open: true,
              is_copilot_panel_open: false,
            })
          "
        />
      </div>
    </details>
    <Button
      v-if="fallo"
      :label="t('PORTELIA.HILO.REINTENTAR_BUSQUEDA')"
      variant="ghost"
      color="slate"
      size="sm"
      @click="cargar"
    />
  </div>
</template>
