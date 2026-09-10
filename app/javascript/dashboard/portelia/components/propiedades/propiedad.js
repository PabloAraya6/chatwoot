// Los enums de la Propiedad son los de `packages/dominio` del monorepo (enums.ts); acá viven
// copiados porque el fork no importa del monorepo. Si cambia uno, cambia el otro.
export const TIPOS = [
  'casa',
  'departamento',
  'monoambiente',
  'terreno',
  'salon',
  'galpon',
  'finca',
  'oficina',
];

export const OPERACIONES = ['venta', 'alquiler', 'temporario', 'proyecto'];

export const ESTADOS = [
  'disponible',
  'reservada',
  'alquilada',
  'vendida',
  'suspendida',
];

export const MONEDAS = ['ARS', 'USD'];

export const COLOR_ESTADO = {
  disponible: 'teal',
  reservada: 'amber',
  alquilada: 'slate',
  vendida: 'slate',
  suspendida: 'ruby',
};

export const opcionesDe = (valores, t, grupo) =>
  valores.map(valor => ({
    value: valor,
    label: t(`PORTELIA.PROPIEDADES.${grupo}.${valor}`),
  }));

export const tituloDe = (propiedad, t) =>
  propiedad.direccion ||
  [t(`PORTELIA.PROPIEDADES.TIPO.${propiedad.tipo}`), propiedad.zona]
    .filter(Boolean)
    .join(' · ');

export const lugarDe = propiedad =>
  [propiedad.zona, propiedad.ciudad].filter(Boolean).join(', ');

export const precioDe = (propiedad, t) => {
  if (propiedad.precio === undefined || !propiedad.moneda) {
    return t('PORTELIA.PROPIEDADES.PRECIO_CONSULTAR');
  }

  // Un temporario se cotiza por día o por semana según el aviso; sin ese dato no se inventa.
  const porMes = propiedad.operacion === 'alquiler';

  return `${propiedad.moneda} ${propiedad.precio.toLocaleString('es-AR')}${
    porMes ? t('PORTELIA.PROPIEDADES.POR_MES') : ''
  }`;
};

// Un aviso compartido desde Android llega en `url` o adentro de `text`.
export const urlCompartida = query => {
  const candidata = [query.url, query.text]
    .flatMap(valor => (valor ? [String(valor)] : []))
    .join(' ')
    .match(/https?:\/\/\S+/);

  return candidata ? candidata[0] : '';
};
