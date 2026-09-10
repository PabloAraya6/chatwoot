import { frontendURL } from 'dashboard/helper/URLHelper';
import { FEATURE_FLAGS } from 'dashboard/featureFlags';
import { ROLES } from 'dashboard/constants/permissions';
import PantallaPendiente from '../components/PantallaPendiente.vue';
import ListaPropiedades from '../components/propiedades/ListaPropiedades.vue';
import FichaPropiedad from '../components/propiedades/FichaPropiedad.vue';
import FormularioPropiedad from '../components/propiedades/FormularioPropiedad.vue';
import CompartirAviso from '../components/propiedades/CompartirAviso.vue';
import Configuracion from '../components/configuracion/Configuracion.vue';

const meta = { permissions: ROLES, featureFlag: FEATURE_FLAGS.PORTELIA_UI };

const pendiente = pantalla => ({
  path: frontendURL(`accounts/:accountId/${pantalla}`),
  name: `portelia_${pantalla}`,
  component: PantallaPendiente,
  meta,
  props: { pantalla },
});

export const routes = [
  {
    path: frontendURL('accounts/:accountId/propiedades'),
    name: 'portelia_propiedades',
    component: ListaPropiedades,
    meta,
  },
  {
    path: frontendURL('accounts/:accountId/propiedades/nueva'),
    name: 'portelia_propiedad_nueva',
    component: FormularioPropiedad,
    meta,
  },
  {
    path: frontendURL('accounts/:accountId/propiedades/:propiedadId'),
    name: 'portelia_propiedad',
    component: FichaPropiedad,
    meta,
    props: true,
  },
  {
    path: frontendURL('accounts/:accountId/propiedades/:propiedadId/editar'),
    name: 'portelia_propiedad_editar',
    component: FormularioPropiedad,
    meta,
    props: true,
  },
  pendiente('agenda'),
  {
    // La configuración es de la Cuenta: sólo administradores, como los settings de upstream.
    path: frontendURL('accounts/:accountId/configuracion'),
    name: 'portelia_configuracion',
    component: Configuracion,
    meta: { ...meta, permissions: ['administrator'] },
  },
];

// Fuera de la cuenta: adonde apunta el `share_target` del manifest.
export const rutasSinCuenta = [
  {
    path: frontendURL('compartir'),
    name: 'portelia_compartir',
    component: CompartirAviso,
    meta: { permissions: ROLES },
  },
];
