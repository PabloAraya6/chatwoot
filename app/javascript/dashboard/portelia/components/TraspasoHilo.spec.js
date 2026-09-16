import { flushPromises, shallowMount } from '@vue/test-utils';
import { useAlert } from 'dashboard/composables';
import Button from 'dashboard/components-next/button/Button.vue';
import ConversationApi from 'dashboard/api/inbox/conversation';
import miApi from '../api/miApi';
import TraspasoHilo from './TraspasoHilo.vue';

const { dispatch } = vi.hoisted(() => ({ dispatch: vi.fn() }));
vi.mock('vuex', () => ({ useStore: () => ({ dispatch }) }));
vi.mock('dashboard/composables/store', () => ({
  useMapGetter: () => ({ value: 7 }),
}));
vi.mock('dashboard/composables', () => ({ useAlert: vi.fn() }));
vi.mock('dashboard/api/inbox/conversation', () => ({
  default: { assignAgent: vi.fn() },
}));
vi.mock('../api/miApi', () => ({ default: { get: vi.fn(), post: vi.fn() } }));

describe('TraspasoHilo', () => {
  beforeEach(() => {
    miApi.get.mockResolvedValue({
      data: { estado: 'secretaria', modo: 'siempre' },
    });
  });

  it('reports a failed assignment and permits retry without duplicate requests', async () => {
    let rejectAssignment;
    ConversationApi.assignAgent.mockReturnValueOnce(
      new Promise((resolve, reject) => {
        rejectAssignment = reject;
      })
    );
    const wrapper = shallowMount(TraspasoHilo, {
      props: { chat: { id: 42, messages: [] } },
    });
    const tomar = wrapper.getComponent(Button);
    tomar.vm.$emit('click');
    tomar.vm.$emit('click');
    await flushPromises();

    expect(ConversationApi.assignAgent).toHaveBeenCalledTimes(1);
    expect(tomar.attributes('disabled')).toBeDefined();
    rejectAssignment(new Error('offline'));
    await flushPromises();
    expect(useAlert).toHaveBeenCalledWith('PORTELIA.HILO.TOMAR_ERROR');
    expect(dispatch).not.toHaveBeenCalled();

    ConversationApi.assignAgent.mockResolvedValueOnce({ data: { id: 7 } });
    tomar.vm.$emit('click');
    await flushPromises();
    expect(dispatch).toHaveBeenCalledWith('setCurrentChatAssignee', {
      conversationId: 42,
      assignee: { id: 7 },
    });
  });

  it('does not carry the previous conversation secretary state into a failed read', async () => {
    miApi.get.mockResolvedValueOnce({
      data: { estado: 'humano', modo: 'siempre' },
    });
    const wrapper = shallowMount(TraspasoHilo, {
      props: { chat: { id: 1, messages: [] } },
      global: { renderStubDefaultSlot: true },
    });
    await flushPromises();
    expect(wrapper.text()).toContain('PORTELIA.HILO.CALLA');

    miApi.get.mockRejectedValueOnce(new Error('offline'));
    await wrapper.setProps({ chat: { id: 2, messages: [] } });
    await flushPromises();
    expect(wrapper.text()).not.toContain('PORTELIA.HILO.CALLA');
    expect(wrapper.get('[role="alert"]').text()).toContain(
      'PORTELIA.HILO.ESTADO_ERROR'
    );
  });
});
