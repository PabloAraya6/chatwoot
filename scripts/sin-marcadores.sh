#!/bin/sh
# Los marcadores de trabajo pospuesto van al tracker o no existen; el de ponytail (dos puntos
# después del nombre) esconde un atajo que acá se resuelve o se declara en la respuesta del PR.
# Acotado a portelia/: upstream no se gatea (PORTELIA.md, sección Rebase). Sólo código
# (.js/.vue/.json), no Markdown: la documentación necesita poder nombrar los marcadores.
# Es un grep y no la regla `no-warning-comments` de ESLint porque esa regla no distingue
# mayúsculas y en castellano "todo" aparece en cualquier comentario.
# `\b` no es portable en el ERE de `git grep` (POSIX no lo define y el motor por defecto no lo
# implementa: nunca matchea, el script salía 0 siempre). El borde de palabra se arma a mano.
cd "$(dirname "$0")/.." || exit 1
if git grep -nIE -e '(^|[^A-Za-z])(TODO|FIXME)([^A-Za-z]|$)' -e 'ponytail:' -- \
  'app/javascript/dashboard/portelia/*.js' \
  'app/javascript/dashboard/portelia/**/*.js' \
  'app/javascript/dashboard/portelia/**/*.vue' \
  'app/javascript/dashboard/portelia/**/*.json'; then
  echo 'marcador encontrado en portelia/: TODO y FIXME van al tracker; ponytail: se resuelve o se declara en la respuesta' >&2
  exit 1
fi
