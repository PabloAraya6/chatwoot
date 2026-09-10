import { frontendURL } from 'dashboard/helper/URLHelper';
import { FEATURE_FLAGS } from 'dashboard/featureFlags';
import { ROLES } from 'dashboard/constants/permissions';
import PantallaPendiente from '../components/PantallaPendiente.vue';

const meta = { permissions: ROLES, featureFlag: FEATURE_FLAGS.PORTELIA_UI };

const pendiente = (camino, titulo) => ({
  path: frontendURL(`accounts/:accountId/${camino}`),
  name: `portelia_${camino}`,
  component: PantallaPendiente,
  meta,
  props: { titulo },
});

export const routes = [
  pendiente('propiedades', 'PORTELIA.SIDEBAR.PROPIEDADES'),
  pendiente('agenda', 'PORTELIA.SIDEBAR.AGENDA'),
  pendiente('configuracion', 'PORTELIA.SIDEBAR.CONFIGURACION'),
];
