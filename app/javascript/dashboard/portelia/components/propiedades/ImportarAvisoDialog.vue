<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Dialog from 'dashboard/components-next/dialog/Dialog.vue';
import Input from 'dashboard/components-next/input/Input.vue';
import miApi from '../../api/miApi';

const emit = defineEmits(['importada']);

const { t } = useI18n();

const dialogRef = ref(null);
const url = ref('');
const error = ref('');
const importando = ref(false);

const importar = async () => {
  if (!url.value.trim() || importando.value) return;
  importando.value = true;
  error.value = '';
  try {
    const { data } = await miApi.post('propiedades/importar', {
      url: url.value.trim(),
    });
    dialogRef.value.close();
    emit('importada', data);
  } catch (e) {
    error.value =
      e.response?.data?.error || t('PORTELIA.PROPIEDADES.IMPORTAR.ERROR');
  } finally {
    importando.value = false;
  }
};

// Con un link ya en la mano (compartido desde el celular) se importa sin pedir nada más.
const abrir = (urlInicial = '') => {
  url.value = urlInicial;
  error.value = '';
  dialogRef.value.open();
  if (urlInicial) importar();
};

defineExpose({ abrir });
</script>

<template>
  <Dialog
    ref="dialogRef"
    :title="t('PORTELIA.PROPIEDADES.IMPORTAR.TITULO')"
    :description="t('PORTELIA.PROPIEDADES.IMPORTAR.DESCRIPCION')"
    :confirm-button-label="t('PORTELIA.PROPIEDADES.IMPORTAR.CONFIRMAR')"
    :is-loading="importando"
    :disable-confirm-button="!url.trim()"
    @confirm="importar"
  >
    <form class="flex flex-col gap-2" @submit.prevent="importar">
      <Input
        v-model="url"
        type="url"
        autofocus
        :label="t('PORTELIA.PROPIEDADES.IMPORTAR.URL')"
        :placeholder="t('PORTELIA.PROPIEDADES.IMPORTAR.PLACEHOLDER')"
        :message="error"
        :message-type="error ? 'error' : 'info'"
        :disabled="importando"
      />
      <p v-if="importando" class="mb-0 text-sm text-n-slate-11">
        {{ t('PORTELIA.PROPIEDADES.IMPORTAR.LEYENDO') }}
      </p>
    </form>
  </Dialog>
</template>
