# portelia/

Todo lo nuestro del dashboard vive acá, detrás del flag de cuenta `portelia_ui`. Con el flag
apagado el dashboard es Chatwoot stock. Los puntos de enchufe con upstream están listados en
`PORTELIA.md` en la raíz del fork.

- `routes/`: rutas propias (`portelia_*`), montadas como hijas de `AppContainer` desde
  `dashboard.routes.js`. Hoy son placeholders (`PantallaPendiente`) para Propiedades, Agenda y
  Configuración; Bandeja y Personas apuntan a las rutas stock `home` y `contacts_dashboard_index`.
- `components/`: componentes nuestros. `SidebarAsesor.vue` es el menú de cinco entradas que
  `Sidebar.vue` renderiza en vez de `menuItems` cuando el flag está prendido; usa el
  `SidebarGroup` de upstream, así que hereda colapsado, popovers y atajos.
- `api/miApi.js`: cliente de `/mi/api` (la API propia, `apps/api` del monorepo, mismo origen
  por Caddy). Reúsa el `axios` global del dashboard y manda el token de agente en
  `api_access_token`, como la API de Chatwoot. `miApi.get('personas/123')`.
- `i18n/es/portelia.json`: nuestras claves, todas bajo `PORTELIA.*`. Sólo `es`: es el idioma
  del asesor. Se mezclan en `i18n/locale/es/index.js`.

Regla de nombres: ningún componente nuestro se llama como uno de upstream (`SidebarAsesor`, no
`Sidebar`), las rutas van con prefijo `portelia_`, las claves i18n bajo `PORTELIA`, y los
nombres del dominio en el castellano de `CONTEXT.md` del monorepo.
