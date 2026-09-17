<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useAccount } from 'dashboard/composables/useAccount';
import { useAbortableRequest } from 'dashboard/composables/useAbortableRequest';
import Banner from 'dashboard/components-next/banner/Banner.vue';
import Button from 'dashboard/components-next/button/Button.vue';
import Input from 'dashboard/components-next/input/Input.vue';
import Icon from 'dashboard/components-next/icon/Icon.vue';
import Select from 'dashboard/components-next/select/Select.vue';
import Spinner from 'dashboard/components-next/spinner/Spinner.vue';
import EmptyStateLayout from 'dashboard/components-next/EmptyStateLayout.vue';
import miApi from '../../api/miApi';
import TarjetaPropiedad from './TarjetaPropiedad.vue';
import ImportarAvisoDialog from './ImportarAvisoDialog.vue';
import { ESTADOS, OPERACIONES, opcionesDe, urlCompartida } from './propiedad';

const { t } = useI18n();

const route = useRoute();

const router = useRouter();

const { accountScopedRoute } = useAccount();

const { run, isPending: cargando } = useAbortableRequest();

const POR_PAGINA = 20;

const propiedades = ref([]);

const fallo = ref(false);

const busqueda = ref('');

const estado = ref('');

const operacion = ref('');

const paginacion = ref({
  pagina: 1,
  porPagina: POR_PAGINA,
  total: 0,
  paginas: 1,
});

const importarRef = ref(null);

const opcionesEstado = computed(() => [
  { value: '', label: t('PORTELIA.PROPIEDADES.TODOS_ESTADOS') },
  ...opcionesDe(ESTADOS, t, 'ESTADO'),
]);

const opcionesOperacion = computed(() => [
  { value: '', label: t('PORTELIA.PROPIEDADES.TODAS_OPERACIONES') },
  ...opcionesDe(OPERACIONES, t, 'OPERACION'),
]);

const cargar = async () => {
  fallo.value = false;

  try {
    const respuesta = await run(signal =>
      miApi.get('propiedades', {
        signal,
        params: {
          pagina: paginacion.value.pagina,
          porPagina: POR_PAGINA,
          consulta: busqueda.value.trim() || undefined,
          estado: estado.value || undefined,
          operacion: operacion.value || undefined,
        },
      })
    );

    if (respuesta) {
      propiedades.value = respuesta.data.items;
      paginacion.value = respuesta.data.paginacion;
    }
  } catch {
    fallo.value = true;
  }
};

const hayFiltros = computed(() =>
  Boolean(busqueda.value.trim() || estado.value || operacion.value)
);

const actualizarBusqueda = useDebounceFn(() => {
  paginacion.value.pagina = 1;
  cargar();
}, 300);

watch(busqueda, actualizarBusqueda);

watch([estado, operacion], () => {
  paginacion.value.pagina = 1;
  cargar();
});

const irAPagina = pagina => {
  paginacion.value.pagina = pagina;
  cargar();
};

const irANueva = () =>
  router.push(accountScopedRoute('portelia_propiedad_nueva'));

// Lo importado se corrige antes de darlo por bueno: la ficha se abre en edición.
const alImportar = propiedad =>
  router.push(
    accountScopedRoute('portelia_propiedad_editar', {
      propiedadId: propiedad.id,
    })
  );

onMounted(() => {
  cargar();
  const compartida = urlCompartida(route.query);

  if (compartida) importarRef.value.abrir(compartida);
});
</script>

<template>
  <section
    class="flex w-full min-w-0 h-full overflow-hidden bg-n-surface-1 [&_button:not([role=switch])]:min-h-11 [&_button:not([role=switch])]:min-w-11 [&_input:not([type=checkbox])]:min-h-11 [&_select]:min-h-11 max-sm:[&_input]:text-base max-sm:[&_select]:text-base motion-reduce:[&_*]:!transition-none"
  >
    <div class="flex flex-col w-full min-w-0 h-full">
      <header class="sticky top-0 z-20 px-4 sm:px-6">
        <div
          class="flex flex-col w-full gap-3 py-4 sm:py-6 mx-auto max-w-5xl sm:flex-row sm:items-center sm:justify-between"
        >
          <span class="text-xl font-medium truncate text-n-slate-12">
            {{ t('PORTELIA.PROPIEDADES.TITULO') }}
          </span>
          <div class="flex flex-wrap items-center gap-2">
            <Input
              v-model="busqueda"
              type="search"
              :aria-label="t('PORTELIA.PROPIEDADES.BUSCAR')"
              :placeholder="t('PORTELIA.PROPIEDADES.BUSCAR')"
              :custom-input-class="[
                'h-8 [&:not(.focus)]:!border-transparent bg-n-alpha-2 dark:bg-n-solid-1 ltr:!pl-8 !py-1 rtl:!pr-8',
              ]"
              class="w-full sm:w-56"
            >
              <template #prefix>
                <Icon
                  icon="i-lucide-search"
                  class="absolute -translate-y-1/2 text-n-slate-11 size-4 top-1/2 ltr:left-2 rtl:right-2"
                />
              </template>
            </Input>
            <div class="flex w-full gap-2 sm:w-auto">
              <Select
                v-model="estado"
                :options="opcionesEstado"
                :aria-label="t('PORTELIA.PROPIEDADES.TODOS_ESTADOS')"
                class="min-w-0 flex-1 sm:flex-none [&>select]:w-full"
              />
              <Select
                v-model="operacion"
                :options="opcionesOperacion"
                :aria-label="t('PORTELIA.PROPIEDADES.TODAS_OPERACIONES')"
                class="min-w-0 flex-1 sm:flex-none [&>select]:w-full"
              />
            </div>
            <div class="hidden w-px h-4 sm:block bg-n-strong" />
            <Button
              :label="t('PORTELIA.PROPIEDADES.IMPORTAR.BOTON')"
              icon="i-lucide-link"
              color="slate"
              variant="faded"
              size="sm"
              @click="importarRef.abrir()"
            />
            <Button
              :label="t('PORTELIA.PROPIEDADES.NUEVA')"
              icon="i-lucide-plus"
              size="sm"
              @click="irANueva"
            />
          </div>
        </div>
      </header>
      <main class="flex-1 min-h-0 px-4 sm:px-6 pb-6 overflow-y-auto">
        <div class="w-full mx-auto max-w-5xl">
          <div v-if="cargando" class="flex justify-center py-20">
            <Spinner />
          </div>
          <Banner
            v-else-if="fallo"
            color="ruby"
            role="alert"
            :action-label="t('PORTELIA.REINTENTAR')"
            @action="cargar"
          >
            {{ t('PORTELIA.PROPIEDADES.ERROR_CARGA') }}
          </Banner>
          <EmptyStateLayout
            v-else-if="!propiedades.length && !hayFiltros"
            :title="t('PORTELIA.PROPIEDADES.VACIO_TITULO')"
            :subtitle="t('PORTELIA.PROPIEDADES.VACIO_DETALLE')"
            :show-backdrop="false"
          >
            <template #actions>
              <div class="flex flex-wrap justify-center gap-2">
                <Button
                  :label="t('PORTELIA.PROPIEDADES.IMPORTAR.BOTON')"
                  icon="i-lucide-link"
                  color="slate"
                  variant="faded"
                  @click="importarRef.abrir()"
                />
                <Button
                  :label="t('PORTELIA.PROPIEDADES.NUEVA')"
                  icon="i-lucide-plus"
                  @click="irANueva"
                />
              </div>
            </template>
          </EmptyStateLayout>
          <p
            v-else-if="!propiedades.length"
            class="py-20 text-sm text-center text-n-slate-11"
          >
            {{ t('PORTELIA.PROPIEDADES.SIN_RESULTADOS') }}
          </p>
          <div v-else class="flex flex-col gap-3">
            <p class="mb-0 text-sm text-n-slate-11">
              {{
                t('PORTELIA.PROPIEDADES.CONTEO', {
                  n: propiedades.length,
                  total: paginacion.total,
                })
              }}
            </p>
            <TarjetaPropiedad
              v-for="propiedad in propiedades"
              :key="propiedad.id"
              :propiedad="propiedad"
            />
            <footer
              v-if="paginacion.paginas > 1"
              class="flex items-center justify-between gap-3 pt-3"
            >
              <Button
                :label="t('PORTELIA.PROPIEDADES.PAGINACION.ANTERIOR')"
                icon="i-lucide-chevron-left"
                color="slate"
                variant="ghost"
                :disabled="paginacion.pagina <= 1 || cargando"
                @click="irAPagina(paginacion.pagina - 1)"
              />
              <span class="text-sm text-n-slate-11">
                {{
                  t('PORTELIA.PROPIEDADES.PAGINACION.PAGINA', {
                    pagina: paginacion.pagina,
                    paginas: paginacion.paginas,
                  })
                }}
              </span>
              <Button
                :label="t('PORTELIA.PROPIEDADES.PAGINACION.SIGUIENTE')"
                icon="i-lucide-chevron-right"
                trailing-icon
                color="slate"
                variant="ghost"
                :disabled="paginacion.pagina >= paginacion.paginas || cargando"
                @click="irAPagina(paginacion.pagina + 1)"
              />
            </footer>
          </div>
        </div>
      </main>
    </div>
    <ImportarAvisoDialog ref="importarRef" @importada="alImportar" />
  </section>
</template>
