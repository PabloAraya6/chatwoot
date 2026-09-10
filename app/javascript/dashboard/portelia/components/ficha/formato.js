// Cómo se nombra una Propiedad y una fecha en la ficha: lo que el asesor reconoce de un
// vistazo (la dirección, o la zona si no la hay), no un uuid.

const fecha = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

export const precio = (monto, moneda) =>
  monto ? `${moneda ?? ''} ${monto.toLocaleString('es-AR')}`.trim() : '';

export const nombrePropiedad = propiedad => {
  if (!propiedad) return '';
  const lugar = propiedad.direccion || propiedad.zona || propiedad.tipo;
  const valor = precio(propiedad.precio, propiedad.moneda);
  return valor ? `${lugar} · ${valor}` : lugar;
};

export const fechaCorta = iso => fecha.format(new Date(iso));
