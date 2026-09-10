<script setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Banner from 'dashboard/components-next/banner/Banner.vue';
import {
  sendRegistrationToServer,
  verifyServiceWorkerExistence,
} from 'dashboard/helper/pushHelper';

// El permiso de push sólo se puede pedir desde un gesto (Chrome y WebKit lo exigen), así que
// la Bandeja lo ofrece con un botón hasta que este browser tenga la suscripción o el asesor
// lo haya negado. `subscribe` pide el permiso solo: sin `requestPermission` antes, que en el
// iPhone puede dejar al `subscribe` fuera del gesto.
const { t } = useI18n();

const visible = ref(false);

const puedePedir = () =>
  'Notification' in window &&
  Notification.permission !== 'denied' &&
  Boolean(window.chatwootConfig?.vapidPublicKey);

onMounted(() => {
  if (!puedePedir()) return;
  verifyServiceWorkerExistence(registration =>
    registration.pushManager.getSubscription().then(suscripcion => {
      visible.value = !suscripcion;
    })
  );
});

const activar = async () => {
  try {
    const registration = await navigator.serviceWorker.ready;

    const suscripcion = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: window.chatwootConfig.vapidPublicKey,
    });

    await sendRegistrationToServer(suscripcion);
    visible.value = false;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('AvisoPush: no se pudo suscribir', error);
    visible.value = puedePedir();
  }
};
</script>

<template>
  <div v-if="visible" class="px-3 pb-2">
    <Banner
      color="blue"
      :action-label="t('PORTELIA.PUSH.ACTIVAR')"
      @action="activar"
    >
      {{ t('PORTELIA.PUSH.AVISO') }}
    </Banner>
  </div>
</template>
