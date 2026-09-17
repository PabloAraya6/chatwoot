const compactMoney = new Intl.NumberFormat('es-AR', {
  maximumFractionDigits: 1,
});
const THOUSAND = 1000;
const MILLION = 1000000;

export const precioBreve = (monto, moneda) => {
  const escala = monto >= MILLION ? MILLION : THOUSAND;
  const valor =
    monto >= THOUSAND
      ? `${compactMoney.format(monto / escala)}${escala === MILLION ? 'M' : 'k'}`
      : compactMoney.format(monto);
  return `${moneda === 'ARS' ? '$' : `${moneda ?? ''} `}${valor}`;
};

export const encabezadoBusqueda = (busqueda, t) =>
  t('PORTELIA.HILO.BUSCA', {
    tipo: busqueda.tipoPropiedad
      ? t(
          `PORTELIA.PROPIEDADES.TIPO.${busqueda.tipoPropiedad}`
        ).toLocaleLowerCase('es')
      : t('PORTELIA.FICHA.PROPIEDAD').toLocaleLowerCase('es'),
    operacion: busqueda.operacion
      ? t(`PORTELIA.HILO.OPERACION.${busqueda.operacion}`)
      : '',
  }).trim();

export const detalleBusqueda = (busqueda, t) =>
  [
    busqueda.zona || busqueda.ciudad,
    busqueda.presupuesto &&
      t('PORTELIA.HILO.HASTA', {
        precio: precioBreve(busqueda.presupuesto, busqueda.moneda),
      }),
    busqueda.dormitoriosMin &&
      t('PORTELIA.HILO.DORMITORIOS', { n: busqueda.dormitoriosMin }),
  ]
    .filter(Boolean)
    .join(' · ');
