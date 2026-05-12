self.addEventListener("push", (event) => {
  if (!event.data) return;

  const { title, body, url } = event.data.json();

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      vibrate: [200, 100, 200],
      tag: "fareed-request",
      renotify: true,
      data: { url: url || "/fareed" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        const target = event.notification.data?.url || "/fareed";
        for (const client of clientList) {
          if (client.url.includes("/fareed") && "focus" in client) {
            return client.focus();
          }
        }
        return clients.openWindow(target);
      })
  );
});
