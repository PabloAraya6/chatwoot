<script setup>
import SidebarGroup from 'dashboard/components-next/sidebar/SidebarGroup.vue';
import { useEntradasAsesor } from '../composables/useEntradasAsesor';

const entradas = useEntradasAsesor();
</script>

<template>
  <SidebarGroup
    v-for="entrada in entradas"
    :key="entrada.name"
    v-bind="entrada"
  />
</template>
