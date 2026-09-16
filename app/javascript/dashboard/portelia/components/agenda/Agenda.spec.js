import { flushPromises, shallowMount } from '@vue/test-utils';
import Banner from 'dashboard/components-next/banner/Banner.vue';
import miApi from '../../api/miApi';
import Agenda from './Agenda.vue';
import TarjetaVisita from './TarjetaVisita.vue';
import CancelarVisita from './CancelarVisita.vue';
import NuevaReaccion from '../ficha/NuevaReaccion.vue';

vi.mock('dashboard/composables', () => ({ useAlert: vi.fn() }));
vi.mock('vuex', () => ({
  useStore: () => ({
    getters: { 'contacts/getContact': () => ({ name: 'Persona' }) },
    dispatch: vi.fn(),
  }),
}));
vi.mock('../../api/miApi', () => ({
  default: { get: vi.fn(), patch: vi.fn() },
}));

it('distinguishes read failure from an empty agenda and retries', async () => {
  miApi.get.mockRejectedValue(new Error('offline'));
  const wrapper = shallowMount(Agenda, {
    global: { renderStubDefaultSlot: true },
  });
  await flushPromises();
  expect(wrapper.get('[role="alert"]').text()).toContain(
    'PORTELIA.AGENDA.ERROR_CARGA'
  );
  expect(wrapper.find('empty-state-layout-stub').exists()).toBe(false);
  miApi.get.mockResolvedValue({ data: [] });
  wrapper.getComponent(Banner).vm.$emit('action');
  await flushPromises();
  expect(wrapper.find('[role="alert"]').exists()).toBe(false);
});

it('serializes changes and binds follow-up reaction to the completed visit', async () => {
  const visitas = [1, 2].map(id => ({
    id: String(id),
    contactId: id,
    propiedadId: `p${id}`,
    at: new Date().toISOString(),
    estado: 'confirmada',
  }));
  miApi.get.mockImplementation(ruta =>
    Promise.resolve({ data: ruta === 'propiedades' ? [] : visitas })
  );
  let resolve;
  miApi.patch.mockReturnValueOnce(
    new Promise(done => {
      resolve = done;
    })
  );
  const abrir = vi.fn();
  const wrapper = shallowMount(Agenda, {
    global: {
      stubs: {
        NuevaReaccion: {
          props: ['contactId'],
          methods: { abrir },
          template: '<div />',
        },
        CancelarVisita: { methods: { abrir() {} }, template: '<div />' },
      },
    },
  });
  await flushPromises();
  const cards = wrapper.findAllComponents(TarjetaVisita);
  cards[0].vm.$emit('mover', 'realizada');
  cards[1].vm.$emit('mover', 'cancelada');
  await flushPromises();
  expect(miApi.patch).toHaveBeenCalledTimes(1);
  expect(cards.every(card => card.props('ocupada'))).toBe(true);
  resolve({ data: { ...visitas[0], estado: 'realizada' } });
  await flushPromises();
  expect(wrapper.getComponent(NuevaReaccion).props('contactId')).toBe(1);
  expect(abrir).toHaveBeenCalledWith('p1');
  expect(wrapper.findComponent(CancelarVisita).exists()).toBe(true);
});
