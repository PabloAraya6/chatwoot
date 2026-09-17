import miApi from './miApi';

const POR_PAGINA = 100;

// Los selectores de Agenda y Persona necesitan el catálogo completo. La pantalla principal
// consume una sola página; estos flujos recorren explícitamente las páginas de la misma API.
export const listarTodasLasPropiedades = async signal => {
  const primera = await miApi.get('propiedades', {
    signal,
    params: { pagina: 1, porPagina: POR_PAGINA },
  });
  const propiedades = [...primera.data.items];
  const restantes = await Promise.all(
    Array.from(
      { length: Math.max(0, primera.data.paginacion.paginas - 1) },
      (_, indice) =>
        miApi.get('propiedades', {
          signal,
          params: { pagina: indice + 2, porPagina: POR_PAGINA },
        })
    )
  );
  restantes.forEach(respuesta => propiedades.push(...respuesta.data.items));

  return propiedades;
};
