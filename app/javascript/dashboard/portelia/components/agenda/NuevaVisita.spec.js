import { flushPromises, shallowMount } from '@vue/test-utils';
import Input from 'dashboard/components-next/input/Input.vue';
import Select from 'dashboard/components-next/select/Select.vue';
import Banner from 'dashboard/components-next/banner/Banner.vue';
import DialogoAsesor from '../DialogoAsesor.vue';
import miApi from '../../api/miApi';
import NuevaVisita from './NuevaVisita.vue';

vi.mock('../../api/miApi', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));
vi.mock('dashboard/composables', () => ({ useAlert: vi.fn() }));

const DialogStub = {
  props: ['disableConfirmButton'],
  methods: { open() {}, close() {} },
  template: '<div><slot /></div>',
};

it('aborts the old day, distinguishes failed slots, and only submits a current slot once', async () => {
  let rejectOld;
  let oldSignal;
  miApi.get.mockImplementation((ruta, options) => {
    if (ruta === 'propiedades')
      return Promise.resolve({ data: [{ id: 'p', estado: 'disponible' }] });
    oldSignal = options.signal;
    return new Promise((resolve, reject) => {
      rejectOld = reject;
    });
  });
  const wrapper = shallowMount(NuevaVisita, {
    props: { contactId: 12, conversationId: 42 },
    global: {
      stubs: { DialogoAsesor: DialogStub },
      renderStubDefaultSlot: true,
    },
  });
  wrapper.vm.abrir();
  await flushPromises();
  miApi.get.mockRejectedValueOnce(new Error('offline'));
  wrapper.getComponent(Input).vm.$emit('update:modelValue', '2026-10-17');
  await flushPromises();
  expect(oldSignal.aborted).toBe(true);
  rejectOld(new Error('cancelled'));
  await flushPromises();
  expect(wrapper.get('[role="alert"]').text()).toContain(
    'PORTELIA.AGENDA.NUEVA.ERROR_HUECOS'
  );
  expect(wrapper.text()).not.toContain('PORTELIA.AGENDA.NUEVA.SIN_HUECOS');
  const dialog = wrapper.getComponent(DialogoAsesor);
  dialog.vm.$emit('confirm');
  expect(miApi.post).not.toHaveBeenCalled();

  miApi.get.mockResolvedValueOnce({
    data: [{ at: '2026-10-17T12:00:00Z', etiqueta: '09:00' }],
  });
  wrapper.getComponent(Banner).vm.$emit('action');
  await flushPromises();
  const selects = wrapper.findAllComponents(Select);
  selects[0].vm.$emit('update:modelValue', 'p');
  selects[1].vm.$emit('update:modelValue', '2026-10-17T12:00:00Z');
  await flushPromises();
  let resolve;
  miApi.post.mockReturnValueOnce(
    new Promise(done => {
      resolve = done;
    })
  );
  dialog.vm.$emit('confirm');
  dialog.vm.$emit('confirm');
  expect(miApi.post).toHaveBeenCalledTimes(1);
  expect(miApi.post).toHaveBeenCalledWith(
    'visitas',
    expect.objectContaining({
      contactId: 12,
      propiedadId: 'p',
      at: '2026-10-17T12:00:00Z',
    })
  );
  resolve({ data: { id: 'v' } });
  await flushPromises();
  expect(wrapper.emitted('creada')).toHaveLength(1);
});
