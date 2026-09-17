<script setup>
defineProps({
  title: { type: String, required: true },
  detail: { type: String, default: '' },
  icon: { type: String, default: 'i-lucide-inbox' },
  compact: { type: Boolean, default: false },
});
</script>

<template>
  <div
    class="flex w-full flex-col items-center justify-center px-6 text-center"
    :class="
      compact
        ? 'min-h-36 gap-1.5 rounded-xl border border-dashed border-n-weak bg-n-alpha-1 py-6'
        : 'min-h-64 flex-1 gap-2 py-10'
    "
  >
    <span
      class="mb-2 flex size-12 items-center justify-center rounded-full bg-n-alpha-2 text-n-slate-11"
      aria-hidden="true"
    >
      <span class="text-xl" :class="icon" />
    </span>
    <h2 class="mb-0 text-lg font-medium text-n-slate-12">
      {{ title }}
    </h2>
    <p v-if="detail" class="mb-0 max-w-md text-sm text-n-slate-11">
      {{ detail }}
    </p>
    <div v-if="$slots.actions" class="mt-3">
      <slot name="actions" />
    </div>
  </div>
</template>
