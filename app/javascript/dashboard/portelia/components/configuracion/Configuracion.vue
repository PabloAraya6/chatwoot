<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAlert } from 'dashboard/composables';
import BaseSettingsHeader from 'dashboard/routes/dashboard/settings/components/BaseSettingsHeader.vue';
import SectionLayout from 'dashboard/routes/dashboard/settings/account/components/SectionLayout.vue';
import Button from 'dashboard/components-next/button/Button.vue';
import Banner from 'dashboard/components-next/banner/Banner.vue';
import Input from 'dashboard/components-next/input/Input.vue';
import Select from 'dashboard/components-next/select/Select.vue';
import Spinner from 'dashboard/components-next/spinner/Spinner.vue';
import Switch from 'dashboard/components-next/switch/Switch.vue';
import TextArea from 'dashboard/components-next/textarea/TextArea.vue';
import miApi from '../../api/miApi';

// La secretaria por Cuenta (ticket 08): modo, horario, cómo te presenta, tono y techos de
// gasto, sobre /mi/api/cuenta. La API la relee en cada ráfaga, así que guardar alcanza.

const { t } = useI18n();

const MODOS = ['siempre', 'fuera_de_horario', 'off'];

const cargando = ref(true);

const guardando = ref(false);

const error = ref('');

const cuenta = ref(null);

const gasto = ref(null);

// Aparte de `campos`, que son strings de inputs de texto: este es un booleano y pasarlo por
// el String() de desdeCuenta lo dejaría siempre prendido.
const muestraPropiedades = ref(false);

const campos = reactive({
  modoSecretaria: 'off',
  horarioAtencion: '',
  horarioSabados: '',
  horarioDomingos: '',
  nombreAsesor: '',
  comoRespondemos: '',
  techoUsdPorConversacion: '',
  techoUsdPorMes: '',
});

const opcionesModo = computed(() =>
  MODOS.map(modo => ({
    value: modo,
    label: t(`PORTELIA.CONFIGURACION.MODO.${modo}`),
  }))
);

const usd = valor => Number(valor).toFixed(2);

const consumoConversacion = computed(() => {
  const masCara = gasto.value?.conversacionMasCara;

  if (!masCara) return t('PORTELIA.CONFIGURACION.GASTO.SIN_GASTO');

  return t('PORTELIA.CONFIGURACION.GASTO.MAS_CARA', {
    usd: usd(masCara.costoUsd),
    id: masCara.conversationId,
  });
});

const consumoMes = computed(() => {
  if (!gasto.value || gasto.value.conversaciones === 0)
    return t('PORTELIA.CONFIGURACION.GASTO.SIN_GASTO');

  return t('PORTELIA.CONFIGURACION.GASTO.DEL_MES', {
    usd: usd(gasto.value.totalUsd),
    n: gasto.value.conversaciones,
  });
});

const desdeCuenta = datos => {
  Object.keys(campos).forEach(campo => {
    campos[campo] = String(datos[campo] ?? '');
  });
  muestraPropiedades.value = datos.muestraPropiedades === true;
};

const aCuenta = () => ({
  ...cuenta.value,
  modoSecretaria: campos.modoSecretaria,
  horarioAtencion: campos.horarioAtencion.trim(),
  horarioSabados: campos.horarioSabados.trim(),
  horarioDomingos: campos.horarioDomingos.trim(),
  nombreAsesor: campos.nombreAsesor.trim(),
  comoRespondemos: campos.comoRespondemos.trim(),
  techoUsdPorConversacion: Number(campos.techoUsdPorConversacion),
  techoUsdPorMes: Number(campos.techoUsdPorMes),
  muestraPropiedades: muestraPropiedades.value,
});

const cargar = async () => {
  cargando.value = true;
  error.value = '';

  try {
    const [respuestaCuenta, respuestaGasto] = await Promise.all([
      miApi.get('cuenta'),
      miApi.get('cuenta/gasto'),
    ]);

    cuenta.value = respuestaCuenta.data;
    gasto.value = respuestaGasto.data;
    desdeCuenta(cuenta.value);
  } catch {
    error.value = t('PORTELIA.CONFIGURACION.ERROR_CARGA');
  } finally {
    cargando.value = false;
  }
};

const guardar = async () => {
  if (guardando.value) return;
  guardando.value = true;
  error.value = '';

  try {
    cuenta.value = (await miApi.put('cuenta', aCuenta())).data;
    desdeCuenta(cuenta.value);
    useAlert(t('PORTELIA.CONFIGURACION.GUARDADO'));
  } catch (e) {
    error.value = e.response?.data?.error || t('PORTELIA.CONFIGURACION.ERROR');
  } finally {
    guardando.value = false;
  }
};

onMounted(cargar);
</script>

<template>
  <section
    class="flex flex-col w-full h-full px-4 sm:px-6 pt-4 pb-4 overflow-auto bg-n-surface-1 [&_button:not([role=switch])]:min-h-11 [&_button:not([role=switch])]:min-w-11 [&_input:not([type=checkbox])]:min-h-11 [&_select]:min-h-11 max-sm:[&_input]:text-base max-sm:[&_textarea]:text-base max-sm:[&_select]:text-base motion-reduce:[&_*]:!transition-none"
  >
    <div class="flex flex-col w-full max-w-2xl mx-auto">
      <BaseSettingsHeader
        :title="t('PORTELIA.CONFIGURACION.TITULO')"
        :description="t('PORTELIA.CONFIGURACION.DESCRIPCION')"
      />
      <div v-if="cargando" class="flex justify-center py-20">
        <Spinner />
      </div>
      <Banner
        v-else-if="!cuenta"
        color="ruby"
        role="alert"
        :action-label="t('PORTELIA.REINTENTAR')"
        @action="cargar"
      >
        {{ error }}
      </Banner>
      <form v-else class="flex flex-col mt-3" @submit.prevent="guardar">
        <SectionLayout
          :title="t('PORTELIA.CONFIGURACION.SECRETARIA.TITULO')"
          :description="t('PORTELIA.CONFIGURACION.SECRETARIA.DESCRIPCION')"
          class="!pt-0"
        >
          <div class="grid gap-4">
            <label class="flex flex-col gap-1">
              <span class="text-sm font-medium text-n-slate-12">
                {{ t('PORTELIA.CONFIGURACION.MODO.LABEL') }}
              </span>
              <Select
                v-model="campos.modoSecretaria"
                :options="opcionesModo"
                class="!w-full [&>select]:w-full"
              />
            </label>
            <template v-if="campos.modoSecretaria === 'fuera_de_horario'">
              <Input
                v-model="campos.horarioAtencion"
                :label="t('PORTELIA.CONFIGURACION.HORARIO.SEMANA')"
                placeholder="09:00-13:00,17:00-20:30"
              />
              <p class="mb-0 -mt-3 text-xs text-n-slate-11">
                {{ t('PORTELIA.CONFIGURACION.HORARIO.AYUDA') }}
              </p>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  v-model="campos.horarioSabados"
                  :label="t('PORTELIA.CONFIGURACION.HORARIO.SABADOS')"
                  placeholder="09:00-13:00"
                />
                <Input
                  v-model="campos.horarioDomingos"
                  :label="t('PORTELIA.CONFIGURACION.HORARIO.DOMINGOS')"
                />
              </div>
            </template>
            <Input
              v-model="campos.nombreAsesor"
              :label="t('PORTELIA.CONFIGURACION.NOMBRE_ASESOR')"
              :message="t('PORTELIA.CONFIGURACION.NOMBRE_ASESOR_AYUDA')"
              required
            />
            <label
              class="flex items-center justify-between min-h-11 gap-4 cursor-pointer"
            >
              <span class="flex flex-col gap-1">
                <span class="text-sm font-medium text-n-slate-12">
                  {{ t('PORTELIA.CONFIGURACION.MUESTRA_PROPIEDADES.LABEL') }}
                </span>
                <span class="text-xs text-n-slate-11">
                  {{ t('PORTELIA.CONFIGURACION.MUESTRA_PROPIEDADES.AYUDA') }}
                </span>
              </span>
              <Switch
                v-model="muestraPropiedades"
                :aria-label="
                  t('PORTELIA.CONFIGURACION.MUESTRA_PROPIEDADES.LABEL')
                "
                class="shrink-0"
              />
            </label>
            <TextArea
              v-model="campos.comoRespondemos"
              :label="t('PORTELIA.CONFIGURACION.COMO_RESPONDEMOS')"
              :max-length="4000"
              auto-height
            />
            <p class="mb-0 -mt-3 text-xs text-n-slate-11">
              {{ t('PORTELIA.CONFIGURACION.COMO_RESPONDEMOS_AYUDA') }}
            </p>
          </div>
        </SectionLayout>

        <SectionLayout
          :title="t('PORTELIA.CONFIGURACION.GASTO.TITULO')"
          :description="t('PORTELIA.CONFIGURACION.GASTO.DESCRIPCION')"
          with-border
        >
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              v-model="campos.techoUsdPorConversacion"
              type="number"
              inputmode="decimal"
              min="0"
              step="0.01"
              :label="t('PORTELIA.CONFIGURACION.GASTO.POR_CONVERSACION')"
              :message="consumoConversacion"
            />
            <Input
              v-model="campos.techoUsdPorMes"
              type="number"
              inputmode="decimal"
              min="0"
              step="1"
              :label="t('PORTELIA.CONFIGURACION.GASTO.POR_MES')"
              :message="consumoMes"
            />
          </div>
        </SectionLayout>

        <p v-if="error" class="mb-4 text-sm text-n-ruby-11">{{ error }}</p>

        <div class="sticky bottom-0 py-3 bg-n-surface-1 border-t border-n-weak">
          <Button
            type="submit"
            :label="t('PORTELIA.CONFIGURACION.GUARDAR')"
            :is-loading="guardando"
          />
        </div>
      </form>
    </div>
  </section>
</template>
