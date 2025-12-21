// sw-push.js - Service Worker for Web Push Notifications
// This runs in the background and handles push events

const CACHE_VERSION = 'v1';

// Handle push events
self.addEventListener('push', (event) => {
    console.log('[SW Push] Push received:', event);

    let data = {
        title: 'Nexus Signal',
        body: 'You have a new notification',
        icon: '/icons/nexus.png',
        badge: '/icons/badge.png',
        data: { url: '/' }
    };

    try {
        if (event.data) {
            const payload = event.data.json();
            data = {
                title: payload.title || data.title,
                body: payload.body || payload.message || data.body,
                icon: payload.icon || data.icon,
                badge: payload.badge || data.badge,
                tag: payload.tag || 'nexus-notification',
                data: {
                    url: payload.data?.url || payload.link || '/',
                    type: payload.data?.type || payload.type,
                    timestamp: payload.data?.timestamp || Date.now(),
                    ...payload.data
                },
                actions: payload.actions || [],
                requireInteraction: payload.requireInteraction || false,
                silent: payload.silent || false,
                renotify: true, // Always notify even if same tag
                vibrate: [100, 50, 100] // Vibration pattern for mobile
            };
        }
    } catch (err) {
        console.error('[SW Push] Error parsing push data:', err);
    }

    const notificationPromise = self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        tag: data.tag,
        data: data.data,
        actions: data.actions,
        requireInteraction: data.requireInteraction,
        silent: data.silent,
        renotify: data.renotify,
        vibrate: data.vibrate
    });

    event.waitUntil(notificationPromise);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('[SW Push] Notification clicked:', event);

    event.notification.close();

    const urlToOpen = event.notification.data?.url || '/';

    // Handle action button clicks
    if (event.action) {
        console.log('[SW Push] Action clicked:', event.action);
        // Could handle specific actions here
    }

    // Focus existing window or open new one
    const promiseChain = clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    }).then((windowClients) => {
        // Check if there's already a window open
        for (const client of windowClients) {
            if (client.url.includes(self.registration.scope)) {
                // Focus and navigate existing window
                return client.focus().then(() => {
                    return client.navigate(urlToOpen);
                });
            }
        }
        // No existing window, open new one
        return clients.openWindow(urlToOpen);
    });

    event.waitUntil(promiseChain);
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
    console.log('[SW Push] Notification closed:', event.notification.data);
    // Could track notification dismissals here
});

// Handle push subscription change
self.addEventListener('pushsubscriptionchange', (event) => {
    console.log('[SW Push] Subscription changed');

    // Re-subscribe with new subscription
    const resubscribe = self.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: self.VAPID_PUBLIC_KEY
    }).then((subscription) => {
        // Send new subscription to server
        return fetch('/api/push/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ subscription })
        });
    });

    event.waitUntil(resubscribe);
});

// Install event - cache essential assets
self.addEventListener('install', (event) => {
    console.log('[SW Push] Installing...');
    // Skip waiting to activate immediately
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
    console.log('[SW Push] Activated');
    // Take control of all clients immediately
    event.waitUntil(clients.claim());
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SET_VAPID_KEY') {
        self.VAPID_PUBLIC_KEY = event.data.key;
        console.log('[SW Push] VAPID key set');
    }
});
