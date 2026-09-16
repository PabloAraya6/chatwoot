<script setup>
import { computed, nextTick, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'dashboard/components-next/button/Button.vue';
import Input from 'dashboard/components-next/input/Input.vue';
import Select from 'dashboard/components-next/select/Select.vue';
import TextArea from 'dashboard/components-next/textarea/TextArea.vue';
import Label from 'dashboard/components-next/label/Label.vue';
import { atributoDe, valorParaApi } from './camposBusqueda';

const props = defineProps({
  busqueda: { type: Object, required: true },
  definicion: { type: Object, required: true },
  guardar: { type: Function, required: true },
  disabled: { type: Boolean, default: false },
});

const { t } = useI18n();
const editando = ref(false);
const guardando = ref(false);
const borrador = ref('');
const error = ref('');
const valorRef = ref(null);
const formRef = ref(null);
const etiqueta = computed(() =>
  t(`PORTELIA.FICHA.CAMPOS.${props.definicion.campo}`)
);
const procedencia = computed(
  () => props.busqueda.procedencias?.[props.definicion.campo]
);
const PROCEDENCIA_COLOR = { humano: 'teal', asistente: 'iris', web: 'slate' };
const opciones = computed(() => {
  if (props.definicion.tipo === 'checkbox')
    return [
      { value: true, label: t('PORTELIA.FICHA.SI') },
      { value: false, label: t('PORTELIA.FICHA.NO') },
    ];
  const prefijo = { operacion: 'OPERACION', tipoPropiedad: 'TIPO' }[
    props.definicion.campo
  ];
  return (props.definicion.valores ?? []).map(value => ({
    value,
    label: prefijo ? t(`PORTELIA.PROPIEDADES.${prefijo}.${value}`) : value,
  }));
});
const valor = computed(
  () => atributoDe(props.busqueda, props.definicion, etiqueta.value).value
);
const texto = computed(
  () =>
    opciones.value.find(o => o.value === valor.value)?.label ??
    (valor.value === '' ? t('PORTELIA.FICHA.SIN_DATO') : String(valor.value))
);
const multilinea = computed(() =>
  ['requisitos', 'ultimoHablado'].includes(props.definicion.campo)
);
const incompleto = computed(
  () =>
    borrador.value === '' ||
    (typeof borrador.value === 'string' && !borrador.value.trim())
);

const editar = async () => {
  borrador.value = valor.value;
  error.value = '';
  editando.value = true;
  await nextTick();
  formRef.value?.querySelector('input, select, textarea')?.focus();
};

const cancelar = async () => {
  if (guardando.value) return;
  editando.value = false;
  await nextTick();
  valorRef.value?.$el.focus();
};

const confirmar = async () => {
  if (guardando.value || props.disabled || incompleto.value) return;
  guardando.value = true;
  error.value = '';
  try {
    await props.guardar(valorParaApi(props.definicion, borrador.value));
    guardando.value = false;
    await cancelar();
  } catch (e) {
    error.value = e.response?.data?.error || t('PORTELIA.FICHA.ERROR_GUARDAR');
  } finally {
    guardando.value = false;
  }
};
</script>

<template>
  <div
    class="grid grid-cols-2 items-start w-full gap-x-3 gap-y-2 py-1 min-h-11 border-b border-n-weak last:border-0"
  >
    <div class="flex flex-col items-start min-w-0 gap-1 py-2">
      <span class="text-sm font-medium break-words text-n-slate-12">{{
        etiqueta
      }}</span>
      <Label
        v-if="procedencia"
        :label="t(`PORTELIA.FICHA.PROCEDENCIA.${procedencia}`)"
        :color="PROCEDENCIA_COLOR[procedencia]"
        compact
      />
    </div>
    <Button
      v-if="!editando"
      ref="valorRef"
      color="slate"
      variant="ghost"
      justify="start"
      :disabled="disabled"
      :aria-label="
        t('PORTELIA.FICHA.EDITAR_CAMPO', { campo: etiqueta, valor: texto })
      "
      class="!h-auto min-h-11 w-full !px-2"
      @click="editar"
    >
      <span
        class="min-w-0 text-sm text-start break-words whitespace-normal"
        :class="{ 'line-clamp-3': multilinea }"
        >{{ texto }}</span
      >
      <span class="i-lucide-pencil size-4 shrink-0" aria-hidden="true" />
    </Button>
    <form
      v-else
      ref="formRef"
      class="col-span-2 flex flex-col min-w-0 gap-2"
      @submit.prevent="confirmar"
      @keydown.esc.prevent.stop="cancelar"
    >
      <Select
        v-if="opciones.length"
        v-model="borrador"
        :options="opciones"
        :placeholder="t('PORTELIA.FICHA.SIN_DATO')"
        :aria-label="etiqueta"
        :disabled="guardando"
        class="w-full [&>select]:w-full [&>select]:min-h-11 [&>select]:text-base"
      />
      <TextArea
        v-else-if="multilinea"
        v-model="borrador"
        :label="etiqueta"
        :disabled="guardando"
        autofocus
        class="[&_textarea]:text-base"
      />
      <Input
        v-else
        v-model="borrador"
        :type="definicion.tipo === 'number' ? 'number' : 'text'"
        :inputmode="definicion.tipo === 'number' ? 'numeric' : 'text'"
        :label="etiqueta"
        :disabled="guardando"
        autofocus
        custom-input-class="min-h-11 !text-base"
      />
      <p v-if="error" role="alert" class="m-0 text-sm text-n-ruby-11">
        {{ error }}
      </p>
      <div class="flex justify-end gap-2">
        <Button
          type="button"
          variant="faded"
          color="slate"
          :label="t('PORTELIA.FICHA.CANCELAR')"
          :disabled="guardando"
          class="min-h-11"
          @click="cancelar"
        />
        <Button
          type="submit"
          :label="t('PORTELIA.FICHA.GUARDAR')"
          :is-loading="guardando"
          :disabled="disabled || guardando || incompleto"
          class="min-h-11"
        />
      </div>
    </form>
  </div>
</template>
