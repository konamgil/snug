import { Capacitor } from '@capacitor/core';

/**
 * Check if running in native environment (iOS/Android)
 */
export const isNative = () => Capacitor.isNativePlatform();

/**
 * Get current platform
 */
export const getPlatform = () => Capacitor.getPlatform() as 'web' | 'ios' | 'android';

/**
 * Check if running on iOS
 */
export const isIOS = () => Capacitor.getPlatform() === 'ios';

/**
 * Check if running on Android
 */
export const isAndroid = () => Capacitor.getPlatform() === 'android';

/**
 * Check if running on web
 */
export const isWeb = () => Capacitor.getPlatform() === 'web';
