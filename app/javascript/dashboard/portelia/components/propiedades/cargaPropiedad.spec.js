import { flushPromises, shallowMount } from '@vue/test-utils';
import Banner from 'dashboard/components-next/banner/Banner.vue';
import Breadcrumb from 'dashboard/components-next/breadcrumb/Breadcrumb.vue';
import Input from 'dashboard/components-next/input/Input.vue';
import TextArea from 'dashboard/components-next/textarea/TextArea.vue';
import { useAlert } from 'dashboard/composables';
import miApi from '../../api/miApi';
import FichaPropiedad from './FichaPropiedad.vue';
import FormularioPropiedad from './FormularioPropiedad.vue';

const { replace, push } = vi.hoisted(() => ({
  replace: vi.fn(),
  push: vi.fn(),
}));
vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ replace, push }),
}));
vi.mock('dashboard/composables/useAccount', () => ({
  useAccount: () => ({
    accountScopedRoute: (name, params) => ({ name, params }),
  }),
}));
vi.mock('dashboard/composables', () => ({ useAlert: vi.fn() }));
vi.mock('../../api/miApi', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}));

const propiedad = {
  id: 'p1',
  direccion: 'Primera',
  tipo: 'casa',
  operacion: 'venta',
  estado: 'disponible',
  fotos: [],
  amenities: [],
};

describe.each([FichaPropiedad, FormularioPropiedad])(
  'property loading',
  component => {
    it('retains the route and offers retry on network failure, not a false 404', async () => {
      miApi.get.mockRejectedValueOnce(new Error('offline'));
      const wrapper = shallowMount(component, {
        props: { propiedadId: 'p1' },
        global: { renderStubDefaultSlot: true },
      });
      await flushPromises();

      expect(replace).not.toHaveBeenCalled();
      expect(useAlert).not.toHaveBeenCalled();
      expect(wrapper.find('form').exists()).toBe(false);
      expect(wrapper.get('[role="alert"]').text()).toContain(
        'PORTELIA.PROPIEDADES.ERROR_CARGA'
      );

      miApi.get.mockResolvedValueOnce({ data: propiedad });
      wrapper.getComponent(Banner).vm.$emit('action');
      await flushPromises();
      expect(wrapper.findComponent(Banner).exists()).toBe(false);
      expect(wrapper.getComponent(Breadcrumb).props('items')[1].label).toBe(
        'Primera'
      );
    });

    it('returns to the catalog only for a 404', async () => {
      miApi.get.mockRejectedValueOnce({ response: { status: 404 } });
      shallowMount(component, { props: { propiedadId: 'missing' } });
      await flushPromises();

      expect(useAlert).toHaveBeenCalledWith(
        'PORTELIA.PROPIEDADES.FICHA.NO_EXISTE'
      );
      expect(replace).toHaveBeenCalledWith({ name: 'portelia_propiedades' });
    });

    it('reloads when the route reuses the component for another property', async () => {
      miApi.get.mockResolvedValueOnce({ data: propiedad });
      const wrapper = shallowMount(component, { props: { propiedadId: 'p1' } });
      await flushPromises();
      miApi.get.mockResolvedValueOnce({
        data: { ...propiedad, id: 'p2', direccion: 'Segunda' },
      });

      await wrapper.setProps({ propiedadId: 'p2' });
      await flushPromises();
      expect(miApi.get).toHaveBeenLastCalledWith('propiedades/p2', {
        signal: expect.any(AbortSignal),
      });
      expect(wrapper.getComponent(Breadcrumb).props('items')[1].label).toBe(
        'Segunda'
      );
    });
  }
);

describe('FormularioPropiedad', () => {
  it('keeps commas in photo URLs and splits only at line boundaries', async () => {
    const wrapper = shallowMount(FormularioPropiedad);
    const fotos = wrapper
      .findAllComponents(TextArea)
      .find(
        input =>
          input.props('label') === 'PORTELIA.PROPIEDADES.FORMULARIO.FOTOS'
      );
    fotos.vm.$emit(
      'update:modelValue',
      ' https://images.example/a,w_800.jpg\r\n\nhttps://images.example/b.jpg '
    );
    miApi.post.mockResolvedValueOnce({ data: { id: 'p1' } });
    await wrapper.get('form').trigger('submit');
    await flushPromises();

    expect(miApi.post).toHaveBeenCalledWith(
      'propiedades',
      expect.objectContaining({
        fotos: [
          'https://images.example/a,w_800.jpg',
          'https://images.example/b.jpg',
        ],
      })
    );
  });

  it('resets edited values when the same component becomes a new property form', async () => {
    miApi.get.mockResolvedValueOnce({ data: propiedad });
    const wrapper = shallowMount(FormularioPropiedad, {
      props: { propiedadId: 'p1' },
    });
    await flushPromises();
    await wrapper.setProps({ propiedadId: '' });
    const direccion = wrapper
      .findAllComponents(Input)
      .find(
        input =>
          input.props('label') === 'PORTELIA.PROPIEDADES.FORMULARIO.DIRECCION'
      );

    expect(direccion.props('modelValue')).toBe('');
  });
});
