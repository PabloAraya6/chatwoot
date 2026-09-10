# PORTELIA.md

Fork delgado de Chatwoot (`v4.17.1`, rama `portelia`) que es la Bandeja del asesor de Portelia.
El código nuestro vive en `app/javascript/dashboard/portelia/` (su `README.md` explica la
forma) detrás del flag de cuenta `portelia_ui`; upstream se toca en el mínimo de líneas y cada
punto de enchufe queda anotado acá. Las decisiones viven en el monorepo
(`~/Projects/portelia/docs/maps/el-fork-en-manos-del-asesor/`).

## Archivos de upstream tocados

| Archivo | Por qué |
|---|---|
| `app/policies/conversation_policy.rb` | Un agente no abre la conversación asignada a otro (parche previo al mapa). |
| `config/features.yml` | El flag `portelia_ui`, al final, `column: feature_flags_ext_1`. |
| `docker/Dockerfile` | `.git_sha` cae al build arg `GIT_SHA` cuando `git rev-parse` no puede (worktree o contexto por URL sin `.git`). |
| `app/javascript/dashboard/featureFlags.js` | Espejo del flag: `FEATURE_FLAGS.PORTELIA_UI`. |
| `app/javascript/dashboard/components-next/sidebar/Sidebar.vue` | Con el flag prendido renderiza `SidebarAsesor` en lugar de `menuItems` (import, computed `hasPorteliaUi`, `v-if`/`v-else` en el `<nav>`). |
| `app/javascript/dashboard/routes/dashboard/dashboard.routes.js` | Suma `porteliaRoutes` como hijas de `AppContainer`. |
| `app/javascript/dashboard/i18n/locale/es/index.js` | Mezcla `portelia/i18n/es/portelia.json`. |
| `app/javascript/dashboard/composables/useUISettings.js` | Suma `portelia_ficha` a `DEFAULT_CONVERSATION_SIDEBAR_ITEMS_ORDER`, arriba de todo. |
| `app/javascript/dashboard/routes/dashboard/conversation/ContactPanel.vue` | Con el flag, `FichaPersona` como sección `portelia_ficha` del acordeón del panel (import, `hasPorteliaUi`, un `v-if` en el `#item`). |
| `app/javascript/dashboard/routes/dashboard/contacts/pages/ContactManageView.vue` | Con el flag, `FichaPersona` arriba de los datos del contacto en la página Personas (import, `hasPorteliaUi`, un `v-if`). |

Archivos nuevos fuera de `portelia/`: `PORTELIA.md`, `bin/portelia-dev`,
`docker-compose.portelia.yaml`, `Caddyfile.taller`.

## Regla de nombres

- Un componente nuestro nunca se llama como uno de upstream: `SidebarAsesor`, no `Sidebar`.
- Rutas con prefijo `portelia_`; claves i18n bajo `PORTELIA.*`, sólo en `es`.
- Nombres del dominio en el castellano de `CONTEXT.md` del monorepo (Persona, Propiedad,
  Búsqueda, Visita, Operación).

## Prender el flag

```sh
bin/portelia-dev exec rails-taller bundle exec rails runner "Account.find(6).enable_features!('portelia_ui')"
```

`disable_features!` lo apaga (sin el `!` no se guarda). En una instancia real se hace por consola o por Super Admin.

## El taller

`bin/portelia-dev` levanta Caddy (`http://localhost:3020`) delante de Rails, más Sidekiq y Vite
con hot reload, en contenedores de desarrollo con este repo montado, sobre el Postgres y el
Redis del laboratorio (`LABORATORIO`, por defecto `~/Projects/chatwoot`, que tiene que estar corriendo
con `docker compose -f docker-compose.production.yaml up`). Comparten la base
`chatwoot_production` y el `.env` del laboratorio; el Redis es el mismo servidor pero la base
`/1`, así las colas, la caché y el cable del taller no se cruzan con el Sidekiq del
laboratorio. Consecuencia: lo que entra por GOWA lo procesa el laboratorio y en el taller
aparece al recargar, no en vivo; lo que hace el taller sí es en vivo.

- `bin/portelia-dev` (equivale a `up`): la primera vez construye la imagen
  `chatwoot-portelia:taller` (`docker/Dockerfile` con `RAILS_ENV=development`, unos 15
  minutos) y arranca los tres servicios. `bin/portelia-dev up -d` en segundo plano,
  `bin/portelia-dev logs -f rails-taller`, `bin/portelia-dev down`.
- Caddy (`Caddyfile.taller`) manda `/mi/*` a la API propia (`apps/api` del monorepo) corriendo en
  la Mac en el puerto 3002 (`pnpm --filter @portelia/api start`) y el resto a Rails, igual que el
  `deploy/Caddyfile` de producción. Sin la API levantada, `/mi/api` devuelve 502.
- `TALLER=N bin/portelia-dev` levanta otro taller aparte (proyecto `taller-N`, puertos `3020+N`
  para Caddy, `3036+N` para el HMR de Vite y `3002+N` para la API; `PUERTO_API` lo cambia). Sirve
  para trabajar varios worktrees del fork a la vez (`git worktree add ../chatwoot-portelia-N -b
  <rama> portelia`); cada uno pesa 1,4 GB y Docker tiene 7,6 GB, así que tres es el techo.
- `bin/portelia-dev build` cuando cambian `Gemfile.lock`, `pnpm-lock.yaml` o el `Dockerfile`:
  `node_modules` y los gems viven en la imagen (un `pnpm install` al arrancar el contenedor se
  colgaba sin log).
- Los servicios se llaman `rails-taller`, `sidekiq-taller` y `vite-taller` porque están en
  la red `chatwoot_default` del laboratorio y GOWA le pega a `rails:3000`.
- La Mac no tiene Ruby 3.4, por eso Rails corre en contenedor. Vite también, para que
  `node_modules` sea de Linux y Rails lo alcance por la red interna; Vite publica `3036` en la
  Mac para el websocket de HMR.

Usuarios del laboratorio: en la memoria del monorepo (`asesor alfredo.bettio@estudio3.demo`).

Trampa: el laboratorio tiene en `InstallationConfig` `DASHBOARD_SCRIPTS` el script de marca del
stock (`deploy/brand` del monorepo), que reetiqueta el DOM por `MutationObserver` (Bandeja
pasa a Consultas, aparecen Mías y Guardia). Como la base es compartida, en el taller también
corre. Para ver el fork pelado se vacía y se restaura desde el taller:
`InstallationConfig.find_by(name: 'DASHBOARD_SCRIPTS').update!(value: '')` por rails runner
(guardar el valor antes). Deja de hacer falta cuando la marca pase al fork.

## Lint y tests

`pnpm install` en la Mac (Node 24, pnpm 10) y `pnpm eslint`; los tests de Vue con `pnpm test`.
Los specs de Ruby corren en el contenedor:
`bin/portelia-dev exec rails-taller bundle exec rspec spec/lib/config_loader_spec.rb`.

## Rebase

Congelado en `v4.17.1` durante el mapa; se rebasea sólo por un parche de seguridad.

1. `git fetch origin --tags && git rebase v<nueva> portelia`.
2. Si para en `conversation_policy.rb`, mirar el archivo en el tag nuevo y rehacer el cambio.
   Los conflictos del Vue son sólo en los archivos de la tabla de arriba; `portelia/` no
   conflictúa nunca.
3. `pnpm eslint`, `bin/portelia-dev build` y probar el sidebar con el flag prendido y apagado.
4. `git push --force-with-lease portelia portelia` y anotar el SHA nuevo en `deploy/` del
   monorepo (`deploy/README.md` tiene el resto de la receta).
