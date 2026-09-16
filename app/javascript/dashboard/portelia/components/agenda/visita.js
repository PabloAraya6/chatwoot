// La Visita como la ve la Agenda: la tabla de transiciones (copiada de packages/dominio del
// monorepo, que el fork no importa; la API la vuelve a aplicar), los colores por estado y
// el formato de fechas del asesor.

export const TRANSICIONES = {
  pendiente: [
    'confirmada',
    'realizada',
    'cancelada',
    'no_se_presento',
    'reprogramada',
  ],
  confirmada: ['realizada', 'cancelada', 'no_se_presento', 'reprogramada'],
  realizada: [],
  cancelada: [],
  no_se_presento: [],
  reprogramada: [],
};

export const COLOR_ESTADO = {
  pendiente: 'amber',
  confirmada: 'blue',
  realizada: 'teal',
  cancelada: 'ruby',
  no_se_presento: 'ruby',
  reprogramada: 'amber',
};

export const DIAS_SEMANA = [1, 2, 3, 4, 5, 6, 0];

const DIA_MS = 86_400_000;

// 'sv-SE' formatea 'YYYY-MM-DD' en la zona del navegador: la clave con la que se agrupa por día.
export const claveDia = fecha => new Date(fecha).toLocaleDateString('sv-SE');

export const hoy = () => claveDia(Date.now());

export const diasDesdeHoy = cantidad =>
  Array.from({ length: cantidad }, (_, indice) =>
    claveDia(Date.now() + indice * DIA_MS)
  );

const formatoHora = new Intl.DateTimeFormat('es-AR', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

const formatoDia = new Intl.DateTimeFormat('es-AR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

export const horaDe = iso => formatoHora.format(new Date(iso));

export const etiquetaDia = clave =>
  formatoDia.format(new Date(`${clave}T12:00:00`));

export const inicioDelDia = clave => new Date(`${clave}T00:00:00`);
