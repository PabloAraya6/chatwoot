import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAccount } from 'dashboard/composables/useAccount';

// Las cinco entradas del asesor, una sola lista para el sidebar de escritorio y la barra
// inferior del celular.
export const useEntradasAsesor = () => {
  const { t } = useI18n();
  const { accountScopedRoute } = useAccount();
  return computed(() => [
    {
      name: 'Bandeja',
      label: t('PORTELIA.SIDEBAR.BANDEJA'),
      icon: 'i-lucide-message-circle',
      to: accountScopedRoute('home'),
      activeOn: ['inbox_conversation'],
    },
    {
      name: 'Personas',
      label: t('PORTELIA.SIDEBAR.PERSONAS'),
      icon: 'i-lucide-user-round',
      to: accountScopedRoute('contacts_dashboard_index'),
      activeOn: ['contacts_edit'],
    },
    {
      name: 'Propiedades',
      label: t('PORTELIA.SIDEBAR.PROPIEDADES'),
      icon: 'i-lucide-house',
      to: accountScopedRoute('portelia_propiedades'),
      activeOn: [
        'portelia_propiedad',
        'portelia_propiedad_nueva',
        'portelia_propiedad_editar',
      ],
    },
    {
      name: 'Agenda',
      label: t('PORTELIA.SIDEBAR.AGENDA'),
      icon: 'i-lucide-calendar',
      to: accountScopedRoute('portelia_agenda'),
    },
    {
      name: 'Configuracion',
      label: t('PORTELIA.SIDEBAR.CONFIGURACION'),
      icon: 'i-lucide-settings',
      to: accountScopedRoute('portelia_configuracion'),
    },
  ]);
};
