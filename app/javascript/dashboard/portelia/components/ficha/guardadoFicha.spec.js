import { flushPromises, shallowMount } from '@vue/test-utils';
import Dialog from '../DialogoAsesor.vue';
import Select from 'dashboard/components-next/select/Select.vue';
import Input from 'dashboard/components-next/input/Input.vue';
import miApi from '../../api/miApi';
import NuevaOperacion from './NuevaOperacion.vue';
import NuevaReaccion from './NuevaReaccion.vue';

vi.mock('../../api/miApi', () => ({ default: { post: vi.fn() } }));
vi.mock('dashboard/composables', () => ({ useAlert: vi.fn() }));

const DialogStub = {
  props: ['disableConfirmButton'],
  methods: { open: vi.fn(), close: vi.fn() },
  template: '<div><slot /></div>',
};

describe.each([
  [NuevaOperacion, 'venta'],
  [NuevaReaccion, 'lo_piensa'],
])('guardado de ficha', (component, seleccion) => {
  it('rejects incomplete submissions and sends only once while saving', async () => {
    const wrapper = shallowMount(component, {
      props: { contactId: 12, propiedades: [{ id: 'p' }], visitas: [] },
      global: { stubs: { DialogoAsesor: DialogStub } },
    });
    const dialog = wrapper.getComponent(Dialog);
    dialog.vm.$emit('confirm');
    expect(miApi.post).not.toHaveBeenCalled();

    const selects = wrapper.findAllComponents(Select);
    selects[0].vm.$emit('update:modelValue', 'p');
    await flushPromises();
    selects[1].vm.$emit('update:modelValue', seleccion);
    await flushPromises();
    let rejectSave;
    miApi.post.mockReturnValueOnce(
      new Promise((resolve, reject) => {
        rejectSave = reject;
      })
    );
    dialog.vm.$emit('confirm');
    dialog.vm.$emit('confirm');
    expect(miApi.post).toHaveBeenCalledTimes(1);

    rejectSave(new Error('offline'));
    await flushPromises();
    expect(wrapper.emitted('creada')).toBeUndefined();
    miApi.post.mockResolvedValueOnce({ data: { id: 'saved' } });
    dialog.vm.$emit('confirm');
    await flushPromises();
    expect(wrapper.emitted('creada')).toEqual([[{ id: 'saved' }]]);
  });
});

it('clears operation terms when changing to a property without those values', async () => {
  const wrapper = shallowMount(NuevaOperacion, {
    props: {
      contactId: 12,
      propiedades: [
        { id: 'a', operacion: 'venta', precio: 120000, moneda: 'ARS' },
        { id: 'b', operacion: 'temporario' },
      ],
    },
    global: { stubs: { DialogoAsesor: DialogStub } },
  });
  const selects = wrapper.findAllComponents(Select);
  selects[0].vm.$emit('update:modelValue', 'a');
  await flushPromises();
  expect(wrapper.getComponent(Input).props('modelValue')).toBe(120000);

  selects[0].vm.$emit('update:modelValue', 'b');
  await flushPromises();
  expect(wrapper.getComponent(Input).props('modelValue')).toBe('');
  expect(selects[1].props('modelValue')).toBe('');
  expect(selects[2].props('modelValue')).toBe('USD');
  expect(wrapper.getComponent(Dialog).props('disableConfirmButton')).toBe(true);
});
