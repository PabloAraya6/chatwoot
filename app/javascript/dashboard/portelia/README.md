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

## Puertas de calidad

Todas acotadas a esta carpeta; upstream no se gatea (ver `PORTELIA.md` > Rebase). Corren todas
con `pnpm run check`, colgado del hook `pre-push`.

- **Marcadores** (`scripts/sin-marcadores.sh`, `pnpm run portelia:marcadores`): un `git grep`
  que bloquea `TODO`/`FIXME` (van al tracker) y `ponytail:` (se resuelve o se declara en la
  respuesta del PR) dentro de esta carpeta. El patrón de borde de palabra se arma a mano
  (`(^|[^A-Za-z])(TODO|FIXME)([^A-Za-z]|$)`) porque `\b` no es portable en el ERE de `git
  grep`: POSIX no lo define y el motor por defecto no lo implementa, así que un patrón con
  `\b` nunca matchea nada. No es hipotético: la versión original de `portelia` (de donde se
  migró este script) tiene el mismo bug y nunca atrapó un marcador.
- **ESLint**: `.eslintrc.js` en la raíz tiene un bloque `overrides` acotado a
  `app/javascript/dashboard/portelia/**/*.vue` con `eslint-plugin-vuejs-accessibility`
  (recomendado) y dos reglas de `eslint-plugin-vue` más estrictas que el resto del fork
  (`no-setup-props-reactivity-loss`, `no-ref-object-reactivity-loss`). Corre con `pnpm eslint`
  de siempre, ya que ESLint aplica el override según el glob del archivo. Dos reglas del preset
  de accesibilidad quedan apagadas para esta carpeta:
  - `label-has-for` y `form-control-has-label` sólo miran el sitio de la llamada, no el
    template del componente hijo. `Input`/`TextArea` ya asocian `<label :for>` con `:id`
    puertas adentro, y `Select` expone `:aria-label`; la regla no puede verlo y marca cada uso
    en falso. Además el componente `Label` de Chatwoot (una badge de estado, no un form label)
    choca con `label-has-for`: la regla matchea el nombre `label` sin ninguna opción para
    excluirlo. No hay combinación de `components`/`controlComponents` que resuelva esto.
  - `anchor-has-content` sí sigue activa, con `accessibleChildren: ['Button']`: el `Button` de
    Chatwoot siempre resuelve a texto visible o a `:aria-label` si es sólo ícono.
- **`vue-mess-detector`** (`scripts/vmd-gate.js`, `pnpm run portelia:mess`): set curado — el
  set por defecto menos `amountOfComments` (pelea con los comentarios deliberados del
  capitán), `elseCondition` (dogma sin beneficio) y `singleNameComponent` (ver "Regla de
  nombres de componentes" abajo). El `--healthError` del CLI (el % de salud redondeado) se
  probó primero y resultó demasiado grueso para ser un ratchet: metiendo ocho `:key` por
  índice nuevos, la salud siguió en 96% y el comando salió 0 (encontrado en la revisión de PR
  #12). `vmd-gate.js` reemplaza eso: corre el detector con `--output json`, limpia los códigos
  ANSI que trae la salida (si no, no es JSON válido) y compara ocurrencias por regla contra el
  peor valor medido el 2026-09-16 — `totalErrors` (55), y ceros estrictos en
  `VFor With Index Key` y `Zero Length Comparison`, los dos bugs reales que este PR arregló.
  Subí los pisos si el código crece de forma legítima; nunca los bajes para que pase un PR.
  - Dos hallazgos de esta herramienta resultaron ser falsos positivos y quedan así a
    propósito: los dos `<a target="_blank">` de `FichaPropiedad.vue` (regla `htmlLink`) son
    links externos (recorrido virtual, aviso en otro sitio); `router-link` es para rutas
    internas de este router y no aplica. `vmd-gate.js` ratchea `htmlLink` en su valor actual
    (1) en vez de en cero, así que un `<a>` nuevo sin revisar sí frena. Los `computed`
    marcados por `computedSideEffects` (la regla dispara con cualquier `if` o `const` local
    dentro de un `computed`, no sólo con una mutación real) se revisaron uno por uno: ninguno
    muta estado externo, todos derivan y devuelven un valor; ese conteo entra en el piso
    genérico de `totalErrors`, no tiene su propio ratchet.
- **Gate de métricas** (`@pabloaraya6/eslint-config/metrics`, el ratchet anti-regresión de
  `veratio-ai`): evaluado y descartado para este fork. Dos bloqueos independientes, cualquiera
  alcanza: (1) el paquete se publica en un registro de GitHub Packages privado bajo un token
  personal, no en el npm público — nadie más podría instalarlo sin ese token; (2) `metrics.mjs`
  fija el parser en `@typescript-eslint/parser` sin forma de cambiarlo por opciones, así que no
  puede leer `.vue` ni evaluar JS sin anotaciones de tipos. Ninguno de los dos se resuelve sin
  tocar el paquete publicado. Queda afuera.

Por qué `vue-mess-detector` no exige nombres de dos palabras: ver PORTELIA.md > "Regla de
nombres".
