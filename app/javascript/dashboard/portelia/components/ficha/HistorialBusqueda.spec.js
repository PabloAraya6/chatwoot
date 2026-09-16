import { flushPromises, shallowMount } from '@vue/test-utils';
import Banner from 'dashboard/components-next/banner/Banner.vue';
import HistorialBusqueda from './HistorialBusqueda.vue';
import miApi from '../../api/miApi';

vi.mock('../../api/miApi', () => ({ default: { get: vi.fn() } }));
const global = {
  renderStubDefaultSlot: true,
  stubs: {
    DialogoAsesor: { methods: { open() {} }, template: '<div><slot /></div>' },
  },
};

it('presents stored changes with provenance and preserves zero and false', async () => {
  miApi.get.mockResolvedValue({
    data: [
      {
        id: 'c1',
        campo: 'cochera',
        antes: null,
        despues: false,
        procedencia: 'asistente',
        at: '2026-09-16T12:00:00Z',
      },
      {
        id: 'c2',
        campo: 'dormitoriosMin',
        antes: 1,
        despues: 0,
        procedencia: 'humano',
        at: '2026-09-16T12:01:00Z',
      },
    ],
  });
  const wrapper = shallowMount(HistorialBusqueda, { global });
  await wrapper.vm.abrir('busqueda-1');
  expect(miApi.get).toHaveBeenCalledWith(
    'cambios?objeto=busqueda&id=busqueda-1',
    expect.objectContaining({ signal: expect.any(AbortSignal) })
  );
  expect(wrapper.text()).toContain('PORTELIA.FICHA.SIN_DATO');
  expect(wrapper.text()).toContain('PORTELIA.FICHA.NO');
  expect(wrapper.findAll('dd').map(e => e.text())).toEqual([
    'PORTELIA.FICHA.SIN_DATO',
    'PORTELIA.FICHA.NO',
    '1',
    '0',
  ]);
  expect(wrapper.findAll('label-stub').map(e => e.attributes('label'))).toEqual(
    [
      'PORTELIA.FICHA.PROCEDENCIA.asistente',
      'PORTELIA.FICHA.PROCEDENCIA.humano',
    ]
  );
});

it('does not retain another search history after a failed load and can retry', async () => {
  miApi.get.mockRejectedValueOnce(new Error('offline'));
  const wrapper = shallowMount(HistorialBusqueda, { global });
  await wrapper.vm.abrir('busqueda-2');
  expect(wrapper.get('[role="alert"]').text()).toContain(
    'PORTELIA.FICHA.HISTORIAL.ERROR'
  );
  miApi.get.mockResolvedValueOnce({ data: [] });
  wrapper.getComponent(Banner).vm.$emit('action');
  await flushPromises();
  expect(wrapper.text()).toContain('PORTELIA.FICHA.HISTORIAL.VACIO');
});
