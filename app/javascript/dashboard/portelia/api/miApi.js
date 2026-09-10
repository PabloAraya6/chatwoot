/* global axios */
import store from 'dashboard/store';

// `/mi/api` es la API propia (apps/api del monorepo), servida en el mismo origen por Caddy.
// Se autentica con el token de agente de Chatwoot, no con las cabeceras de devise. Va en
// `api-access-token` con guiones porque Caddy descarta las cabeceras con guion bajo al proxear.
const url = ruta => `/mi/api/${ruta}`;
const opciones = () => ({
  headers: { 'api-access-token': store.getters.getCurrentUser.access_token },
});

export default {
  get: ruta => axios.get(url(ruta), opciones()),
  post: (ruta, datos) => axios.post(url(ruta), datos, opciones()),
  put: (ruta, datos) => axios.put(url(ruta), datos, opciones()),
  patch: (ruta, datos) => axios.patch(url(ruta), datos, opciones()),
  delete: ruta => axios.delete(url(ruta), opciones()),
};
