import { shallowMount } from '@vue/test-utils';
import Button from 'dashboard/components-next/button/Button.vue';
import TarjetaVisita from './TarjetaVisita.vue';

vi.mock('dashboard/composables/useAccount', () => ({
  useAccount: () => ({ accountScopedRoute: name => ({ name }) }),
}));

const visita = estado => ({
  id: 'v1',
  estado,
  at: '2026-10-17T12:00:00Z',
  propiedadId: 'p1',
  propiedad: {},
});

const montar = estado =>
  shallowMount(TarjetaVisita, {
    props: { visita: visita(estado) },
    global: {
      renderStubDefaultSlot: true,
      stubs: { RouterLink: true },
    },
  });

const accionesDe = wrapper =>
  wrapper.findAllComponents(Button).map(boton => boton.props('label'));

it.each(['pendiente', 'confirmada'])('ofrece reprogramar desde %s', estado => {
  expect(accionesDe(montar(estado))).toContain(
    'PORTELIA.AGENDA.ACCION.reprogramada'
  );
});

it.each(['realizada', 'cancelada', 'no_se_presento', 'reprogramada'])(
  'no ofrece reprogramar desde %s',
  estado => {
    expect(accionesDe(montar(estado))).not.toContain(
      'PORTELIA.AGENDA.ACCION.reprogramada'
    );
  }
);

it('emite mover con reprogramada al tocar la acción', async () => {
  const wrapper = montar('pendiente');

  const boton = wrapper
    .findAllComponents(Button)
    .find(b => b.props('label') === 'PORTELIA.AGENDA.ACCION.reprogramada');
  await boton.vm.$emit('click');

  expect(wrapper.emitted('mover')).toEqual([['reprogramada']]);
});
