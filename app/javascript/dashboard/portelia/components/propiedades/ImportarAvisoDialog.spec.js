import { mount, flushPromises } from '@vue/test-utils';
import ImportarAvisoDialog from './ImportarAvisoDialog.vue';
import miApi from '../../api/miApi';
vi.mock('../../api/miApi', () => ({ default: { post: vi.fn() } }));
vi.mock('dashboard/composables/store', () => ({
  useMapGetter: () => ({ value: false }),
}));

it('has a single native form and reports a failed import without losing its URL', async () => {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute('open');
  };
  miApi.post.mockRejectedValueOnce(new Error('offline'));
  const wrapper = mount(ImportarAvisoDialog);
  wrapper.vm.abrir();
  await flushPromises();
  const dialog = document.querySelector('dialog[open]');
  expect(dialog.querySelectorAll('form')).toHaveLength(1);
  const input = dialog.querySelector('input');
  input.value = 'https://example.com/aviso';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  await flushPromises();
  dialog
    .querySelector('form')
    .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  await flushPromises();
  expect(miApi.post).toHaveBeenCalledTimes(1);
  expect(input.value).toBe('https://example.com/aviso');
  expect(dialog.textContent).toContain('PORTELIA.PROPIEDADES.IMPORTAR.ERROR');
  wrapper.unmount();
});
