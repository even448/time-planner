// Utility functions for the app

export function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}小时 ${minutes}分钟`;
  }
  if (minutes > 0) {
    return `${minutes}分钟 ${secs}秒`;
  }
  return `${secs}秒`;
}

export function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return Promise.resolve('denied');
  }
  
  if (Notification.permission === 'granted') {
    return Promise.resolve('granted');
  }
  
  if (Notification.permission !== 'denied') {
    return Notification.requestPermission();
  }
  
  return Promise.resolve('denied');
}

export function showNotification(title: string, options?: NotificationOptions): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }
  
  new Notification(title, {
    icon: 'https://cdn-icons-png.flaticon.com/512/2921/2921226.png',
    badge: 'https://cdn-icons-png.flaticon.com/512/2921/2921226.png',
    ...options,
  });
}
