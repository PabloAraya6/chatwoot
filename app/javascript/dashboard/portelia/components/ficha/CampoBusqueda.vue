<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ListAttribute from 'dashboard/components-next/CustomAttributes/ListAttribute.vue';
import OtherAttribute from 'dashboard/components-next/CustomAttributes/OtherAttribute.vue';
import Switch from 'dashboard/components-next/switch/Switch.vue';
import Label from 'dashboard/components-next/label/Label.vue';
import { atributoDe, valorParaApi } from './camposBusqueda';

const props = defineProps({
  busqueda: { type: Object, required: true },
  definicion: { type: Object, required: true },
});

const emit = defineEmits(['update']);

const { t } = useI18n();

const etiqueta = computed(() =>
  t(`PORTELIA.FICHA.CAMPOS.${props.definicion.campo}`)
);

const atributo = computed(() =>
  atributoDe(props.busqueda, props.definicion, etiqueta.value)
);

const PROCEDENCIA_COLOR = { humano: 'teal', asistente: 'iris', web: 'slate' };

const procedencia = computed(
  () => props.busqueda.procedencias?.[props.definicion.campo]
);

const emitir = valor => emit('update', valorParaApi(props.definicion, valor));
</script>

<template>
  <div
    class="grid grid-cols-[140px,1fr] group/attribute items-center w-full gap-2 min-h-10"
  >
    <div class="flex flex-col items-start min-w-0 gap-0.5">
      <span class="text-sm font-medium truncate text-n-slate-12">
        {{ etiqueta }}
      </span>
      <Label
        v-if="procedencia"
        :label="t(`PORTELIA.FICHA.PROCEDENCIA.${procedencia}`)"
        :color="PROCEDENCIA_COLOR[procedencia]"
        compact
      />
    </div>
    <Switch
      v-if="definicion.tipo === 'checkbox'"
      class="justify-self-end"
      :model-value="Boolean(busqueda[definicion.campo])"
      @update:model-value="emitir"
    />
    <ListAttribute
      v-else-if="definicion.tipo === 'list'"
      :attribute="atributo"
      @update="emitir"
    />
    <OtherAttribute v-else :attribute="atributo" @update="emitir" />
  </div>
</template>
