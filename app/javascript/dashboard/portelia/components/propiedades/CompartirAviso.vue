<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMapGetter } from 'dashboard/composables/store';
import Spinner from 'dashboard/components-next/spinner/Spinner.vue';

// El `share_target` del manifest no puede saber la cuenta: esta ruta sin cuenta recibe el
// link compartido desde el celular y lo lleva a Propiedades de la cuenta del usuario.
const route = useRoute();
const router = useRouter();
const usuario = useMapGetter('getCurrentUser');

onMounted(() =>
  router.replace({
    name: 'portelia_propiedades',
    params: { accountId: usuario.value.account_id },
    query: route.query,
  })
);
</script>

<template>
  <div class="flex items-center justify-center w-full h-full bg-n-background">
    <Spinner />
  </div>
</template>
