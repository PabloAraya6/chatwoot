import { flushPromises, shallowMount } from '@vue/test-utils';
import Banner from 'dashboard/components-next/banner/Banner.vue';
import miApi from '../../api/miApi';
import Configuracion from './Configuracion.vue';

vi.mock('../../api/miApi', () => ({
  default: { get: vi.fn(), put: vi.fn() },
}));
vi.mock('dashboard/composables', () => ({ useAlert: vi.fn() }));

describe('Configuracion', () => {
  it('does not offer a default form when loading fails and can retry', async () => {
    miApi.get.mockRejectedValueOnce(new Error('offline'));
    miApi.get.mockResolvedValueOnce({ data: { conversaciones: 0 } });
    const wrapper = shallowMount(Configuracion, {
      global: { renderStubDefaultSlot: true },
    });
    await flushPromises();

    expect(wrapper.find('form').exists()).toBe(false);
    expect(wrapper.get('[role="alert"]').text()).toContain(
      'PORTELIA.CONFIGURACION.ERROR_CARGA'
    );
    expect(miApi.put).not.toHaveBeenCalled();

    miApi.get.mockResolvedValueOnce({
      data: { nombreAsesor: 'Ana', muestraPropiedades: false },
    });
    miApi.get.mockResolvedValueOnce({ data: { conversaciones: 0 } });
    wrapper.getComponent(Banner).vm.$emit('action');
    await flushPromises();

    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    expect(wrapper.find('form').exists()).toBe(true);
    expect(miApi.get).toHaveBeenCalledTimes(4);
  });

  it('does not expose the form when spending data fails to load', async () => {
    miApi.get.mockResolvedValueOnce({ data: { nombreAsesor: 'Ana' } });
    miApi.get.mockRejectedValueOnce(new Error('offline'));
    const wrapper = shallowMount(Configuracion);
    await flushPromises();

    expect(wrapper.find('form').exists()).toBe(false);
    expect(wrapper.findComponent(Banner).exists()).toBe(true);
  });
});
