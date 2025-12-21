// src/hooks/usePushNotifications.js - Web Push Notifications Hook
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// Convert base64 string to Uint8Array for applicationServerKey
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function usePushNotifications() {
    const { api, isAuthenticated } = useAuth();
    const toast = useToast();

    const [isSupported, setIsSupported] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [permission, setPermission] = useState('default');
    const [subscription, setSubscription] = useState(null);
    const [preferences, setPreferences] = useState(null);
    const [vapidKey, setVapidKey] = useState(null);
    const [error, setError] = useState(null);

    // Check browser support
    useEffect(() => {
        const supported = 'serviceWorker' in navigator &&
                         'PushManager' in window &&
                         'Notification' in window;
        setIsSupported(supported);

        if (supported) {
            setPermission(Notification.permission);
        }
    }, []);

    // Fetch VAPID key and check subscription status
    useEffect(() => {
        if (!isSupported || !isAuthenticated) {
            setIsLoading(false);
            return;
        }

        const initializePush = async () => {
            try {
                // Get VAPID public key from server
                const vapidResponse = await api.get('/push/vapid-key');
                if (!vapidResponse.data.available) {
                    setIsLoading(false);
                    return;
                }
                setVapidKey(vapidResponse.data.publicKey);

                // Check existing subscription
                const registration = await navigator.serviceWorker.ready;
                const existingSubscription = await registration.pushManager.getSubscription();

                if (existingSubscription) {
                    setSubscription(existingSubscription);
                    setIsSubscribed(true);

                    // Get preferences from server
                    const subsResponse = await api.get('/push/subscriptions');
                    if (subsResponse.data.subscriptions?.length > 0) {
                        setPreferences(subsResponse.data.subscriptions[0].preferences);
                    }
                }
            } catch (err) {
                console.error('[Push] Initialization error:', err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        initializePush();
    }, [isSupported, isAuthenticated, api]);

    // Register service worker
    const registerServiceWorker = useCallback(async () => {
        if (!isSupported) return null;

        try {
            const registration = await navigator.serviceWorker.register('/sw-push.js', {
                scope: '/'
            });
            console.log('[Push] Service worker registered:', registration.scope);

            // Send VAPID key to service worker
            if (vapidKey && registration.active) {
                registration.active.postMessage({
                    type: 'SET_VAPID_KEY',
                    key: vapidKey
                });
            }

            return registration;
        } catch (err) {
            console.error('[Push] Service worker registration failed:', err);
            throw err;
        }
    }, [isSupported, vapidKey]);

    // Request notification permission
    const requestPermission = useCallback(async () => {
        if (!isSupported) {
            toast.error('Push notifications are not supported in this browser');
            return false;
        }

        try {
            const result = await Notification.requestPermission();
            setPermission(result);

            if (result === 'granted') {
                toast.success('Notifications enabled!');
                return true;
            } else if (result === 'denied') {
                toast.error('Notification permission denied. Check browser settings.');
                return false;
            }
            return false;
        } catch (err) {
            console.error('[Push] Permission request failed:', err);
            toast.error('Failed to request notification permission');
            return false;
        }
    }, [isSupported, toast]);

    // Subscribe to push notifications
    const subscribe = useCallback(async () => {
        if (!isSupported || !vapidKey) {
            toast.error('Push notifications not available');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Request permission if needed
            if (Notification.permission !== 'granted') {
                const granted = await requestPermission();
                if (!granted) {
                    setIsLoading(false);
                    return false;
                }
            }

            // Register service worker
            const registration = await registerServiceWorker();
            if (!registration) {
                throw new Error('Failed to register service worker');
            }

            // Subscribe to push
            const pushSubscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidKey)
            });

            // Send subscription to server
            const response = await api.post('/push/subscribe', {
                subscription: pushSubscription.toJSON()
            });

            setSubscription(pushSubscription);
            setIsSubscribed(true);
            setPreferences(response.data.subscription?.preferences);

            toast.success('Push notifications enabled!');
            return true;
        } catch (err) {
            console.error('[Push] Subscribe error:', err);
            setError(err.message);
            toast.error('Failed to enable push notifications');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [isSupported, vapidKey, requestPermission, registerServiceWorker, api, toast]);

    // Unsubscribe from push notifications
    const unsubscribe = useCallback(async () => {
        if (!subscription) return false;

        setIsLoading(true);
        setError(null);

        try {
            // Unsubscribe from browser
            await subscription.unsubscribe();

            // Remove from server
            await api.post('/push/unsubscribe', {
                endpoint: subscription.endpoint
            });

            setSubscription(null);
            setIsSubscribed(false);
            setPreferences(null);

            toast.success('Push notifications disabled');
            return true;
        } catch (err) {
            console.error('[Push] Unsubscribe error:', err);
            setError(err.message);
            toast.error('Failed to disable push notifications');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [subscription, api, toast]);

    // Update notification preferences
    const updatePreferences = useCallback(async (newPreferences) => {
        setIsLoading(true);
        setError(null);

        try {
            await api.put('/push/preferences', { preferences: newPreferences });
            setPreferences(prev => ({ ...prev, ...newPreferences }));
            toast.success('Notification preferences updated');
            return true;
        } catch (err) {
            console.error('[Push] Update preferences error:', err);
            setError(err.message);
            toast.error('Failed to update preferences');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [api, toast]);

    // Send test notification
    const sendTestNotification = useCallback(async () => {
        if (!isSubscribed) {
            toast.info('Enable push notifications first');
            return false;
        }

        try {
            await api.post('/push/test');
            toast.success('Test notification sent!');
            return true;
        } catch (err) {
            console.error('[Push] Test notification error:', err);
            toast.error('Failed to send test notification');
            return false;
        }
    }, [isSubscribed, api, toast]);

    return {
        // State
        isSupported,
        isSubscribed,
        isLoading,
        permission,
        preferences,
        error,

        // Actions
        subscribe,
        unsubscribe,
        requestPermission,
        updatePreferences,
        sendTestNotification
    };
}

export default usePushNotifications;
