import { flushPromises, shallowMount } from '@vue/test-utils';
import Banner from 'dashboard/components-next/banner/Banner.vue';
import Label from 'dashboard/components-next/label/Label.vue';
import Spinner from 'dashboard/components-next/spinner/Spinner.vue';
import miApi from '../../api/miApi';
import CampoBusqueda from './CampoBusqueda.vue';
import FichaPersona from './FichaPersona.vue';

vi.mock('../../api/miApi', () => ({
  default: { get: vi.fn(), patch: vi.fn() },
}));
vi.mock('dashboard/composables', () => ({ useAlert: vi.fn() }));
vi.mock('vue-router', () => ({ useRoute: () => ({ params: {} }) }));

const paginaVacia = {
  data: {
    items: [],
    paginacion: { pagina: 1, porPagina: 100, total: 0, paginas: 1 },
  },
};

describe('FichaPersona', () => {
  it('cancels the previous person read and keeps the new person loading', async () => {
    let previousSignal;
    let resolveCurrent;
    miApi.get.mockImplementation((ruta, { signal }) => {
      if (ruta === 'propiedades') return Promise.resolve(paginaVacia);
      if (ruta === 'personas/1') {
        previousSignal = signal;
        return new Promise((resolve, reject) => {
          signal.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError'))
          );
        });
      }
      return new Promise(resolve => {
        resolveCurrent = resolve;
      });
    });
    const wrapper = shallowMount(FichaPersona, { props: { contactId: 1 } });

    await wrapper.setProps({ contactId: 2 });
    await flushPromises();
    expect(previousSignal.aborted).toBe(true);
    expect(wrapper.findComponent(Spinner).exists()).toBe(true);
    expect(wrapper.findComponent(Banner).exists()).toBe(false);

    resolveCurrent({
      data: {
        busquedas: [{ id: 'new-search', vigente: true, zona: 'Centro' }],
        visitas: [],
        reacciones: [],
        operaciones: [],
      },
    });
    await flushPromises();
    expect(wrapper.getComponent(CampoBusqueda).props('busqueda').id).toBe(
      'new-search'
    );
    expect(wrapper.findComponent(Spinner).exists()).toBe(false);
    wrapper.unmount();
  });

  it('retries a failed read without showing empty sections', async () => {
    miApi.get.mockRejectedValueOnce(new Error('offline'));
    miApi.get.mockResolvedValueOnce(paginaVacia);
    const wrapper = shallowMount(FichaPersona, {
      props: { contactId: 1 },
      global: { renderStubDefaultSlot: true },
    });
    await flushPromises();
    expect(wrapper.find('section').exists()).toBe(false);
    expect(wrapper.get('[role="alert"]').text()).toContain(
      'PORTELIA.FICHA.ERROR_CARGAR'
    );

    miApi.get.mockResolvedValueOnce({
      data: { busquedas: [], visitas: [], reacciones: [], operaciones: [] },
    });
    miApi.get.mockResolvedValueOnce(paginaVacia);
    wrapper.getComponent(Banner).vm.$emit('action');
    await flushPromises();
    expect(wrapper.findComponent(Banner).exists()).toBe(false);
    expect(wrapper.text()).toContain('PORTELIA.FICHA.BUSQUEDA.VACIA');
  });

  it('identifies assistant and human reactions using their stored provenance', async () => {
    miApi.get.mockResolvedValueOnce({
      data: {
        busquedas: [],
        visitas: [],
        operaciones: [],
        reacciones: [
          {
            id: 'a',
            propiedadId: 'p',
            veredicto: 'lo_piensa',
            procedencia: 'asistente',
          },
          {
            id: 'b',
            propiedadId: 'q',
            veredicto: 'le_gusto',
            procedencia: 'humano',
          },
        ],
      },
    });
    miApi.get.mockResolvedValueOnce(paginaVacia);
    const wrapper = shallowMount(FichaPersona, { props: { contactId: 1 } });
    await flushPromises();

    expect(
      wrapper.findAllComponents(Label).map(label => label.props('label'))
    ).toEqual(
      expect.arrayContaining([
        'PORTELIA.FICHA.PROCEDENCIA.asistente',
        'PORTELIA.FICHA.PROCEDENCIA.humano',
      ])
    );
  });
});
