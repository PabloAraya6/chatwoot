import { ref, nextTick } from 'vue';
import { shallowMount } from '@vue/test-utils';
import Dashboard from 'dashboard/routes/dashboard/Dashboard.vue';
import { CLASES_ASESOR } from './clasesAsesor';

vi.mock('dashboard/routes/dashboard/commands/commandbar.vue', () => ({
  default: { template: '<div />' },
}));

const activo = ref(false);
vi.mock('dashboard/portelia/composables/usePorteliaUi', () => ({
  usePorteliaUi: () => activo,
}));
vi.mock('dashboard/portelia/composables/useBarraInferior', () => ({
  useBarraInferior: () => ref(false),
}));
vi.mock('dashboard/composables/useUISettings', () => ({
  useUISettings: () => ({ uiSettings: ref({}), updateUISettings: vi.fn() }),
}));
vi.mock('dashboard/composables/useAccount', () => ({
  useAccount: () => ({ accountId: ref(6) }),
}));
vi.mock('dashboard/stores/calls', () => ({
  useCallsStore: () => ({ hasActiveCall: false, hasIncomingCall: false }),
}));

it('adds touch and hit-testing adaptations only while the Portelia account flag is enabled', async () => {
  const wrapper = shallowMount(Dashboard, {
    global: {
      mocks: { $route: { name: 'home' } },
      stubs: { RouterView: true },
    },
  });
  const stock = wrapper.get('main').attributes('class');
  expect(stock).not.toContain('pointer-events');
  activo.value = true;
  await nextTick();
  CLASES_ASESOR.flatMap(group => group.split(' ')).forEach(utility => {
    expect(wrapper.get('main').classes()).toContain(utility);
  });
  activo.value = false;
  await nextTick();
  expect(wrapper.get('main').attributes('class')).toBe(stock);
  wrapper.unmount();
});
