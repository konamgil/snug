import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';
import { getFirebaseAuth } from './config';

export interface PhoneVerificationResult {
  success: boolean;
  error?: string;
}

// Store confirmation result for verification
let confirmationResult: ConfirmationResult | null = null;
let recaptchaVerifier: RecaptchaVerifier | null = null;
let recaptchaWidgetId: number | null = null;

/**
 * Clear all reCAPTCHA related elements from DOM
 */
function clearRecaptchaFromDOM(): void {
  // Remove any existing grecaptcha badges
  const badges = document.querySelectorAll('.grecaptcha-badge');
  badges.forEach((badge) => badge.remove());

  // Remove any reCAPTCHA iframes
  const iframes = document.querySelectorAll('iframe[src*="recaptcha"]');
  iframes.forEach((iframe) => iframe.remove());
}

/**
 * Initialize invisible reCAPTCHA verifier
 * Must be called before sendPhoneVerification
 */
export async function initRecaptcha(containerId: string = 'recaptcha-container'): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // Clear existing verifier
  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear();
    } catch {
      // Ignore clear errors
    }
    recaptchaVerifier = null;
    recaptchaWidgetId = null;
  }

  // Check if container exists
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('reCAPTCHA container not found:', containerId);
    return false;
  }

  // Clear the container element
  container.innerHTML = '';

  try {
    const auth = getFirebaseAuth();

    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved, allow signInWithPhoneNumber
      },
      'expired-callback': () => {
        // Response expired, reset reCAPTCHA
        console.warn('reCAPTCHA expired, please try again');
        recaptchaWidgetId = null;
      },
    });

    // Pre-render the reCAPTCHA widget
    recaptchaWidgetId = await recaptchaVerifier.render();
    console.log('reCAPTCHA initialized successfully, widgetId:', recaptchaWidgetId);
    return true;
  } catch (err) {
    console.error('reCAPTCHA initialization error:', err);
    recaptchaVerifier = null;
    recaptchaWidgetId = null;
    return false;
  }
}

/**
 * Send OTP to phone number
 * @param phoneNumber Full phone number with country code (e.g., "+821012345678")
 */
export async function sendPhoneVerification(phoneNumber: string): Promise<PhoneVerificationResult> {
  try {
    if (!recaptchaVerifier) {
      return { success: false, error: 'reCAPTCHA not initialized' };
    }

    const auth = getFirebaseAuth();
    confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);

    return { success: true };
  } catch (error) {
    console.error('Phone verification error:', error);

    // Handle specific Firebase errors
    const firebaseError = error as { code?: string; message?: string };

    if (firebaseError.code === 'auth/invalid-phone-number') {
      return { success: false, error: 'Invalid phone number format' };
    }
    if (firebaseError.code === 'auth/too-many-requests') {
      return { success: false, error: 'Too many requests. Please try again later.' };
    }
    if (firebaseError.code === 'auth/quota-exceeded') {
      return { success: false, error: 'SMS quota exceeded. Please try again later.' };
    }

    return {
      success: false,
      error: firebaseError.message || 'Failed to send verification code',
    };
  }
}

/**
 * Verify the OTP code entered by user
 * @param code 6-digit verification code
 */
export async function verifyPhoneCode(code: string): Promise<PhoneVerificationResult> {
  try {
    if (!confirmationResult) {
      return { success: false, error: 'No verification in progress' };
    }

    await confirmationResult.confirm(code);

    // Clear the confirmation result after successful verification
    confirmationResult = null;

    return { success: true };
  } catch (error) {
    console.error('Code verification error:', error);

    const firebaseError = error as { code?: string; message?: string };

    if (firebaseError.code === 'auth/invalid-verification-code') {
      return { success: false, error: 'Invalid verification code' };
    }
    if (firebaseError.code === 'auth/code-expired') {
      return { success: false, error: 'Verification code expired. Please request a new one.' };
    }

    return {
      success: false,
      error: firebaseError.message || 'Failed to verify code',
    };
  }
}

/**
 * Reset the verification state
 */
export function resetVerification(): void {
  confirmationResult = null;
  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear();
    } catch {
      // Ignore clear errors
    }
    recaptchaVerifier = null;
    recaptchaWidgetId = null;
  }
  clearRecaptchaFromDOM();
}

/**
 * Format phone number to E.164 format
 * @param countryCode Country code (e.g., "+82")
 * @param phoneNumber Local phone number (e.g., "01012345678")
 */
export function formatPhoneNumber(countryCode: string, phoneNumber: string): string {
  // Remove all non-digit characters except leading +
  const cleanCountryCode = countryCode.startsWith('+') ? countryCode : `+${countryCode}`;
  const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');

  // Remove leading 0 from phone number if present (common in Korea)
  const normalizedPhone = cleanPhoneNumber.startsWith('0')
    ? cleanPhoneNumber.slice(1)
    : cleanPhoneNumber;

  return `${cleanCountryCode}${normalizedPhone}`;
}
