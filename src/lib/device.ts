'use client';

/**
 * Get a unique device identifier
 * This creates a persistent ID for the current device/browser
 */
export function getDeviceId(): string {
  if (typeof window === 'undefined') return 'server';

  let deviceId = localStorage.getItem('barcel_device_id');
  
  if (!deviceId) {
    // Generate a unique device ID
    deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('barcel_device_id', deviceId);
  }
  
  return deviceId;
}

/**
 * Get device information
 */
export function getDeviceInfo(): {
  id: string;
  userAgent: string;
  platform: string;
  language: string;
  timezone: string;
  screenResolution: string;
} {
  if (typeof window === 'undefined') {
    return {
      id: 'server',
      userAgent: 'server',
      platform: 'server',
      language: 'en',
      timezone: 'UTC',
      screenResolution: '0x0',
    };
  }

  return {
    id: getDeviceId(),
    userAgent: navigator.userAgent,
    platform: navigator.platform || 'unknown',
    language: navigator.language || 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
  };
}

/**
 * Get a friendly device name
 */
export function getDeviceName(): string {
  if (typeof window === 'undefined') return 'Unknown Device';

  const deviceInfo = getDeviceInfo();
  const ua = deviceInfo.userAgent.toLowerCase();

  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    if (ua.includes('iphone')) return 'iPhone';
    if (ua.includes('ipad')) return 'iPad';
    if (ua.includes('android')) {
      // Try to extract device model
      const match = ua.match(/android [\d.]+; ([^)]+)/);
      if (match) return match[1];
      return 'Android Device';
    }
    return 'Mobile Device';
  }

  if (ua.includes('mac')) return 'Mac';
  if (ua.includes('windows')) return 'Windows PC';
  if (ua.includes('linux')) return 'Linux PC';

  return 'Desktop';
}

