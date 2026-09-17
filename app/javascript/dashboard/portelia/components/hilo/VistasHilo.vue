<script setup>
defineProps({
  tabs: { type: Array, required: true },
  activeIndex: { type: Number, required: true },
});
defineEmits(['change']);
</script>

<template>
  <nav class="flex shrink-0 gap-5 overflow-x-auto border-b border-n-weak px-4">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      type="button"
      :aria-pressed="activeIndex === tab.index"
      class="min-h-11 shrink-0 border-b-2 px-1 text-sm"
      :class="
        activeIndex === tab.index
          ? 'border-n-slate-11 font-medium text-n-slate-12'
          : 'border-transparent text-n-slate-11'
      "
      @click="$emit('change', tab.index)"
    >
      {{ tab.name }}
    </button>
  </nav>
</template>
