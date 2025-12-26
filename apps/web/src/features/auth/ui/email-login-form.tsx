'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff, X, Loader2 } from 'lucide-react';
import { Link, useRouter } from '@/i18n/navigation';
import { useAuthStore } from '@/shared/stores';

export function EmailLoginForm() {
  const t = useTranslations('auth.login');
  const router = useRouter();
  const signInWithEmail = useAuthStore((state) => state.signInWithEmail);
  const _isLoading = useAuthStore((state) => state.isLoading);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [staySignedIn, setStaySignedIn] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const { error } = await signInWithEmail(email, password);

    if (error) {
      setError(t('incorrectCredentials'));
      setIsSubmitting(false);
    } else {
      router.push('/');
    }
  };

  const clearPassword = () => {
    setPassword('');
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Email Input */}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t('emailAddress')}
        className="w-full px-5 py-3 border border-[hsl(var(--snug-border))] rounded-full text-sm text-[hsl(var(--snug-text-primary))] placeholder:text-[hsl(var(--snug-gray))] focus:outline-none focus:border-[hsl(var(--snug-orange))] transition-colors"
      />

      {/* Password Input */}
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError('');
          }}
          placeholder={t('password')}
          className="w-full px-5 py-3 pr-20 border border-[hsl(var(--snug-border))] rounded-full text-sm text-[hsl(var(--snug-text-primary))] placeholder:text-[hsl(var(--snug-gray))] focus:outline-none focus:border-[hsl(var(--snug-orange))] transition-colors"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="p-1 text-[hsl(var(--snug-gray))] hover:text-[hsl(var(--snug-text-primary))] transition-colors"
          >
            {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
          {password && (
            <button
              type="button"
              onClick={clearPassword}
              className="p-1 text-[hsl(var(--snug-gray))] hover:text-[hsl(var(--snug-text-primary))] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && <p className="text-sm text-red-500 px-1">{error}</p>}

      {/* Stay Signed In Checkbox */}
      <label className="flex items-center gap-3 cursor-pointer py-1">
        <div className="relative">
          <input
            type="checkbox"
            checked={staySignedIn}
            onChange={(e) => setStaySignedIn(e.target.checked)}
            className="peer sr-only"
          />
          <div className="w-5 h-5 border-2 border-[hsl(var(--snug-border))] rounded peer-checked:bg-[hsl(var(--snug-text-primary))] peer-checked:border-[hsl(var(--snug-text-primary))] transition-colors" />
          <svg
            className="absolute top-0.5 left-0.5 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span className="text-sm text-[hsl(var(--snug-text-primary))]">{t('staySignedIn')}</span>
      </label>

      {/* Continue Button */}
      <button
        type="submit"
        disabled={isSubmitting || !email || !password}
        className="w-full py-3 bg-[hsl(var(--snug-orange))] text-white text-sm font-medium rounded-full hover:bg-[hsl(var(--snug-orange))]/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
        {t('continue')}
      </button>

      {/* Sign Up Button */}
      <Link
        href="/signup"
        className="block w-full py-3 border border-[hsl(var(--snug-border))] text-center text-sm font-medium text-[hsl(var(--snug-text-primary))] rounded-full hover:bg-[hsl(var(--snug-light-gray))] hover:border-[hsl(var(--snug-gray))] active:bg-[hsl(var(--snug-border))] active:scale-[0.98] transition-all"
      >
        {t('signUp')}
      </Link>
    </form>
  );
}
