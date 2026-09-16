import { shallowMount } from '@vue/test-utils';
import TextArea from 'dashboard/components-next/textarea/TextArea.vue';
import DialogoAsesor from '../DialogoAsesor.vue';
import CancelarVisita from './CancelarVisita.vue';

it('keeps the reason and enables retry when the parent request fails', async () => {
  const wrapper = shallowMount(CancelarVisita, {
    global: {
      stubs: {
        DialogoAsesor: {
          props: ['isLoading'],
          methods: { open() {}, close() {} },
          template: '<div><slot /></div>',
        },
      },
    },
  });
  wrapper.vm.abrir();
  const dialog = wrapper.getComponent(DialogoAsesor);
  dialog.vm.$emit('confirm');
  expect(wrapper.emitted('cancelar')).toBeUndefined();
  wrapper
    .getComponent(TextArea)
    .vm.$emit('update:modelValue', '  El cliente no puede  ');
  await wrapper.vm.$nextTick();
  dialog.vm.$emit('confirm');
  await wrapper.setProps({ guardando: true });
  dialog.vm.$emit('confirm');
  expect(wrapper.emitted('cancelar')).toEqual([['El cliente no puede']]);
  await wrapper.setProps({ guardando: false });
  expect(wrapper.getComponent(TextArea).props('modelValue')).toBe(
    '  El cliente no puede  '
  );
  expect(dialog.props('isLoading')).toBe(false);
  dialog.vm.$emit('confirm');
  expect(wrapper.emitted('cancelar')).toHaveLength(2);
});
