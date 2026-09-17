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

const PREFIJO_DE_NOMBRE =
  /^(?:torres?|consorcio|ccio\.?|edificio|complejo|barrio privado|loteo|condominio|country)\b/i;

const ENCABEZADO_GENERICO =
  /^(?:el proyecto|avance de obra|casa|departamento|depto\.?|terreno|lote|finca|galp[oó]n|local|oficina|excelente|oportunidad)\b/i;

const nombreDesdeDescripcion = descripcion => {
  const primeraLinea = String(descripcion || '')
    .split(/\n+/)
    .map(linea =>
      linea
        .replace(
          /^[\p{Emoji_Presentation}\p{Extended_Pictographic}\s✅🚩🔺•·-]+/gu,
          ''
        )
        .replace(/\s+/g, ' ')
        .trim()
    )
    .find(Boolean);

  if (
    !primeraLinea ||
    primeraLinea.length > 90 ||
    ENCABEZADO_GENERICO.test(primeraLinea)
  ) {
    return '';
  }
  if (PREFIJO_DE_NOMBRE.test(primeraLinea)) return primeraLinea;

  const letras = primeraLinea.replace(/[^\p{L}]/gu, '');
  const pareceNombre =
    letras.length >= 4 &&
    primeraLinea.split(/\s+/).length <= 10 &&
    !/[.:;]$/.test(primeraLinea) &&
    letras === letras.toLocaleUpperCase('es-AR');

  return pareceNombre ? primeraLinea : '';
};

export const tituloDe = (propiedad, t) => {
  const nombre = nombreDesdeDescripcion(propiedad.descripcion);

  if (nombre && propiedad.direccion) {
    return `[${nombre}] - ${propiedad.direccion}`;
  }

  return (
    nombre ||
    propiedad.direccion ||
    [t(`PORTELIA.PROPIEDADES.TIPO.${propiedad.tipo}`), propiedad.zona]
      .filter(Boolean)
      .join(' · ')
  );
};

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
