<script setup>
import { useRoute } from 'vue-router';
import { useEntradasAsesor } from '../composables/useEntradasAsesor';

const route = useRoute();
const entradas = useEntradasAsesor();

const activa = entrada =>
  route.name === entrada.to.name || entrada.activeOn?.includes(route.name);
</script>

<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-40 flex h-14 border-t border-n-weak bg-n-solid-1 pb-[env(safe-area-inset-bottom)] md:hidden"
  >
    <RouterLink
      v-for="entrada in entradas"
      :key="entrada.name"
      :to="entrada.to"
      class="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium leading-none"
      :class="activa(entrada) ? 'text-n-blue-text' : 'text-n-slate-11'"
    >
      <span class="size-5" :class="entrada.icon" />
      <span class="max-w-full truncate">{{ entrada.label }}</span>
    </RouterLink>
  </nav>
</template>
