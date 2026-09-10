import { frontendURL } from 'dashboard/helper/URLHelper';
import { FEATURE_FLAGS } from 'dashboard/featureFlags';
import { ROLES } from 'dashboard/constants/permissions';
import PantallaPendiente from '../components/PantallaPendiente.vue';

const meta = { permissions: ROLES, featureFlag: FEATURE_FLAGS.PORTELIA_UI };

const pendiente = pantalla => ({
  path: frontendURL(`accounts/:accountId/${pantalla}`),
  name: `portelia_${pantalla}`,
  component: PantallaPendiente,
  meta,
  props: { pantalla },
});

export const routes = ['propiedades', 'agenda', 'configuracion'].map(pendiente);
