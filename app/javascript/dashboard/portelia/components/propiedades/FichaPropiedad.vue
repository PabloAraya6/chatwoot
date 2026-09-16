<script setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useAlert } from 'dashboard/composables';
import { useAbortableRequest } from 'dashboard/composables/useAbortableRequest';
import { useAccount } from 'dashboard/composables/useAccount';
import Breadcrumb from 'dashboard/components-next/breadcrumb/Breadcrumb.vue';
import Banner from 'dashboard/components-next/banner/Banner.vue';
import Button from 'dashboard/components-next/button/Button.vue';
import Label from 'dashboard/components-next/label/Label.vue';
import Spinner from 'dashboard/components-next/spinner/Spinner.vue';
import miApi from '../../api/miApi';
import EnviarFichaDialog from './EnviarFichaDialog.vue';
import { COLOR_ESTADO, lugarDe, precioDe, tituloDe } from './propiedad';

const props = defineProps({
  propiedadId: { type: String, required: true },
});

const { t } = useI18n();

const route = useRoute();

const router = useRouter();

const { accountScopedRoute } = useAccount();

const propiedad = ref(null);

const { run, isPending: cargando } = useAbortableRequest();

const fallo = ref(false);

const enviarRef = ref(null);

const titulo = computed(() =>
  propiedad.value ? tituloDe(propiedad.value, t) : ''
);

const migas = computed(() => [
  { label: t('PORTELIA.PROPIEDADES.TITULO') },
  { label: titulo.value },
]);

const si = valor =>
  t(valor ? 'PORTELIA.PROPIEDADES.FICHA.SI' : 'PORTELIA.PROPIEDADES.FICHA.NO');

const m2 = valor => `${valor.toLocaleString('es-AR')} m²`;

// Una fila por dato conocido: lo que la Propiedad no sabe no ocupa lugar en la ficha.
const datos = computed(() => {
  const p = propiedad.value;

  if (!p) return [];

  return [
    ['PRECIO', precioDe(p, t)],
    [
      'EXPENSAS',
      p.expensas !== undefined ? p.expensas.toLocaleString('es-AR') : null,
    ],
    ['TIPO', t(`PORTELIA.PROPIEDADES.TIPO.${p.tipo}`)],
    ['OPERACION', t(`PORTELIA.PROPIEDADES.OPERACION.${p.operacion}`)],
    [
      'SUPERFICIE_CUBIERTA',
      p.superficieCubiertaM2 ? m2(p.superficieCubiertaM2) : null,
    ],
    ['SUPERFICIE_TOTAL', p.superficieTotalM2 ? m2(p.superficieTotalM2) : null],
    ['AMBIENTES', p.ambientes ?? null],
    ['DORMITORIOS', p.dormitorios ?? null],
    ['BANOS', p.banos ?? null],
    ['COCHERA', p.cochera === undefined ? null : si(p.cochera)],
    ['CONDICION', p.condicion ?? null],
    ['CIUDAD', p.ciudad ?? null],
    ['CODIGO', p.idExterno ?? null],
  ].filter(([, valor]) => valor !== null && valor !== '');
});

const cargar = async () => {
  propiedad.value = null;
  fallo.value = false;

  try {
    const respuesta = await run(signal =>
      miApi.get(`propiedades/${props.propiedadId}`, { signal })
    );
    if (respuesta) propiedad.value = respuesta.data;
  } catch (error) {
    if (error.response?.status === 404) {
      useAlert(t('PORTELIA.PROPIEDADES.FICHA.NO_EXISTE'));
      router.replace(accountScopedRoute('portelia_propiedades'));
    } else {
      fallo.value = true;
    }
  }
};

const volver = () => router.push(accountScopedRoute('portelia_propiedades'));

const editar = () =>
  router.push(
    accountScopedRoute('portelia_propiedad_editar', {
      propiedadId: props.propiedadId,
    })
  );

watch(() => props.propiedadId, cargar, { immediate: true });
</script>

<template>
  <section
    class="flex w-full min-w-0 h-full overflow-hidden bg-n-surface-1 [&_button:not([role=switch])]:min-h-11 [&_button:not([role=switch])]:min-w-11 [&_input:not([type=checkbox])]:min-h-11 [&_select]:min-h-11 max-sm:[&_input]:text-base max-sm:[&_select]:text-base motion-reduce:[&_*]:!transition-none"
  >
    <div class="flex flex-col w-full min-w-0 h-full">
      <header class="sticky top-0 z-10 px-4 sm:px-6">
        <div
          class="flex flex-col w-full gap-3 py-4 sm:py-6 mx-auto max-w-[40.625rem] sm:flex-row sm:items-center sm:justify-between"
        >
          <Breadcrumb :items="migas" @click="volver" />
          <div v-if="propiedad" class="flex items-center gap-2">
            <Button
              :label="t('PORTELIA.PROPIEDADES.FICHA.EDITAR')"
              icon="i-lucide-pen-line"
              color="slate"
              variant="faded"
              size="sm"
              @click="editar"
            />
            <Button
              :label="t('PORTELIA.PROPIEDADES.FICHA.ENVIAR')"
              icon="i-lucide-send"
              size="sm"
              @click="enviarRef.abrir(route.query.conversacion)"
            />
          </div>
        </div>
      </header>
      <main class="flex-1 min-h-0 px-4 sm:px-6 pb-6 overflow-y-auto">
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
        <article
          v-else-if="propiedad"
          class="flex flex-col w-full gap-6 mx-auto max-w-[40.625rem]"
        >
          <div
            v-if="propiedad.fotos.length"
            class="flex gap-2 -mx-4 px-4 sm:mx-0 overflow-x-auto snap-x snap-mandatory sm:mx-0 sm:px-0"
          >
            <img
              v-for="foto in propiedad.fotos"
              :key="foto"
              :src="foto"
              :alt="titulo"
              loading="lazy"
              class="object-cover h-56 rounded-xl snap-start shrink-0 w-[85%] sm:w-auto sm:max-w-full bg-n-slate-3"
            />
          </div>
          <div class="flex flex-col gap-2">
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
            <h1 class="mb-0 text-2xl font-medium break-words text-n-slate-12">
              {{ titulo }}
            </h1>
            <p v-if="lugarDe(propiedad)" class="mb-0 text-sm text-n-slate-11">
              {{ lugarDe(propiedad) }}
            </p>
            <p class="mb-0 text-xl font-medium text-n-slate-12">
              {{ precioDe(propiedad, t) }}
            </p>
          </div>
          <div
            v-if="propiedad.urlRecorrido || propiedad.urlAviso"
            class="flex flex-wrap gap-2"
          >
            <a
              v-if="propiedad.urlRecorrido"
              :href="propiedad.urlRecorrido"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                :label="t('PORTELIA.PROPIEDADES.FICHA.RECORRIDO')"
                icon="i-lucide-rotate-3d"
                color="slate"
                variant="faded"
                size="sm"
              />
            </a>
            <a
              v-if="propiedad.urlAviso"
              :href="propiedad.urlAviso"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                :label="t('PORTELIA.PROPIEDADES.FICHA.AVISO')"
                icon="i-lucide-external-link"
                color="slate"
                variant="link"
                size="sm"
              />
            </a>
          </div>
          <dl
            class="grid grid-cols-1 gap-x-6 gap-y-3 p-4 mb-0 rounded-xl outline outline-1 -outline-offset-1 outline-n-container bg-n-solid-2 sm:grid-cols-2"
          >
            <div
              v-for="[clave, valor] in datos"
              :key="clave"
              class="flex flex-col gap-0.5"
            >
              <dt
                class="text-xs font-medium uppercase tracking-wide text-n-slate-11"
              >
                {{ t(`PORTELIA.PROPIEDADES.FICHA.${clave}`) }}
              </dt>
              <dd class="mb-0 text-sm text-n-slate-12 break-words">
                {{ valor }}
              </dd>
            </div>
          </dl>
          <section v-if="propiedad.descripcion" class="flex flex-col gap-2">
            <h2 class="mb-0 text-base font-medium text-n-slate-12">
              {{ t('PORTELIA.PROPIEDADES.FICHA.DESCRIPCION') }}
            </h2>
            <p
              class="mb-0 text-sm whitespace-pre-line break-words text-n-slate-11"
            >
              {{ propiedad.descripcion }}
            </p>
          </section>
          <section
            v-if="propiedad.amenities.length"
            class="flex flex-col gap-2"
          >
            <h2 class="mb-0 text-base font-medium text-n-slate-12">
              {{ t('PORTELIA.PROPIEDADES.FICHA.AMENITIES') }}
            </h2>
            <div class="flex flex-wrap gap-1.5">
              <Label
                v-for="amenity in propiedad.amenities"
                :key="amenity"
                :label="amenity"
                compact
              />
            </div>
          </section>
        </article>
      </main>
    </div>
    <EnviarFichaDialog ref="enviarRef" :propiedad-id="propiedadId" />
  </section>
</template>
