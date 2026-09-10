/* eslint-disable no-restricted-globals */
/* globals clients */

// Siempre se muestra algo: WebKit revoca la suscripción si un push no termina en notificación.
self.addEventListener('push', event => {
  let datos = {};

  try {
    datos = event.data.json();
  } catch {
    datos = {};
  }

  event.waitUntil(
    self.registration.showNotification(datos.title || 'Portelia', {
      body: datos.body,
      tag: datos.tag,
      icon: '/android-icon-192x192.png',
      badge: '/android-icon-96x96.png',
      data: { url: datos.url || '/app' },
    })
  );
});

// Con la PWA parada en la lista ninguna ventana tiene la URL exacta del hilo: se enfoca la que
// haya y se navega, y sólo si no hay ninguna se abre una nueva.
self.addEventListener('notificationclick', event => {
  const { url } = event.notification.data;
  event.notification.close();

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(ventanas => {
        const ventana = ventanas[0];

        if (ventana)
          return ventana.focus().then(enfocada => enfocada.navigate(url));

        return clients.openWindow(url);
      })
  );
});
