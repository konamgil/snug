'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { X, Loader2, CheckCircle, Mail } from 'lucide-react';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  type: 'SIGNUP' | 'RESET_PASSWORD' | 'FIND_ID';
  onVerified: () => void;
}

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function EmailVerificationModal({
  isOpen,
  onClose,
  email,
  type,
  onVerified,
}: EmailVerificationModalProps) {
  const t = useTranslations('auth.emailVerification');
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [hasSentInitialOTP, setHasSentInitialOTP] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Send OTP when modal opens
  useEffect(() => {
    if (isOpen && !hasSentInitialOTP) {
      handleSendOTP();
      setHasSentInitialOTP(true);
    }
  }, [isOpen, hasSentInitialOTP]);

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen && !isLoading && !isSending) {
      inputRefs.current[0]?.focus();
    }
  }, [isOpen, isLoading, isSending]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  // Cleanup on close
  useEffect(() => {
    if (!isOpen) {
      setOtp(Array(OTP_LENGTH).fill(''));
      setError('');
      setIsVerified(false);
      setHasSentInitialOTP(false);
    }
  }, [isOpen]);

  const handleSendOTP = async () => {
    setIsSending(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResendTimer(RESEND_COOLDOWN);
      } else {
        setError(data.message || t('sendError'));
      }
    } catch {
      setError(t('sendError'));
    }

    setIsSending(false);
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setOtp(Array(OTP_LENGTH).fill(''));
    inputRefs.current[0]?.focus();
    await handleSendOTP();
  };

  const handleInputChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];

    // Handle paste
    if (value.length > 1) {
      const digits = value.slice(0, OTP_LENGTH - index).split('');
      digits.forEach((digit, i) => {
        if (index + i < OTP_LENGTH) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);

      // Focus on next empty input or last input
      const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
    } else {
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }

    setError('');
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = useCallback(async () => {
    const code = otp.join('');
    if (code.length !== OTP_LENGTH) {
      setError(t('enterFullCode'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, type }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsVerified(true);
        // Small delay to show success state before closing
        setTimeout(() => {
          onVerified();
          onClose();
        }, 1000);
      } else {
        setError(data.message || t('verifyError'));
        setOtp(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError(t('verifyError'));
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    }

    setIsLoading(false);
  }, [otp, email, type, onVerified, onClose, t]);

  // Auto-verify when all digits are entered
  useEffect(() => {
    if (otp.every((digit) => digit !== '') && !isLoading && !isVerified) {
      handleVerify();
    }
  }, [otp, isLoading, isVerified, handleVerify]);

  if (!isOpen) return null;

  // Mask email for display (a***@example.com)
  const parts = email.split('@');
  const localPart = parts[0] ?? '';
  const domain = parts[1] ?? '';
  const maskedEmail =
    localPart.length > 2
      ? `${localPart.charAt(0)}${'*'.repeat(Math.min(localPart.length - 1, 4))}@${domain}`
      : email;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-[400px] bg-white rounded-2xl p-5 sm:p-6 shadow-xl mx-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-[hsl(var(--snug-gray))] hover:text-[hsl(var(--snug-text-primary))] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Email Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-[hsl(var(--snug-orange))]/10 flex items-center justify-center">
            <Mail className="w-8 h-8 text-[hsl(var(--snug-orange))]" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-[hsl(var(--snug-text-primary))] text-center mb-2">
          {t('title')}
        </h2>

        {/* Description */}
        <p className="text-sm text-[hsl(var(--snug-gray))] text-center mb-6">
          {t('sentTo', { email: maskedEmail })}
        </p>

        {/* OTP Inputs */}
        <div className="flex justify-center gap-1.5 sm:gap-2 mb-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={OTP_LENGTH}
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={isLoading || isVerified}
              className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-semibold border rounded-xl transition-all
                ${
                  isVerified
                    ? 'border-green-500 bg-green-50 text-green-600'
                    : error
                      ? 'border-red-400 bg-red-50'
                      : 'border-[hsl(var(--snug-border))] focus:border-[hsl(var(--snug-orange))] focus:ring-2 focus:ring-[hsl(var(--snug-orange))]/20'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && <p className="text-sm text-red-500 text-center mb-4">{error}</p>}

        {/* Success Message */}
        {isVerified && (
          <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{t('verified')}</span>
          </div>
        )}

        {/* Resend Button */}
        <div className="text-center mb-6">
          {isSending ? (
            <span className="text-sm text-[hsl(var(--snug-gray))] flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('sending')}
            </span>
          ) : resendTimer > 0 ? (
            <span className="text-sm text-[hsl(var(--snug-gray))]">
              {t('resendIn', { seconds: resendTimer })}
            </span>
          ) : (
            <button
              onClick={handleResendOTP}
              disabled={isVerified}
              className="text-sm text-[hsl(var(--snug-orange))] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('resend')}
            </button>
          )}
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={isLoading || isVerified || otp.some((d) => !d)}
          className="w-full py-3 bg-[hsl(var(--snug-orange))] text-white text-sm font-medium rounded-full hover:bg-[hsl(var(--snug-orange))]/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isVerified ? t('verified') : t('verify')}
        </button>
      </div>
    </div>
  );
}
