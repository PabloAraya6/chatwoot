import { mount } from '@vue/test-utils';
import Dialog from 'dashboard/components-next/dialog/Dialog.vue';
import DialogoAsesor from './DialogoAsesor.vue';

vi.mock('dashboard/composables/store', () => ({
  useMapGetter: () => ({ value: false }),
}));

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute('open');
  };
});

afterEach(() => {
  document.body.innerHTML = '';
});

it('keeps upstream dialog layout unchanged when the opt-in class is absent', () => {
  const wrapper = mount(Dialog, { props: { title: 'Stock' } });
  const dialog = document.querySelector('dialog');
  expect(dialog.classList.contains('max-w-lg')).toBe(true);
  expect(dialog.className).not.toContain('max-sm:');
  wrapper.unmount();
});

it('adapts the upstream modal and forwards its submit and close events without nesting forms', async () => {
  const wrapper = mount(DialogoAsesor, {
    attrs: { title: 'Visita', confirmButtonLabel: 'Guardar' },
    slots: { default: '<input aria-label="Persona" />' },
  });
  wrapper.vm.open();
  await wrapper.vm.$nextTick();
  const dialog = document.querySelector('dialog');
  expect(dialog.className).toContain('max-sm:h-dvh');
  expect(dialog.querySelectorAll('form')).toHaveLength(1);
  expect(dialog.querySelector('input')).not.toBeNull();
  dialog
    .querySelector('form')
    .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  await wrapper.vm.$nextTick();
  expect(wrapper.emitted('confirm')).toHaveLength(1);
  wrapper.vm.close();
  expect(dialog.hasAttribute('open')).toBe(false);
  expect(wrapper.emitted('close')).toHaveLength(1);
  wrapper.unmount();
});

it('keeps in-flight dialog inputs disabled until the request settles', async () => {
  const wrapper = mount(DialogoAsesor, {
    props: { isLoading: true },
    slots: { default: '<input aria-label="Persona" />' },
  });
  wrapper.vm.open();
  await wrapper.vm.$nextTick();
  const fieldset = document.querySelector('dialog fieldset');
  expect(fieldset.disabled).toBe(true);
  await wrapper.setProps({ isLoading: false });
  expect(fieldset.disabled).toBe(false);
  wrapper.unmount();
});
