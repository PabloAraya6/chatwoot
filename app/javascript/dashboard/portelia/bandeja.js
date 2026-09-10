// La lista del asesor tiene dos pestañas: Mías y Guardia (las consultas sin dueño, CONTEXT.md).
// "Todos" es de la inmobiliaria entera y no entra.
export const pestanasAsesor = (items, t) =>
  items
    .filter(item => item.key !== 'all')
    .map(item =>
      item.key === 'unassigned'
        ? { ...item, name: t('PORTELIA.BANDEJA.GUARDIA') }
        : item
    );
