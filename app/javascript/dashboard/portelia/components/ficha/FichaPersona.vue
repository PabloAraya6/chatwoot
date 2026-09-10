<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAlert } from 'dashboard/composables';
import Spinner from 'dashboard/components-next/spinner/Spinner.vue';
import Button from 'dashboard/components-next/button/Button.vue';
import Label from 'dashboard/components-next/label/Label.vue';
import miApi from '../../api/miApi';
import { CAMPOS_BUSQUEDA } from './camposBusqueda';
import { fechaCorta, nombrePropiedad, precio } from './formato';
import CampoBusqueda from './CampoBusqueda.vue';
import NuevaReaccion from './NuevaReaccion.vue';
import NuevaOperacion from './NuevaOperacion.vue';

// La ficha de la Persona (ticket 05): la Búsqueda editable con su procedencia por campo, las
// Visitas, las Reacciones y la Operación. Se monta en el panel del contacto del hilo y en la
// página de la Persona; lee y escribe /mi/api y nunca toca el store de Chatwoot.

const props = defineProps({
  contactId: { type: Number, required: true },
});

const { t } = useI18n();

const cargando = ref(true);
const fallo = ref(false);
const busquedas = ref([]);
const visitas = ref([]);
const reacciones = ref([]);
const operaciones = ref([]);
const propiedades = ref([]);
const nuevaReaccionRef = ref(null);
const nuevaOperacionRef = ref(null);

const ESTADO_VISITA_COLOR = {
  pendiente: 'amber',
  confirmada: 'blue',
  realizada: 'teal',
  cancelada: 'ruby',
  no_se_presento: 'ruby',
};
const VEREDICTO_COLOR = {
  le_gusto: 'teal',
  no_le_gusto: 'ruby',
  lo_piensa: 'amber',
};
const ESTADO_OPERACION_COLOR = {
  reservada: 'amber',
  cerrada: 'teal',
  caida: 'ruby',
};

const porId = computed(() => new Map(propiedades.value.map(p => [p.id, p])));
const propiedadDe = id => nombrePropiedad(porId.value.get(id));

const vigentes = computed(() => busquedas.value.filter(b => b.vigente));

const cargar = async () => {
  cargando.value = true;
  fallo.value = false;
  try {
    const [persona, lista] = await Promise.all([
      miApi.get(`personas/${props.contactId}`),
      miApi.get('propiedades'),
    ]);
    busquedas.value = persona.data.busquedas;
    visitas.value = persona.data.visitas;
    reacciones.value = persona.data.reacciones;
    operaciones.value = persona.data.operaciones;
    propiedades.value = lista.data;
  } catch {
    fallo.value = true;
  } finally {
    cargando.value = false;
  }
};

const editarCampo = async (busqueda, campo, valor) => {
  try {
    const { data } = await miApi.patch(`busquedas/${busqueda.id}`, {
      [campo]: valor,
    });
    busquedas.value = busquedas.value.map(b => (b.id === data.id ? data : b));
    useAlert(t('PORTELIA.FICHA.GUARDADO'));
  } catch (error) {
    useAlert(error?.response?.data?.error || t('PORTELIA.FICHA.ERROR_GUARDAR'));
  }
};

const alCrearReaccion = reaccion => {
  reacciones.value = [
    reaccion,
    ...reacciones.value.filter(r => r.id !== reaccion.id),
  ];
  useAlert(t('PORTELIA.FICHA.GUARDADO'));
};

// La Operación cierra la Búsqueda vigente y cambia la Propiedad: se relee todo.
const alCrearOperacion = () => {
  useAlert(t('PORTELIA.FICHA.GUARDADO'));
  cargar();
};

onMounted(cargar);
watch(() => props.contactId, cargar);
</script>

<template>
  <div class="flex flex-col gap-5 px-1 py-2 text-sm">
    <div v-if="cargando" class="flex justify-center py-6 text-n-slate-11">
      <Spinner />
    </div>
    <p v-else-if="fallo" class="text-n-slate-11">
      {{ t('PORTELIA.FICHA.ERROR_CARGAR') }}
    </p>
    <template v-else>
      <section class="flex flex-col gap-2">
        <h4 class="text-sm font-medium text-n-slate-12">
          {{ t('PORTELIA.FICHA.BUSQUEDA.TITULO') }}
        </h4>
        <p v-if="vigentes.length === 0" class="text-n-slate-11">
          {{ t('PORTELIA.FICHA.BUSQUEDA.VACIA') }}
        </p>
        <div
          v-for="busqueda in vigentes"
          :key="busqueda.id"
          class="flex flex-col gap-1"
        >
          <CampoBusqueda
            v-for="definicion in CAMPOS_BUSQUEDA"
            :key="definicion.campo"
            :busqueda="busqueda"
            :definicion="definicion"
            @update="valor => editarCampo(busqueda, definicion.campo, valor)"
          />
        </div>
      </section>

      <section class="flex flex-col gap-2">
        <h4 class="text-sm font-medium text-n-slate-12">
          {{ t('PORTELIA.FICHA.VISITAS.TITULO') }}
        </h4>
        <p v-if="visitas.length === 0" class="text-n-slate-11">
          {{ t('PORTELIA.FICHA.VISITAS.VACIAS') }}
        </p>
        <div
          v-for="visita in visitas"
          :key="visita.id"
          class="flex items-start justify-between gap-2 min-h-10"
        >
          <div class="flex flex-col min-w-0">
            <span class="truncate text-n-slate-12">
              {{ nombrePropiedad(visita.propiedad) }}
            </span>
            <span class="text-n-slate-11">{{ fechaCorta(visita.at) }}</span>
          </div>
          <Label
            :label="t(`PORTELIA.FICHA.VISITAS.ESTADO.${visita.estado}`)"
            :color="ESTADO_VISITA_COLOR[visita.estado]"
            compact
          />
        </div>
      </section>

      <section class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-medium text-n-slate-12">
            {{ t('PORTELIA.FICHA.REACCIONES.TITULO') }}
          </h4>
          <Button
            variant="faded"
            color="slate"
            size="xs"
            icon="i-lucide-plus"
            :label="t('PORTELIA.FICHA.AGREGAR')"
            @click="nuevaReaccionRef?.abrir()"
          />
        </div>
        <p v-if="reacciones.length === 0" class="text-n-slate-11">
          {{ t('PORTELIA.FICHA.REACCIONES.VACIAS') }}
        </p>
        <div
          v-for="reaccion in reacciones"
          :key="reaccion.id"
          class="flex items-start justify-between gap-2 min-h-10"
        >
          <div class="flex flex-col min-w-0">
            <span class="truncate text-n-slate-12">
              {{ propiedadDe(reaccion.propiedadId) }}
            </span>
            <span v-if="reaccion.motivo" class="text-n-slate-11">
              {{ reaccion.motivo }}
            </span>
          </div>
          <Label
            :label="t(`PORTELIA.FICHA.VEREDICTO.${reaccion.veredicto}`)"
            :color="VEREDICTO_COLOR[reaccion.veredicto]"
            compact
          />
        </div>
      </section>

      <section class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-medium text-n-slate-12">
            {{ t('PORTELIA.FICHA.OPERACIONES.TITULO') }}
          </h4>
          <Button
            variant="faded"
            color="slate"
            size="xs"
            icon="i-lucide-plus"
            :label="t('PORTELIA.FICHA.OPERACIONES.CREAR')"
            @click="nuevaOperacionRef?.abrir()"
          />
        </div>
        <p v-if="operaciones.length === 0" class="text-n-slate-11">
          {{ t('PORTELIA.FICHA.OPERACIONES.VACIAS') }}
        </p>
        <div
          v-for="operacion in operaciones"
          :key="operacion.id"
          class="flex items-start justify-between gap-2 min-h-10"
        >
          <div class="flex flex-col min-w-0">
            <span class="truncate text-n-slate-12">
              {{ propiedadDe(operacion.propiedadId) }}
            </span>
            <span class="text-n-slate-11">
              {{ operacion.tipo }}
              <template v-if="operacion.precio">
                · {{ precio(operacion.precio, operacion.moneda) }}
              </template>
            </span>
          </div>
          <Label
            :label="t(`PORTELIA.FICHA.OPERACIONES.ESTADO.${operacion.estado}`)"
            :color="ESTADO_OPERACION_COLOR[operacion.estado]"
            compact
          />
        </div>
      </section>

      <NuevaReaccion
        ref="nuevaReaccionRef"
        :contact-id="contactId"
        :propiedades="propiedades"
        :visitas="visitas"
        @creada="alCrearReaccion"
      />
      <NuevaOperacion
        ref="nuevaOperacionRef"
        :contact-id="contactId"
        :propiedades="propiedades"
        @creada="alCrearOperacion"
      />
    </template>
  </div>
</template>
