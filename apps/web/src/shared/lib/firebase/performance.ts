import { getPerformance, type FirebasePerformance } from 'firebase/performance';
import { getFirebaseApp } from './config';

let performance: FirebasePerformance | null = null;

// Initialize Performance Monitoring (lazy initialization)
export function getFirebasePerformance(): FirebasePerformance | null {
  if (typeof window === 'undefined') return null;

  if (!performance) {
    try {
      const app = getFirebaseApp();
      performance = getPerformance(app);
    } catch (error) {
      console.error('Failed to initialize Firebase Performance:', error);
      return null;
    }
  }

  return performance;
}

// Initialize performance monitoring
export function initPerformance() {
  return getFirebasePerformance();
}
