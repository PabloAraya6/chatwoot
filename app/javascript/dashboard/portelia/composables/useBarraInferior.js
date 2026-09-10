import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { usePorteliaUi } from './usePorteliaUi';

// La barra inferior reemplaza al drawer del sidebar en el celular. Se esconde adentro de un
// hilo, donde el espacio es del cuadro de respuesta. El corte por ancho lo hace CSS (md:hidden).
export const useBarraInferior = () => {
  const route = useRoute();
  const hasPorteliaUi = usePorteliaUi();
  return computed(() => hasPorteliaUi.value && !route.params.conversation_id);
};
