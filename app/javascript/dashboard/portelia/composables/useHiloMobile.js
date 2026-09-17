import { computed } from 'vue';
import { useMediaQuery } from '@vueuse/core';
import { usePorteliaUi } from './usePorteliaUi';

export const useHiloMobile = () => {
  const portelia = usePorteliaUi();
  const mobile = useMediaQuery('(max-width: 767px)');
  return computed(() => portelia.value && mobile.value);
};
