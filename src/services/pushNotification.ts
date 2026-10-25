import { storageService } from './storage';

// Helper to convert base64 VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const pushNotificationService = {
  isSupported: (): boolean => {
    return (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  },

  getPermission: (): NotificationPermission => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'denied';
    return Notification.permission;
  },

  subscribe: async (userIdentifier: string = 'guest'): Promise<boolean> => {
    if (!pushNotificationService.isSupported()) {
      throw new Error('Web Push is not supported on this browser/device.');
    }

    // 1. Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return false;
    }

    // 2. Wait for service worker
    const registration = await navigator.serviceWorker.ready;
    if (!registration) {
      throw new Error('Service Worker registration not ready.');
    }

    // 3. Get VAPID public key
    const vapidKey =
      (import.meta as any).env?.VITE_VAPID_PUBLIC_KEY ||
      'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

    try {
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });
      }

      const p256dh = subscription.getKey('p256dh');
      const auth = subscription.getKey('auth');

      if (p256dh && auth) {
        const subData = {
          user_identifier: userIdentifier,
          endpoint: subscription.endpoint,
          p256dh: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(p256dh)))),
          auth: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(auth)))),
          platform: /iPhone|iPad|iPod/i.test(navigator.userAgent)
            ? 'ios'
            : /Android/i.test(navigator.userAgent)
            ? 'android'
            : 'desktop',
        };

        // Save to Supabase and LocalStorage
        await storageService.syncPushSubscription(subData);
        localStorage.setItem('society_push_subscribed', 'true');
        return true;
      }
    } catch (err) {
      console.error('Failed to subscribe to push notifications:', err);
      throw err;
    }

    return false;
  },

  isSubscribed: async (): Promise<boolean> => {
    if (!pushNotificationService.isSupported()) return false;
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      return Boolean(sub);
    } catch {
      return false;
    }
  },

  sendPush: async (payload: {
    title: string;
    body: string;
    url?: string;
    target?: string;
  }): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/send-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const result = await res.json();
        return { success: true, message: result.message || 'Notification sent successfully.' };
      } else {
        // Fallback for local testing if running without serverless function
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(payload.title, {
            body: payload.body,
            icon: '/icon-192.png',
          });
          return { success: true, message: 'Notification delivered directly on this screen.' };
        }
        return { success: false, message: 'Server endpoint returned error.' };
      }
    } catch {
      // Local fallback
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(payload.title, {
          body: payload.body,
          icon: '/icon-192.png',
        });
        return { success: true, message: 'Notification delivered directly on this screen.' };
      }
      return { success: false, message: 'Failed to dispatch push notification.' };
    }
  },

  sendBroadcast: async (payload: { title: string; body: string; url?: string }): Promise<{ success: boolean; message: string }> => {
    return pushNotificationService.sendPush({ ...payload, target: 'all' });
  },
};
