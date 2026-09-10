import { describe, it, expect } from 'vitest';
import { CAMPOS_BUSQUEDA, atributoDe, valorParaApi } from './camposBusqueda';

const definicion = nombre => CAMPOS_BUSQUEDA.find(c => c.campo === nombre);

describe('camposBusqueda', () => {
  it('traduce un campo de lista a la forma de ListAttribute con los valores del dominio', () => {
    const atributo = atributoDe(
      { operacion: 'venta' },
      definicion('operacion'),
      'Operación'
    );
    expect(atributo).toEqual({
      attributeKey: 'operacion',
      attributeDisplayName: 'Operación',
      attributeDisplayType: 'list',
      attributeValues: ['venta', 'alquiler', 'temporario', 'proyecto'],
      value: 'venta',
    });
  });

  it('muestra los requisitos separados por coma y los devuelve como array limpio', () => {
    const requisitos = definicion('requisitos');
    expect(
      atributoDe(
        { requisitos: ['patio', 'luminoso'] },
        requisitos,
        'Requisitos'
      ).value
    ).toBe('patio, luminoso');
    expect(valorParaApi(requisitos, ' patio,luminoso , ,')).toEqual([
      'patio',
      'luminoso',
    ]);
  });

  it('un campo sin valor queda vacío y un número pasa tal cual a la API', () => {
    expect(atributoDe({}, definicion('zona'), 'Zona').value).toBe('');
    expect(valorParaApi(definicion('presupuesto'), 120000)).toBe(120000);
  });
});
