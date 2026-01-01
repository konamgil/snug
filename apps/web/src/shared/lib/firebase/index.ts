// Firebase Core
export { getFirebaseApp, getFirebaseAuth, firebaseConfig } from './config';

// Firebase Analytics (GA4)
export {
  getFirebaseAnalytics,
  logEvent,
  setAnalyticsUserId,
  setAnalyticsUserProperties,
  // Snug-specific events
  logSearch,
  logViewItem,
  logAddToWishlist,
  logBeginCheckout,
  logPurchase,
  logSignUp,
  logLogin,
  logShare,
  logContactHost,
  logPageView,
} from './analytics';

// Firebase Performance
export { getFirebasePerformance, initPerformance } from './performance';

// Firebase Cloud Messaging (FCM)
export {
  getFirebaseMessaging,
  requestNotificationPermission,
  getFCMToken,
  onForegroundMessage,
  handleSnugNotification,
  type SnugNotification,
} from './messaging';

// Firebase Auth (Phone Auth)
export {
  sendPhoneVerification,
  verifyPhoneCode,
  initRecaptcha,
  resetVerification,
  formatPhoneNumber,
  type PhoneVerificationResult,
} from './phone-auth';

// FCM Hook & Provider
export { useFCM } from './use-fcm';
export { FCMProvider, useFCMContext } from './fcm-provider';
