<script setup>
import { ref } from 'vue';
import Dialog from 'dashboard/components-next/dialog/Dialog.vue';

defineProps({ isLoading: { type: Boolean, default: false } });

const emit = defineEmits(['confirm', 'close']);

defineOptions({ inheritAttrs: false });

const dialogRef = ref(null);

defineExpose({
  open: () => dialogRef.value?.open(),
  close: () => dialogRef.value?.close(),
});
</script>

<template>
  <Dialog
    ref="dialogRef"
    v-bind="$attrs"
    :is-loading="isLoading"
    dialog-class="overflow-hidden max-h-[calc(100dvh-2rem)] max-sm:m-0 max-sm:max-h-dvh max-sm:h-dvh max-sm:max-w-full max-sm:rounded-none [&>div]:h-full [&_form]:min-h-0 [&_form]:max-h-[calc(100dvh-2rem)] [&_form]:overflow-hidden [&_form]:bg-n-solid-1 max-sm:[&_form]:h-full max-sm:[&_form]:max-h-dvh max-sm:[&_form]:rounded-none max-sm:[&_form]:p-4 max-sm:[&_form]:pt-[max(1rem,env(safe-area-inset-top))] max-sm:[&_form]:pb-[max(1rem,env(safe-area-inset-bottom))] [&_button]:min-h-11 [&_button]:min-w-11 [&_input]:min-h-11 [&_input]:text-base [&_select]:min-h-11 [&_select]:text-base [&_textarea]:text-base motion-reduce:!transition-none motion-reduce:[&_*]:!transition-none motion-reduce:[&_button]:!transform-none"
    @confirm="emit('confirm')"
    @close="emit('close')"
  >
    <div class="flex-1 min-w-0 min-h-0 overflow-y-auto overscroll-contain">
      <fieldset :disabled="isLoading" class="min-w-0 p-0 m-0 border-0">
        <slot />
      </fieldset>
    </div>
    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>
  </Dialog>
</template>
