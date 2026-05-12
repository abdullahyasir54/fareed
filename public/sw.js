self.addEventListener("push", (event) => {
  if (!event.data) return;

  let title = "New Request";
  let body = "";
  let url = "/fareed";

  try {
    const data = event.data.json();
    title = data.title ?? title;
    body = data.body ?? body;
    url = data.url ?? url;
  } catch {
    body = event.data.text();
  }

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      vibrate: [200, 100, 200],
      tag: "fareed-request",
      renotify: true,
      data: { url },
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
