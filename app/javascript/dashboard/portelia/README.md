# portelia/

Todo lo nuestro del dashboard vive acá, detrás del flag de cuenta `portelia_ui`. Con el flag
apagado el dashboard es Chatwoot stock. Los puntos de enchufe con upstream están listados en
`PORTELIA.md` en la raíz del fork.

- `routes/`: rutas propias (`portelia_*`), montadas como hijas de `AppContainer` desde
  `dashboard.routes.js`. Propiedades es real (lista, ficha, nueva, editar); Agenda y
  Configuración son placeholders (`PantallaPendiente`); Bandeja y Personas apuntan a las rutas
  stock `home` y `contacts_dashboard_index`. `rutasSinCuenta` tiene `/app/compartir`, adonde
  apunta el `share_target` del manifest.
- `components/`: componentes nuestros. `SidebarAsesor.vue` es el menú de cinco entradas que
  `Sidebar.vue` renderiza en vez de `menuItems` cuando el flag está prendido; usa el
  `SidebarGroup` de upstream, así que hereda colapsado, popovers y atajos. `propiedades/` es la
  pantalla de Propiedades sobre `/mi/api/propiedades`, armada con los primitivos de
  `components-next` (Button, Input, Select, Dialog, Label, CardLayout, Breadcrumb) y las clases
  de Chatwoot, sin CSS propio: si upstream cambia el look, cambia el nuestro. Los enums de la
  Propiedad viven copiados en `propiedades/propiedad.js` porque el fork no importa del monorepo.
- `api/miApi.js`: cliente de `/mi/api` (la API propia, `apps/api` del monorepo, mismo origen
  por Caddy). Reúsa el `axios` global del dashboard y manda el token de agente en
  `Authorization: Bearer` (Caddy descarta las cabeceras con guion bajo, así que no puede ir en
  `api_access_token` como en la API de Chatwoot). `miApi.get('personas/123')`.
- `i18n/es/portelia.json`: nuestras claves, todas bajo `PORTELIA.*`. Sólo `es`: es el idioma
  del asesor. Se mezclan en `i18n/locale/es/index.js`.

Regla de nombres: ningún componente nuestro se llama como uno de upstream (`SidebarAsesor`, no
`Sidebar`), las rutas van con prefijo `portelia_`, las claves i18n bajo `PORTELIA`, y los
nombres del dominio en el castellano de `CONTEXT.md` del monorepo.
