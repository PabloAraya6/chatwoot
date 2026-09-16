import { flushPromises, mount } from '@vue/test-utils';
import CampoBusqueda from './CampoBusqueda.vue';

it('shows zero and unknown separately and exposes a keyboard-operable correction', async () => {
  const wrapper = mount(CampoBusqueda, {
    props: {
      busqueda: { dormitoriosMin: 0 },
      definicion: { campo: 'dormitoriosMin', tipo: 'number' },
      guardar: vi.fn(),
    },
    attachTo: document.body,
  });
  expect(wrapper.get('button').text()).toBe('0');
  await wrapper.get('button').trigger('click');
  expect(document.activeElement).toBe(wrapper.get('input').element);
  expect(wrapper.get('input').element.value).toBe('0');
  await wrapper.get('form').trigger('keydown', { key: 'Escape' });
  expect(wrapper.find('form').exists()).toBe(false);
  expect(document.activeElement).toBe(wrapper.get('button').element);
  wrapper.unmount();
});

it('keeps a failed correction editable, prevents double writes and closes only after success', async () => {
  let reject;
  const guardar = vi.fn().mockReturnValueOnce(
    new Promise((resolve, fail) => {
      reject = fail;
    })
  );
  const wrapper = mount(CampoBusqueda, {
    props: {
      busqueda: { zona: 'Capital' },
      definicion: { campo: 'zona', tipo: 'text' },
      guardar,
    },
  });
  await wrapper.get('button').trigger('click');
  await wrapper.get('input').setValue('Rivadavia');
  await wrapper.get('form').trigger('submit');
  await wrapper.get('form').trigger('submit');
  expect(guardar).toHaveBeenCalledTimes(1);
  reject(new Error('offline'));
  await flushPromises();
  expect(wrapper.get('[role="alert"]').text()).toBe(
    'PORTELIA.FICHA.ERROR_GUARDAR'
  );
  expect(wrapper.get('input').element.value).toBe('Rivadavia');
  guardar.mockResolvedValueOnce({});
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(guardar).toHaveBeenLastCalledWith('Rivadavia');
  expect(wrapper.find('form').exists()).toBe(false);
  wrapper.unmount();
});

it('does not turn a missing garage answer into false and sends a deliberate No as boolean', async () => {
  const guardar = vi.fn().mockResolvedValue({});
  const wrapper = mount(CampoBusqueda, {
    props: {
      busqueda: {},
      definicion: { campo: 'cochera', tipo: 'checkbox' },
      guardar,
    },
  });
  expect(wrapper.get('button').text()).toBe('PORTELIA.FICHA.SIN_DATO');
  await wrapper.get('button').trigger('click');
  expect(wrapper.get('select').element.value).toBe('');
  await wrapper.get('select').setValue('false');
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(guardar).toHaveBeenCalledWith(false);
  wrapper.unmount();
});
