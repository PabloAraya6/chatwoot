<script setup>
import { computed, nextTick, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { useAlert } from 'dashboard/composables';
import Button from 'dashboard/components-next/button/Button.vue';
import DialogoAsesor from '../DialogoAsesor.vue';
import Banner from 'dashboard/components-next/banner/Banner.vue';
import Spinner from 'dashboard/components-next/spinner/Spinner.vue';
import EmptyStateLayout from 'dashboard/components-next/EmptyStateLayout.vue';
import miApi from '../../api/miApi';
import NuevaReaccion from '../ficha/NuevaReaccion.vue';
import NuevaOperacion from '../ficha/NuevaOperacion.vue';
import TarjetaVisita from './TarjetaVisita.vue';
import NuevaVisita from './NuevaVisita.vue';
import CancelarVisita from './CancelarVisita.vue';
import Disponibilidad from './Disponibilidad.vue';
import {
  claveDia,
  diasDesdeHoy,
  etiquetaDia,
  hoy,
  inicioDelDia,
} from './visita';

// La Agenda del asesor (ticket 07): Hoy y la semana con sus Visitas, los taps que las mueven
// de estado, agendar una nueva y editar las franjas. Lee /mi/api; el nombre de la Persona
// sale del store de contactos de Chatwoot, que ya sabe buscarlo.
const { t } = useI18n();

const store = useStore();

const DIAS = 7;

const DIA_MS = 86_400_000;

const visitas = ref([]);

const propiedades = ref([]);

const cargando = ref(true);

const fallo = ref(false);

const ocupadaId = ref('');

const seleccionada = ref(null);

const nuevaVisitaRef = ref(null);

const cancelarRef = ref(null);

const disponibilidadRef = ref(null);

const nuevaReaccionRef = ref(null);

const cierreRef = ref(null);

const nuevaOperacionRef = ref(null);

const nombreDe = contactId =>
  store.getters['contacts/getContact'](contactId)?.name ?? '';

const traerNombres = () => {
  const ids = new Set(visitas.value.map(visita => visita.contactId));
  ids.forEach(id => {
    if (!nombreDe(id)) store.dispatch('contacts/show', { id });
  });
};

const cargar = async () => {
  cargando.value = true;
  fallo.value = false;

  try {
    const desde = inicioDelDia(hoy());
    const hasta = new Date(desde.getTime() + DIAS * DIA_MS);

    const [agenda, lista] = await Promise.all([
      miApi.get(
        `agenda?desde=${desde.toISOString()}&hasta=${hasta.toISOString()}`
      ),
      miApi.get('propiedades'),
    ]);

    visitas.value = agenda.data;
    propiedades.value = lista.data;
    traerNombres();
  } catch {
    fallo.value = true;
  } finally {
    cargando.value = false;
  }
};

const dias = computed(() =>
  diasDesdeHoy(DIAS).map(clave => ({
    clave,
    etiqueta: etiquetaDia(clave),
    visitas: visitas.value.filter(visita => claveDia(visita.at) === clave),
  }))
);

const hoyDia = computed(() => dias.value[0]);

const semana = computed(() =>
  dias.value.slice(1).filter(dia => dia.visitas.length)
);

const reemplazar = visita => {
  visitas.value = visitas.value.map(otra =>
    otra.id === visita.id ? { ...otra, ...visita } : otra
  );
};

const patch = async (visita, cuerpo) => {
  if (ocupadaId.value) return null;
  ocupadaId.value = visita.id;

  try {
    const { data } = await miApi.patch(`visitas/${visita.id}`, cuerpo);
    reemplazar(data);

    return data;
  } catch (error) {
    useAlert(
      error?.response?.data?.error || t('PORTELIA.AGENDA.ERROR_GUARDAR')
    );

    return null;
  } finally {
    ocupadaId.value = '';
  }
};

// Cancelar pide motivo antes; realizada abre la Reacción después (ticket 07, punto 3).
const mover = async (visita, estado) => {
  if (ocupadaId.value) return;

  if (estado === 'cancelada') {
    seleccionada.value = visita;
    cancelarRef.value?.abrir();

    return;
  }

  const movida = await patch(visita, { estado });

  if (movida && estado === 'realizada') {
    seleccionada.value = visita;
    await nextTick();
    nuevaReaccionRef.value?.abrir(visita.propiedadId);
  }
};

const cancelar = async motivoCancelacion => {
  const movida = await patch(seleccionada.value, {
    estado: 'cancelada',
    motivoCancelacion,
  });

  if (movida) cancelarRef.value?.cerrar();
};

const alCrearReaccion = () => {
  useAlert(t('PORTELIA.FICHA.GUARDADO'));
  cierreRef.value?.open();
};

const abrirOperacion = () => {
  cierreRef.value?.close();
  nuevaOperacionRef.value?.abrir(seleccionada.value.propiedadId);
};

const alCrearOperacion = () => {
  useAlert(t('PORTELIA.FICHA.GUARDADO'));
  cargar();
};

const alCrearVisita = visita => {
  useAlert(t('PORTELIA.AGENDA.NUEVA.CREADA'));
  const propiedad = propiedades.value.find(p => p.id === visita.propiedadId);
  visitas.value = [...visitas.value, { ...visita, propiedad }].sort((a, b) =>
    a.at.localeCompare(b.at)
  );
  traerNombres();
};

onMounted(cargar);
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
            {{ t('PORTELIA.AGENDA.TITULO') }}
          </span>
          <div class="flex flex-wrap items-center gap-2">
            <Button
              :label="t('PORTELIA.AGENDA.FRANJAS.BOTON')"
              icon="i-lucide-clock"
              color="slate"
              variant="faded"
              size="sm"
              @click="disponibilidadRef.abrir()"
            />
            <Button
              :label="t('PORTELIA.AGENDA.NUEVA.BOTON')"
              icon="i-lucide-plus"
              size="sm"
              @click="nuevaVisitaRef.abrir()"
            />
          </div>
        </div>
      </header>
      <main class="flex-1 min-h-0 px-4 sm:px-6 pb-6 overflow-y-auto">
        <div class="flex flex-col w-full gap-8 mx-auto max-w-5xl">
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
            {{ t('PORTELIA.AGENDA.ERROR_CARGA') }}
          </Banner>
          <template v-else>
            <section class="flex flex-col gap-3">
              <h2 class="mb-0 text-base font-medium text-n-slate-12">
                {{ t('PORTELIA.AGENDA.HOY') }}
                <span class="font-normal text-n-slate-11">
                  · {{ hoyDia.etiqueta }}
                </span>
              </h2>
              <EmptyStateLayout
                v-if="!hoyDia.visitas.length"
                :title="t('PORTELIA.AGENDA.HOY_VACIO_TITULO')"
                :subtitle="t('PORTELIA.AGENDA.HOY_VACIO_DETALLE')"
                :show-backdrop="false"
              />
              <TarjetaVisita
                v-for="visita in hoyDia.visitas"
                :key="visita.id"
                :visita="visita"
                :nombre-persona="nombreDe(visita.contactId)"
                :ocupada="Boolean(ocupadaId)"
                @mover="estado => mover(visita, estado)"
              />
            </section>

            <section class="flex flex-col gap-3">
              <h2 class="mb-0 text-base font-medium text-n-slate-12">
                {{ t('PORTELIA.AGENDA.SEMANA') }}
              </h2>
              <p v-if="!semana.length" class="mb-0 text-sm text-n-slate-11">
                {{ t('PORTELIA.AGENDA.SEMANA_VACIA') }}
              </p>
              <div
                v-for="dia in semana"
                :key="dia.clave"
                class="flex flex-col gap-2"
              >
                <h3
                  class="mb-0 text-sm font-medium text-n-slate-11 first-letter:uppercase"
                >
                  {{ dia.etiqueta }}
                </h3>
                <TarjetaVisita
                  v-for="visita in dia.visitas"
                  :key="visita.id"
                  :visita="visita"
                  :nombre-persona="nombreDe(visita.contactId)"
                  :ocupada="Boolean(ocupadaId)"
                  @mover="estado => mover(visita, estado)"
                />
              </div>
            </section>
          </template>
        </div>
      </main>
    </div>

    <NuevaVisita ref="nuevaVisitaRef" @creada="alCrearVisita" />
    <CancelarVisita
      ref="cancelarRef"
      :guardando="Boolean(ocupadaId)"
      @cancelar="cancelar"
    />
    <Disponibilidad ref="disponibilidadRef" />
    <template v-if="seleccionada">
      <NuevaReaccion
        ref="nuevaReaccionRef"
        :contact-id="seleccionada.contactId"
        :propiedades="propiedades"
        :visitas="visitas"
        @creada="alCrearReaccion"
      />
      <DialogoAsesor
        ref="cierreRef"
        :title="t('PORTELIA.AGENDA.CIERRE.TITULO')"
        :description="t('PORTELIA.AGENDA.CIERRE.DESCRIPCION')"
        :confirm-button-label="t('PORTELIA.AGENDA.CIERRE.CONFIRMAR')"
        :cancel-button-label="t('PORTELIA.AGENDA.CIERRE.NO')"
        @confirm="abrirOperacion"
      />
      <NuevaOperacion
        ref="nuevaOperacionRef"
        :contact-id="seleccionada.contactId"
        :propiedades="propiedades"
        @creada="alCrearOperacion"
      />
    </template>
  </section>
</template>
