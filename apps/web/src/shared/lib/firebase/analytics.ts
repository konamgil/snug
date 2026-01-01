import {
  getAnalytics,
  logEvent as firebaseLogEvent,
  setUserId,
  setUserProperties,
  type Analytics,
} from 'firebase/analytics';
import { getFirebaseApp } from './config';

let analytics: Analytics | null = null;

// Initialize Analytics (lazy initialization)
export function getFirebaseAnalytics(): Analytics | null {
  if (typeof window === 'undefined') return null;

  if (!analytics) {
    try {
      const app = getFirebaseApp();
      analytics = getAnalytics(app);
    } catch (error) {
      console.error('Failed to initialize Firebase Analytics:', error);
      return null;
    }
  }

  return analytics;
}

// Generic event logging
export function logEvent(eventName: string, params?: Record<string, unknown>) {
  const analyticsInstance = getFirebaseAnalytics();
  if (analyticsInstance) {
    firebaseLogEvent(analyticsInstance, eventName, params);
  }
}

// Set user ID for analytics
export function setAnalyticsUserId(userId: string | null) {
  const analyticsInstance = getFirebaseAnalytics();
  if (analyticsInstance) {
    setUserId(analyticsInstance, userId);
  }
}

// Set user properties
export function setAnalyticsUserProperties(properties: Record<string, string>) {
  const analyticsInstance = getFirebaseAnalytics();
  if (analyticsInstance) {
    setUserProperties(analyticsInstance, properties);
  }
}

// ============================================
// Snug-specific analytics events
// ============================================

// Search events
export function logSearch(params: {
  location?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}) {
  logEvent('search', {
    search_term: params.location,
    check_in: params.checkIn,
    check_out: params.checkOut,
    number_of_guests: params.guests,
  });
}

// View item (accommodation detail)
export function logViewItem(params: {
  itemId: string;
  itemName: string;
  price: number;
  location?: string;
  accommodationType?: string;
}) {
  logEvent('view_item', {
    currency: 'KRW',
    value: params.price,
    items: [
      {
        item_id: params.itemId,
        item_name: params.itemName,
        price: params.price,
        item_category: params.accommodationType,
        location_id: params.location,
      },
    ],
  });
}

// Add to wishlist (favorite)
export function logAddToWishlist(params: { itemId: string; itemName: string; price: number }) {
  logEvent('add_to_wishlist', {
    currency: 'KRW',
    value: params.price,
    items: [
      {
        item_id: params.itemId,
        item_name: params.itemName,
        price: params.price,
      },
    ],
  });
}

// Begin checkout (reservation start)
export function logBeginCheckout(params: {
  itemId: string;
  itemName: string;
  price: number;
  nights: number;
}) {
  logEvent('begin_checkout', {
    currency: 'KRW',
    value: params.price * params.nights,
    items: [
      {
        item_id: params.itemId,
        item_name: params.itemName,
        price: params.price,
        quantity: params.nights,
      },
    ],
  });
}

// Purchase complete (reservation confirmed)
export function logPurchase(params: {
  transactionId: string;
  itemId: string;
  itemName: string;
  price: number;
  nights: number;
}) {
  logEvent('purchase', {
    currency: 'KRW',
    transaction_id: params.transactionId,
    value: params.price * params.nights,
    items: [
      {
        item_id: params.itemId,
        item_name: params.itemName,
        price: params.price,
        quantity: params.nights,
      },
    ],
  });
}

// Sign up
export function logSignUp(method: string) {
  logEvent('sign_up', { method });
}

// Login
export function logLogin(method: string) {
  logEvent('login', { method });
}

// Share
export function logShare(params: { contentType: string; itemId: string; method: string }) {
  logEvent('share', {
    content_type: params.contentType,
    item_id: params.itemId,
    method: params.method,
  });
}

// Contact host
export function logContactHost(params: { itemId: string; itemName: string }) {
  logEvent('contact_host', {
    item_id: params.itemId,
    item_name: params.itemName,
  });
}

// Page view (for SPA navigation)
export function logPageView(pagePath: string, pageTitle?: string) {
  logEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle,
  });
}
