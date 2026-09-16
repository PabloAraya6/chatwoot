# portelia/

Todo lo nuestro del dashboard vive acá, detrás del flag de cuenta `portelia_ui`. Con el flag
apagado el dashboard es Chatwoot stock. Los puntos de enchufe con upstream están listados en
`PORTELIA.md` en la raíz del fork.

- `routes/`: rutas propias (`portelia_*`), montadas como hijas de `AppContainer` desde
  `dashboard.routes.js`. Propiedades (lista, ficha, nueva, editar), Agenda y Configuración (sólo
  `administrator`, como los settings de upstream) son reales; Bandeja y Personas apuntan a las
  rutas stock `home` y `contacts_dashboard_index`. `rutasSinCuenta` tiene `/app/compartir`, adonde
  apunta el `share_target` del manifest.
- `components/`: componentes nuestros, compuestos con los primitivos y las clases de upstream
  (`components-next`, tokens `n-*`), sin CSS propio: cuando cambie el look de Chatwoot cambia
  el de todo esto. `SidebarAsesor.vue` es el menú de cinco entradas que `Sidebar.vue` renderiza
  en vez de `menuItems` cuando el flag está prendido; usa el `SidebarGroup` de upstream, así
  que hereda colapsado, popovers y atajos. `BarraInferiorAsesor.vue` son las mismas entradas
  como barra inferior en el celular (`Dashboard.vue` la monta en vez del drawer). `TraspasoHilo.vue`
  va arriba del hilo: de quién es la conversación, "Tomar" si está en Guardia, la nota de
  traspaso de la secretaria (`content_attributes.traspaso` de su nota privada) y, si un humano
  ya habló, que la secretaria calla en esa conversación con el botón para devolvérsela
  (`/mi/api/conversaciones/:id/secretaria`). `propiedades/` es
  la pantalla de Propiedades sobre `/mi/api/propiedades` (Button, Input, Select, Dialog, Label,
  CardLayout, Breadcrumb de `components-next`); los enums de la Propiedad viven copiados en
  `propiedades/propiedad.js` porque el fork no importa del monorepo. `agenda/` es la Agenda
  (ticket 07) sobre `/mi/api/agenda`, `/mi/api/visitas`, `/mi/api/agenda/huecos` y
  `/mi/api/disponibilidad`: Hoy y la semana como listas de `CardLayout`, los taps de estado
  que la tabla `agenda/visita.js` permite (copia de `transicionesVisita` del monorepo; la API
  la vuelve a aplicar y devuelve 409), `NuevaVisita` (Persona desde las conversaciones abiertas
  del asesor o la del hilo, Propiedad, día y un hueco libre que calcula la API), `CancelarVisita`
  con motivo, `Disponibilidad` (las franjas semanales, `PUT` de la lista entera) y, al marcar
  una realizada, `NuevaReaccion` y la pregunta por la Operación reusando los diálogos de
  `ficha/`. El nombre de la Persona sale del store de contactos de Chatwoot. `ficha/` es la
  ficha de la Persona en el panel del contacto (Búsqueda editable con procedencia, Visitas con
  el botón Agendar, Reacciones, Operación). `configuracion/` es la pantalla de la Cuenta sobre
  `/mi/api/cuenta` y `/mi/api/cuenta/gasto` (modo de la secretaria, horario, cómo te presenta,
  tono y techos de gasto con lo consumido), armada con `BaseSettingsHeader` y `SectionLayout`
  de los settings de upstream. `AvisoPush.vue`
  es el `Banner` de upstream debajo del encabezado de la lista que pide el permiso de push con
  un gesto y guarda la suscripción; desaparece cuando este browser ya está suscripto o el asesor
  lo negó. El service worker que muestra el push es `public/sw.js`.
- `components/DialogoAsesor.vue`: compone el Dialog nativo de upstream. En teléfono ocupa el
  viewport dinámico, mantiene acciones visibles y deja desplazar sólo el cuerpo. No recrea
  foco, Escape, backdrop ni botones. `clasesAsesor.js` agrupa las utilities opt-in del shell
  para controles táctiles y áreas seguras.
- `components/ficha/HistorialBusqueda.vue`: presenta `GET /mi/api/cambios` con antes/después y
  procedencia. `CampoBusqueda.vue` permite corregir sin perder el borrador ante un error.
  No interpreta la prosa del copiloto ni inventa un protocolo para aceptar/descartar sugerencias.
- `api/conversaciones.js`: recorre las páginas de conversaciones propias abiertas para enviar
  una ficha o agendar desde la lista completa.
- `composables/`: `usePorteliaUi` (el flag), `useEntradasAsesor` (la lista de entradas que
  comparten el sidebar y la barra; Configuración sólo para administradores), `useBarraInferior`
  (cuándo se ve la barra).
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
