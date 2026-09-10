// La Búsqueda como tabla de campos, en el orden en que la ficha los muestra. Cada campo se
// traduce a la forma `attribute` que esperan los primitivos de components-next/CustomAttributes
// (ListAttribute, OtherAttribute), así la ficha se ve igual que los atributos del contacto.
// Los valores de las listas son los del dominio (CONTEXT.md del monorepo), en castellano.

export const CAMPOS_BUSQUEDA = [
  {
    campo: 'operacion',
    tipo: 'list',
    valores: ['venta', 'alquiler', 'temporario', 'proyecto'],
  },
  {
    campo: 'tipoPropiedad',
    tipo: 'list',
    valores: [
      'casa',
      'departamento',
      'monoambiente',
      'terreno',
      'salon',
      'galpon',
      'finca',
      'oficina',
    ],
  },
  { campo: 'zona', tipo: 'text' },
  { campo: 'ciudad', tipo: 'text' },
  { campo: 'presupuesto', tipo: 'number' },
  { campo: 'moneda', tipo: 'list', valores: ['ARS', 'USD'] },
  { campo: 'dormitoriosMin', tipo: 'number' },
  { campo: 'ambientesMin', tipo: 'number' },
  { campo: 'cochera', tipo: 'checkbox' },
  { campo: 'requisitos', tipo: 'lista-texto' },
  { campo: 'ultimoHablado', tipo: 'text' },
];

const SEPARADOR = ', ';

export const atributoDe = (busqueda, definicion, etiqueta) => {
  const crudo = busqueda[definicion.campo];
  const value =
    definicion.tipo === 'lista-texto'
      ? (crudo ?? []).join(SEPARADOR)
      : (crudo ?? '');
  return {
    attributeKey: definicion.campo,
    attributeDisplayName: etiqueta,
    attributeDisplayType:
      definicion.tipo === 'lista-texto' ? 'text' : definicion.tipo,
    attributeValues: definicion.valores ?? [],
    value,
  };
};

// Lo que el primitivo emite vuelve al tipo de la API: la lista de requisitos se escribe
// separada por comas y viaja como array.
export const valorParaApi = (definicion, emitido) => {
  if (definicion.tipo !== 'lista-texto') return emitido;
  return String(emitido)
    .split(',')
    .map(parte => parte.trim())
    .filter(Boolean);
};
