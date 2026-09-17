<script setup>
import { computed, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAccount } from 'dashboard/composables/useAccount';
import { useAbortableRequest } from 'dashboard/composables/useAbortableRequest';
import Button from 'dashboard/components-next/button/Button.vue';
import miApi from '../../api/miApi';
import { tituloDe, precioDe, lugarDe } from '../propiedades/propiedad';

const props = defineProps({
  sugerencia: { type: Object, required: true },
  puedeActuar: { type: Boolean, default: false },
});
defineEmits(['enviar', 'agendar']);
const { t } = useI18n();
const { accountScopedRoute } = useAccount();
const { run, isPending } = useAbortableRequest();
const propiedad = ref(null);
const fallo = ref(false);
const disponible = computed(() => propiedad.value?.estado === 'disponible');
const titulo = computed(() =>
  propiedad.value ? tituloDe(propiedad.value, t) : props.sugerencia.titulo
);
const cargar = async () => {
  fallo.value = false;
  try {
    const respuesta = await run(signal =>
      miApi.get(`propiedades/${props.sugerencia.id}`, { signal })
    );
    if (respuesta) {
      propiedad.value = respuesta.data;
    }
  } catch {
    fallo.value = true;
  }
};
onMounted(cargar);
</script>

<template>
  <article class="flex min-w-0 flex-col gap-3 py-4 first:pt-0">
    <div class="flex min-w-0 gap-3">
      <img
        v-if="propiedad?.fotos?.[0]"
        :src="propiedad.fotos[0]"
        :alt="titulo"
        loading="lazy"
        class="size-16 shrink-0 rounded-lg object-cover bg-n-slate-3"
      />
      <div class="flex min-w-0 flex-1 flex-col gap-1">
        <RouterLink
          :to="
            accountScopedRoute('portelia_propiedad', {
              propiedadId: sugerencia.id,
            })
          "
          class="text-sm font-semibold text-n-slate-12 underline-offset-4 hover:underline focus-visible:underline"
        >
          {{ titulo }}
        </RouterLink>
        <template v-if="propiedad">
          <span class="text-base font-semibold text-n-slate-12">{{
            precioDe(propiedad, t)
          }}</span>
          <span class="text-sm text-n-slate-11">{{
            [
              lugarDe(propiedad),
              propiedad.dormitorios &&
                t('PORTELIA.HILO.DORMITORIOS', { n: propiedad.dormitorios }),
            ]
              .filter(Boolean)
              .join(' · ')
          }}</span>
          <span v-if="!disponible" class="text-sm text-n-amber-11">
            {{ t(`PORTELIA.PROPIEDADES.ESTADO.${propiedad.estado}`) }}
          </span>
        </template>
      </div>
    </div>
    <p
      v-if="sugerencia.motivo && !propiedad"
      class="mb-0 text-sm leading-relaxed text-n-slate-11"
    >
      {{ sugerencia.motivo }}
    </p>
    <div
      v-if="fallo"
      class="flex items-center justify-between gap-2"
      role="alert"
    >
      <span class="text-sm text-n-slate-11">{{
        t('PORTELIA.HILO.PROPIEDAD_ERROR')
      }}</span>
      <Button
        :label="t('PORTELIA.REINTENTAR')"
        variant="ghost"
        color="slate"
        @click="cargar"
      />
    </div>
    <div v-else class="grid grid-cols-2 gap-2">
      <Button
        :label="t('PORTELIA.HILO.ENVIAR_FICHA')"
        icon="i-lucide-send"
        size="sm"
        :is-loading="isPending"
        :disabled="!puedeActuar || !disponible || isPending"
        @click="$emit('enviar', propiedad)"
      />
      <Button
        :label="t('PORTELIA.AGENDA.NUEVA.AGENDAR')"
        icon="i-lucide-calendar-plus"
        size="sm"
        color="slate"
        variant="ghost"
        :disabled="!puedeActuar || !disponible || isPending"
        @click="$emit('agendar', propiedad.id)"
      />
    </div>
  </article>
</template>
