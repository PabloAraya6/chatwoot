import { computed, inject, watch } from 'vue';
import { useMutationObserver, useResizeObserver } from '@vueuse/core';

const ALTURA_MAXIMA = 164;

export const useAlturaRespuesta = (elemento, activo) => {
  const pedirAltura = inject('requestEditorHeight', () => {});
  const objetivo = computed(() => (activo.value ? elemento.value : null));
  const ajustar = () => {
    const editor = objetivo.value?.querySelector('.ProseMirror');
    if (!editor?.firstElementChild) {
      return;
    }
    const estilo = getComputedStyle(editor);
    const alto =
      editor.lastElementChild.getBoundingClientRect().bottom -
      editor.firstElementChild.getBoundingClientRect().top +
      parseFloat(estilo.paddingTop) +
      parseFloat(estilo.paddingBottom);
    pedirAltura(Math.min(Math.ceil(alto), ALTURA_MAXIMA));
  };

  useMutationObserver(objetivo, ajustar, {
    childList: true,
    characterData: true,
    subtree: true,
  });
  useResizeObserver(objetivo, ajustar);
  watch(activo, () => pedirAltura(0));
};
