import { flushPromises, shallowMount } from '@vue/test-utils';
import Banner from 'dashboard/components-next/banner/Banner.vue';
import EmptyStateLayout from 'dashboard/components-next/EmptyStateLayout.vue';
import miApi from '../../api/miApi';
import ListaPropiedades from './ListaPropiedades.vue';
import TarjetaPropiedad from './TarjetaPropiedad.vue';

vi.mock('../../api/miApi', () => ({ default: { get: vi.fn() } }));
vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock('dashboard/composables/useAccount', () => ({
  useAccount: () => ({ accountScopedRoute: name => ({ name }) }),
}));

describe('ListaPropiedades', () => {
  it('distinguishes a failed request from an empty catalog and retries', async () => {
    miApi.get.mockRejectedValueOnce(new Error('offline'));
    const wrapper = shallowMount(ListaPropiedades, {
      global: { renderStubDefaultSlot: true },
    });
    await flushPromises();

    expect(wrapper.findComponent(EmptyStateLayout).exists()).toBe(false);
    expect(wrapper.get('[role="alert"]').text()).toContain(
      'PORTELIA.PROPIEDADES.ERROR_CARGA'
    );

    miApi.get.mockResolvedValueOnce({
      data: {
        items: [],
        paginacion: { pagina: 1, porPagina: 20, total: 0, paginas: 1 },
      },
    });
    wrapper.getComponent(Banner).vm.$emit('action');
    await flushPromises();

    expect(wrapper.findComponent(Banner).exists()).toBe(false);
    expect(wrapper.findComponent(EmptyStateLayout).exists()).toBe(true);
  });

  it.each([1, 20])(
    'renders the %i properties returned for the current page',
    async count => {
      miApi.get.mockResolvedValueOnce({
        data: {
          items: Array.from({ length: count }, (_, id) => ({ id, fotos: [] })),
          paginacion: {
            pagina: 1,
            porPagina: 20,
            total: count === 20 ? 75 : count,
            paginas: count === 20 ? 4 : 1,
          },
        },
      });
      const wrapper = shallowMount(ListaPropiedades);
      await flushPromises();

      expect(wrapper.findAllComponents(TarjetaPropiedad)).toHaveLength(count);
      expect(wrapper.findComponent(EmptyStateLayout).exists()).toBe(false);
      expect(miApi.get).toHaveBeenCalledWith(
        'propiedades',
        expect.objectContaining({
          params: expect.objectContaining({ pagina: 1, porPagina: 20 }),
        })
      );
    }
  );
});
