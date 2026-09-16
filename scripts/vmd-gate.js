#!/usr/bin/env node
// Ratchet real sobre vue-mess-detector, acotado a portelia/.
//
// `--healthError` (el % de salud redondeado) resultó ser demasiado grueso: absorbe varias
// regresiones nuevas sin mover el número (comprobado en la revisión de PR #12, 2026-09-16:
// ocho `:key` por índice nuevos no lo movieron un solo punto). Este script cuenta ocurrencias
// reales por regla y compara contra el peor valor medido. `--output json` no escapa los
// códigos ANSI de las descripciones -no es JSON válido tal cual sale-, así que se limpian antes
// de parsear.
//
// Los pisos son el peor valor real, no un objetivo aspiracional: subilos si el código crece de
// forma legítima, nunca los bajes para que pase un PR puntual.
'use strict';

const { execFileSync } = require('node:child_process');

const RUTA = 'app/javascript/dashboard/portelia';
const SET_CURADO = 'amountOfComments,elseCondition,singleNameComponent';

const PISOS = {
  // Cualquier error de vue-mess-detector nuevo sube este número; no depende de cómo redondee
  // el health%. Medido el 2026-09-16 tras arreglar los hallazgos reales del set curado.
  totalErrors: 55,
  // Bug real ya arreglado (Disponibilidad.vue). Piso 0: cualquier reaparición es una regresión.
  'rrd ~ VFor With Index Key': 0,
  // Bug real ya arreglado (Agenda.vue). Piso 0 por la misma razón.
  'rrd ~ Zero Length Comparison': 0,
  // Falso positivo conocido y documentado (los dos links externos de FichaPropiedad.vue,
  // `router-link` no aplica). Piso en el valor actual: cualquier link nuevo sin revisar frena.
  'rrd ~ html link': 1,
};

const salida = execFileSync(
  'npx',
  [
    '--no-install',
    'vue-mess-detector',
    'analyze',
    RUTA,
    '--ignore',
    SET_CURADO,
    '--output',
    'json',
  ],
  { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }
);

// eslint-disable-next-line no-control-regex -- limpia los códigos ANSI que rompen el JSON.
const limpio = salida.replace(/\x1b\[[0-9;]*m/g, '');
const reporte = JSON.parse(limpio);

const conteos = { totalErrors: reporte.codeHealth.errors };
Object.entries(reporte.reportOutput || {}).forEach(([regla, items]) => {
  conteos[regla] = items.length;
});

let falla = false;
Object.entries(PISOS).forEach(([clave, piso]) => {
  const actual = conteos[clave] || 0;
  const ok = actual <= piso;
  if (!ok) falla = true;
  console.log(`${ok ? '✓' : '✗'} ${clave}: ${actual} (piso ${piso})`);
});

console.log(
  `vue-mess-detector: ${reporte.codeHealth.errors} errores, ${reporte.codeHealth.warnings} avisos, salud ${reporte.codeHealth.points}%`
);

if (falla) {
  console.error(
    `vue-mess-detector: regresión sobre un piso ratchet. Corré 'npx vue-mess-detector analyze ${RUTA} --ignore ${SET_CURADO}' para ver el detalle.`
  );
  process.exit(1);
}
