/**
 * Client-side utility helpers for Push Notifications in the PWA.
 */

// Helper to convert base64 VAPID key to UInt8Array for Supabase/Push API subscription
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Requests browser permission to show desktop/mobile push notifications.
 * @returns {Promise<NotificationPermission>} Status of the permission request
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    console.warn("Notifications not supported in this browser");
    return "denied";
  }

  const permission = await Notification.requestPermission();
  console.log("Notification permission status:", permission);
  return permission;
}

/**
 * Subscribes the current service worker registration to Push Notifications.
 * @param {string} publicVapidKey The server's public VAPID key
 * @returns {Promise<PushSubscription | null>} The active push subscription or null
 */
export async function subscribeToPush(publicVapidKey: string): Promise<PushSubscription | null> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("Push messaging is not supported in this browser environment");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check if subscription already exists
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      console.log("Found existing push notification subscription:", existingSubscription);
      return existingSubscription;
    }

    // Subscribe to push service
    const applicationServerKey = urlBase64ToUint8Array(publicVapidKey);
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey
    });

    console.log("Successfully subscribed to push notifications:", subscription);
    return subscription;
  } catch (error) {
    console.error("Failed to subscribe user to push notifications:", error);
    return null;
  }
}
