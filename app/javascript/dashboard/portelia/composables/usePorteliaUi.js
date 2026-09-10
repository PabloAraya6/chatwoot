import { computed } from 'vue';
import { useMapGetter } from 'dashboard/composables/store';
import { FEATURE_FLAGS } from 'dashboard/featureFlags';

// El único interruptor de todo lo nuestro: con el flag apagado el dashboard es Chatwoot stock.
export const usePorteliaUi = () => {
  const accountId = useMapGetter('getCurrentAccountId');

  const isFeatureEnabledonAccount = useMapGetter(
    'accounts/isFeatureEnabledonAccount'
  );

  return computed(() =>
    isFeatureEnabledonAccount.value(accountId.value, FEATURE_FLAGS.PORTELIA_UI)
  );
};
