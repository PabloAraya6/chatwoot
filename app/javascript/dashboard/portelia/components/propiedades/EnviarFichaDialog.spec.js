import { flushPromises, shallowMount } from '@vue/test-utils';
import ConversationApi from 'dashboard/api/inbox/conversation';
import Banner from 'dashboard/components-next/banner/Banner.vue';
import Dialog from '../DialogoAsesor.vue';
import Select from 'dashboard/components-next/select/Select.vue';
import miApi from '../../api/miApi';
import EnviarFichaDialog from './EnviarFichaDialog.vue';

vi.mock('../../api/miApi', () => ({ default: { post: vi.fn() } }));
vi.mock('dashboard/composables', () => ({ useAlert: vi.fn() }));
vi.mock('dashboard/api/inbox/conversation', () => ({
  default: { get: vi.fn() },
}));

const DialogStub = {
  props: ['disableConfirmButton'],
  methods: { open: vi.fn(), close: vi.fn() },
  template: '<div><slot /></div>',
};

describe('EnviarFichaDialog', () => {
  it('distinguishes a failed list from an empty one and does not send a query ID blindly', async () => {
    ConversationApi.get.mockRejectedValueOnce(new Error('offline'));
    const wrapper = shallowMount(EnviarFichaDialog, {
      props: { propiedadId: 'p' },
      global: {
        stubs: { DialogoAsesor: DialogStub },
        renderStubDefaultSlot: true,
      },
    });
    wrapper.vm.abrir('999');
    await flushPromises();

    expect(wrapper.get('[role="alert"]').text()).toContain(
      'PORTELIA.PROPIEDADES.ENVIAR.ERROR_CARGA'
    );
    expect(wrapper.text()).not.toContain(
      'PORTELIA.PROPIEDADES.ENVIAR.SIN_CONVERSACIONES'
    );
    wrapper.getComponent(Dialog).vm.$emit('confirm');
    expect(miApi.post).not.toHaveBeenCalled();

    ConversationApi.get.mockResolvedValueOnce({
      data: { data: { payload: [], meta: { mine_count: 0 } } },
    });
    wrapper.getComponent(Banner).vm.$emit('action');
    await flushPromises();
    expect(wrapper.text()).toContain(
      'PORTELIA.PROPIEDADES.ENVIAR.SIN_CONVERSACIONES'
    );
    expect(wrapper.getComponent(Dialog).props('disableConfirmButton')).toBe(
      true
    );
  });

  it('loads all 200 assigned conversations and labels audio-only threads without requiring text', async () => {
    ConversationApi.get.mockImplementation(({ page }) =>
      Promise.resolve({
        data: {
          data: {
            meta: { mine_count: 200 },
            payload: Array.from({ length: 25 }, (_, index) => ({
              id: (page - 1) * 25 + index + 1,
              meta: { sender: { name: 'Persona con audio' } },
              last_non_activity_message: {
                content: null,
                attachments: [{ file_type: 'audio' }],
              },
            })),
          },
        },
      })
    );
    const wrapper = shallowMount(EnviarFichaDialog, {
      props: { propiedadId: 'p' },
      global: { stubs: { DialogoAsesor: DialogStub } },
    });
    wrapper.vm.abrir('200');
    await flushPromises();

    expect(ConversationApi.get).toHaveBeenCalledTimes(8);
    expect(wrapper.getComponent(Select).props('options')).toHaveLength(200);
    expect(wrapper.getComponent(Select).props('options')[199]).toEqual({
      value: '200',
      label: 'Persona con audio',
    });
    expect(wrapper.getComponent(Dialog).props('disableConfirmButton')).toBe(
      false
    );

    let resolveSend;
    miApi.post.mockReturnValueOnce(
      new Promise(resolve => {
        resolveSend = resolve;
      })
    );
    wrapper.getComponent(Dialog).vm.$emit('confirm');
    wrapper.getComponent(Dialog).vm.$emit('confirm');
    expect(miApi.post).toHaveBeenCalledTimes(1);
    expect(miApi.post).toHaveBeenCalledWith('propiedades/p/enviar', {
      conversationId: 200,
    });
    resolveSend({ data: { conFoto: false } });
    await flushPromises();
  });
});
