import { flushPromises, mount, shallowMount } from '@vue/test-utils';
import DialogoAsesor from '../DialogoAsesor.vue';
import miApi from '../../api/miApi';
import Disponibilidad from './Disponibilidad.vue';

vi.mock('../../api/miApi', () => ({ default: { get: vi.fn(), put: vi.fn() } }));
vi.mock('dashboard/composables', () => ({ useAlert: vi.fn() }));

const DialogStub = {
  props: ['disableConfirmButton', 'isLoading'],
  methods: { open() {}, close() {} },
  template: '<div><slot /></div>',
};

describe('Disponibilidad', () => {
  it('never replaces availability after a pending or failed read', async () => {
    let reject;
    miApi.get.mockReturnValueOnce(
      new Promise((resolve, fail) => {
        reject = fail;
      })
    );
    const wrapper = shallowMount(Disponibilidad, {
      global: { stubs: { DialogoAsesor: DialogStub } },
    });
    wrapper.vm.abrir();
    const dialog = wrapper.getComponent(DialogoAsesor);
    dialog.vm.$emit('confirm');
    expect(miApi.put).not.toHaveBeenCalled();
    reject(new Error('offline'));
    await flushPromises();
    dialog.vm.$emit('confirm');
    expect(miApi.put).not.toHaveBeenCalled();
    expect(dialog.props('disableConfirmButton')).toBe(true);
    expect(wrapper.find('[role="alert"]').exists()).toBe(true);
  });

  it('can intentionally save an empty loaded schedule only once while pending', async () => {
    miApi.get.mockResolvedValueOnce({ data: [] });
    let resolve;
    miApi.put.mockReturnValueOnce(
      new Promise(done => {
        resolve = done;
      })
    );
    const wrapper = shallowMount(Disponibilidad, {
      global: { stubs: { DialogoAsesor: DialogStub } },
    });
    await wrapper.vm.abrir();
    const dialog = wrapper.getComponent(DialogoAsesor);
    dialog.vm.$emit('confirm');
    dialog.vm.$emit('confirm');
    expect(miApi.put).toHaveBeenCalledTimes(1);
    expect(miApi.put).toHaveBeenCalledWith('disponibilidad', { franjas: [] });
    resolve({ data: [] });
    await flushPromises();
    expect(wrapper.emitted('guardada')).toHaveLength(1);
  });
});

it('edits weekly rows without implicitly submitting the enclosing dialog form', async () => {
  miApi.get.mockResolvedValue({ data: [] });
  const wrapper = mount(Disponibilidad, {
    global: {
      stubs: {
        DialogoAsesor: {
          ...DialogStub,
          emits: ['confirm'],
          template:
            '<form @submit.prevent="$emit(\'confirm\')"><slot /></form>',
        },
      },
    },
    attachTo: document.body,
  });
  await wrapper.vm.abrir();
  const add = wrapper.get('button');
  expect(add.attributes('type')).toBe('button');
  add.element.click();
  await flushPromises();
  expect(wrapper.findAll('input')).toHaveLength(2);
  const remove = wrapper.get(
    'button[aria-label="PORTELIA.AGENDA.FRANJAS.QUITAR"]'
  );
  expect(remove.attributes('type')).toBe('button');
  remove.element.click();
  await flushPromises();
  expect(wrapper.findAll('input')).toHaveLength(0);
  expect(miApi.put).not.toHaveBeenCalled();
  wrapper.unmount();
});
