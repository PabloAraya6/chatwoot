<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAccount } from 'dashboard/composables/useAccount';
import CardLayout from 'dashboard/components-next/CardLayout.vue';
import Label from 'dashboard/components-next/label/Label.vue';
import Icon from 'dashboard/components-next/icon/Icon.vue';
import { COLOR_ESTADO, lugarDe, precioDe, tituloDe } from './propiedad';

const props = defineProps({
  propiedad: { type: Object, required: true },
});

const { t } = useI18n();
const { accountScopedRoute } = useAccount();

const destino = computed(() =>
  accountScopedRoute('portelia_propiedad', { propiedadId: props.propiedad.id })
);
const foto = computed(() => props.propiedad.fotos[0]);
const titulo = computed(() => tituloDe(props.propiedad, t));
const lugar = computed(() => lugarDe(props.propiedad));
const precio = computed(() => precioDe(props.propiedad, t));
</script>

<template>
  <RouterLink :to="destino" class="block">
    <CardLayout layout="row" class="hover:bg-n-slate-2 dark:hover:bg-n-solid-3">
      <div class="flex items-center flex-1 min-w-0 gap-4">
        <img
          v-if="foto"
          :src="foto"
          :alt="titulo"
          class="object-cover rounded-lg size-16 shrink-0 bg-n-slate-3"
        />
        <div
          v-else
          class="flex items-center justify-center rounded-lg size-16 shrink-0 bg-n-slate-3"
        >
          <Icon icon="i-lucide-house" class="size-6 text-n-slate-10" />
        </div>
        <div class="flex flex-col flex-1 min-w-0 gap-1">
          <span class="text-base font-medium truncate text-n-slate-12">
            {{ titulo }}
          </span>
          <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span class="text-sm font-medium text-n-slate-12">{{
              precio
            }}</span>
            <span v-if="lugar" class="text-sm truncate text-n-slate-11">
              {{ lugar }}
            </span>
          </div>
          <div class="flex flex-wrap items-center gap-1.5">
            <Label
              :label="t(`PORTELIA.PROPIEDADES.ESTADO.${propiedad.estado}`)"
              :color="COLOR_ESTADO[propiedad.estado]"
              compact
            />
            <Label
              :label="
                t(`PORTELIA.PROPIEDADES.OPERACION.${propiedad.operacion}`)
              "
              compact
            />
            <Label
              :label="t(`PORTELIA.PROPIEDADES.TIPO.${propiedad.tipo}`)"
              compact
            />
          </div>
        </div>
        <Icon
          icon="i-lucide-chevron-right"
          class="hidden sm:block size-4 shrink-0 text-n-slate-10"
        />
      </div>
    </CardLayout>
  </RouterLink>
</template>
