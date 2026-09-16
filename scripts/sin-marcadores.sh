#!/bin/sh
# TODO y FIXME van al tracker o no existen; el marcador `ponytail:` esconde un atajo que acá se
# resuelve o se declara en la respuesta del PR. Acotado a portelia/: upstream no se gatea
# (PORTELIA.md, sección Rebase). Es un grep y no la regla `no-warning-comments` de ESLint porque
# esa regla no distingue mayúsculas y en castellano "todo" aparece en cualquier comentario.
cd "$(dirname "$0")/.." || exit 1
if git grep -nIE -e '\b(TODO|FIXME)\b' -e 'ponytail:' -- 'app/javascript/dashboard/portelia'; then
  echo 'marcador encontrado en portelia/: TODO y FIXME van al tracker; ponytail: se resuelve o se declara en la respuesta' >&2
  exit 1
fi
