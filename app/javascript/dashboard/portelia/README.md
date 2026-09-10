# portelia/

Todo lo nuestro del dashboard vive acá, detrás del flag de cuenta `portelia_ui`. Con el flag
apagado el dashboard es Chatwoot stock. Los puntos de enchufe con upstream están listados en
`PORTELIA.md` en la raíz del fork.

- `routes/`: rutas propias (`portelia_*`), montadas como hijas de `AppContainer` desde
  `dashboard.routes.js`. Propiedades es real (lista, ficha, nueva, editar); Agenda y
  Configuración son placeholders (`PantallaPendiente`); Bandeja y Personas apuntan a las rutas
  stock `home` y `contacts_dashboard_index`. `rutasSinCuenta` tiene `/app/compartir`, adonde
  apunta el `share_target` del manifest.
- `components/`: componentes nuestros, compuestos con los primitivos y las clases de upstream
  (`components-next`, tokens `n-*`), sin CSS propio: cuando cambie el look de Chatwoot cambia
  el de todo esto. `SidebarAsesor.vue` es el menú de cinco entradas que `Sidebar.vue` renderiza
  en vez de `menuItems` cuando el flag está prendido; usa el `SidebarGroup` de upstream, así
  que hereda colapsado, popovers y atajos. `BarraInferiorAsesor.vue` son las mismas entradas
  como barra inferior en el celular (`Dashboard.vue` la monta en vez del drawer). `TraspasoHilo.vue`
  va arriba del hilo: de quién es la conversación, "Tomar" si está en Guardia, y la nota de
  traspaso de la secretaria (`content_attributes.traspaso` de su nota privada). `propiedades/` es
  la pantalla de Propiedades sobre `/mi/api/propiedades` (Button, Input, Select, Dialog, Label,
  CardLayout, Breadcrumb de `components-next`); los enums de la Propiedad viven copiados en
  `propiedades/propiedad.js` porque el fork no importa del monorepo. `AvisoPush.vue`
  es el `Banner` de upstream debajo del encabezado de la lista que pide el permiso de push con
  un gesto y guarda la suscripción; desaparece cuando este browser ya está suscripto o el asesor
  lo negó. El service worker que muestra el push es `public/sw.js`.
- `composables/`: `usePorteliaUi` (el flag), `useEntradasAsesor` (la lista de entradas que
  comparten el sidebar y la barra), `useBarraInferior` (cuándo se ve la barra).
- `bandeja.js`: `pestanasAsesor`, las pestañas Mías y Guardia que `ChatList.vue` usa con el flag.
- `api/miApi.js`: cliente de `/mi/api` (la API propia, `apps/api` del monorepo, mismo origen
  por Caddy). Reúsa el `axios` global del dashboard y manda el token de agente en
  `Authorization: Bearer` (Caddy descarta las cabeceras con guion bajo, así que no puede ir en
  `api_access_token` como en la API de Chatwoot). `miApi.get('personas/123')`.
- `i18n/es/portelia.json`: nuestras claves, todas bajo `PORTELIA.*`. Sólo `es`: es el idioma
  del asesor. Se mezclan en `i18n/locale/es/index.js`.

Regla de nombres: ningún componente nuestro se llama como uno de upstream (`SidebarAsesor`, no
`Sidebar`), las rutas van con prefijo `portelia_`, las claves i18n bajo `PORTELIA`, y los
nombres del dominio en el castellano de `CONTEXT.md` del monorepo.
