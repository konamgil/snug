'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Eye, EyeOff, ChevronDown, Loader2, CheckCircle } from 'lucide-react';
import { useRouter, Link } from '@/i18n/navigation';

const COUNTRY_CODES = [
  // 아시아
  { code: '+82', country: '한국', flag: '🇰🇷' },
  { code: '+81', country: '일본', flag: '🇯🇵' },
  { code: '+86', country: '중국', flag: '🇨🇳' },
  { code: '+852', country: '홍콩', flag: '🇭🇰' },
  { code: '+853', country: '마카오', flag: '🇲🇴' },
  { code: '+886', country: '대만', flag: '🇹🇼' },
  { code: '+65', country: '싱가포르', flag: '🇸🇬' },
  { code: '+66', country: '태국', flag: '🇹🇭' },
  { code: '+84', country: '베트남', flag: '🇻🇳' },
  { code: '+63', country: '필리핀', flag: '🇵🇭' },
  { code: '+62', country: '인도네시아', flag: '🇮🇩' },
  { code: '+60', country: '말레이시아', flag: '🇲🇾' },
  { code: '+91', country: '인도', flag: '🇮🇳' },
  { code: '+92', country: '파키스탄', flag: '🇵🇰' },
  { code: '+880', country: '방글라데시', flag: '🇧🇩' },
  { code: '+94', country: '스리랑카', flag: '🇱🇰' },
  { code: '+977', country: '네팔', flag: '🇳🇵' },
  { code: '+95', country: '미얀마', flag: '🇲🇲' },
  { code: '+855', country: '캄보디아', flag: '🇰🇭' },
  { code: '+856', country: '라오스', flag: '🇱🇦' },
  { code: '+673', country: '브루나이', flag: '🇧🇳' },
  { code: '+976', country: '몽골', flag: '🇲🇳' },
  // 북미
  { code: '+1', country: '미국/캐나다', flag: '🇺🇸' },
  // 중남미
  { code: '+52', country: '멕시코', flag: '🇲🇽' },
  { code: '+55', country: '브라질', flag: '🇧🇷' },
  { code: '+54', country: '아르헨티나', flag: '🇦🇷' },
  { code: '+56', country: '칠레', flag: '🇨🇱' },
  { code: '+57', country: '콜롬비아', flag: '🇨🇴' },
  { code: '+51', country: '페루', flag: '🇵🇪' },
  { code: '+58', country: '베네수엘라', flag: '🇻🇪' },
  { code: '+593', country: '에콰도르', flag: '🇪🇨' },
  { code: '+591', country: '볼리비아', flag: '🇧🇴' },
  { code: '+595', country: '파라과이', flag: '🇵🇾' },
  { code: '+598', country: '우루과이', flag: '🇺🇾' },
  { code: '+506', country: '코스타리카', flag: '🇨🇷' },
  { code: '+507', country: '파나마', flag: '🇵🇦' },
  { code: '+502', country: '과테말라', flag: '🇬🇹' },
  { code: '+503', country: '엘살바도르', flag: '🇸🇻' },
  { code: '+504', country: '온두라스', flag: '🇭🇳' },
  { code: '+505', country: '니카라과', flag: '🇳🇮' },
  { code: '+53', country: '쿠바', flag: '🇨🇺' },
  { code: '+1809', country: '도미니카', flag: '🇩🇴' },
  { code: '+1876', country: '자메이카', flag: '🇯🇲' },
  { code: '+1787', country: '푸에르토리코', flag: '🇵🇷' },
  // 유럽
  { code: '+44', country: '영국', flag: '🇬🇧' },
  { code: '+49', country: '독일', flag: '🇩🇪' },
  { code: '+33', country: '프랑스', flag: '🇫🇷' },
  { code: '+39', country: '이탈리아', flag: '🇮🇹' },
  { code: '+34', country: '스페인', flag: '🇪🇸' },
  { code: '+351', country: '포르투갈', flag: '🇵🇹' },
  { code: '+31', country: '네덜란드', flag: '🇳🇱' },
  { code: '+32', country: '벨기에', flag: '🇧🇪' },
  { code: '+41', country: '스위스', flag: '🇨🇭' },
  { code: '+43', country: '오스트리아', flag: '🇦🇹' },
  { code: '+46', country: '스웨덴', flag: '🇸🇪' },
  { code: '+47', country: '노르웨이', flag: '🇳🇴' },
  { code: '+45', country: '덴마크', flag: '🇩🇰' },
  { code: '+358', country: '핀란드', flag: '🇫🇮' },
  { code: '+353', country: '아일랜드', flag: '🇮🇪' },
  { code: '+48', country: '폴란드', flag: '🇵🇱' },
  { code: '+420', country: '체코', flag: '🇨🇿' },
  { code: '+36', country: '헝가리', flag: '🇭🇺' },
  { code: '+30', country: '그리스', flag: '🇬🇷' },
  { code: '+40', country: '루마니아', flag: '🇷🇴' },
  { code: '+380', country: '우크라이나', flag: '🇺🇦' },
  { code: '+7', country: '러시아', flag: '🇷🇺' },
  { code: '+90', country: '튀르키예', flag: '🇹🇷' },
  // 오세아니아
  { code: '+61', country: '호주', flag: '🇦🇺' },
  { code: '+64', country: '뉴질랜드', flag: '🇳🇿' },
  { code: '+679', country: '피지', flag: '🇫🇯' },
  // 중동
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+966', country: '사우디', flag: '🇸🇦' },
  { code: '+972', country: '이스라엘', flag: '🇮🇱' },
  { code: '+965', country: '쿠웨이트', flag: '🇰🇼' },
  { code: '+974', country: '카타르', flag: '🇶🇦' },
  { code: '+973', country: '바레인', flag: '🇧🇭' },
  { code: '+968', country: '오만', flag: '🇴🇲' },
  { code: '+962', country: '요르단', flag: '🇯🇴' },
  { code: '+961', country: '레바논', flag: '🇱🇧' },
  { code: '+98', country: '이란', flag: '🇮🇷' },
  { code: '+964', country: '이라크', flag: '🇮🇶' },
  // 아프리카
  { code: '+20', country: '이집트', flag: '🇪🇬' },
  { code: '+27', country: '남아공', flag: '🇿🇦' },
  { code: '+234', country: '나이지리아', flag: '🇳🇬' },
  { code: '+254', country: '케냐', flag: '🇰🇪' },
  { code: '+212', country: '모로코', flag: '🇲🇦' },
  { code: '+213', country: '알제리', flag: '🇩🇿' },
  { code: '+233', country: '가나', flag: '🇬🇭' },
  { code: '+251', country: '에티오피아', flag: '🇪🇹' },
  { code: '+255', country: '탄자니아', flag: '🇹🇿' },
  { code: '+256', country: '우간다', flag: '🇺🇬' },
];

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type SignupStep = 'email' | 'verify' | 'info';

export function SignupPage() {
  const t = useTranslations('auth.signupPage');
  const tVerify = useTranslations('auth.emailVerification');
  const router = useRouter();

  // Step state
  const [currentStep, setCurrentStep] = useState<SignupStep>('email');

  // Form data
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // OTP state
  const [resendTimer, setResendTimer] = useState(0);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const selectedCountry = COUNTRY_CODES.find((c) => c.code === countryCode);
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordError =
    confirmPassword && password !== confirmPassword ? t('passwordMismatch') : '';

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  // Focus first OTP input when entering verify step
  useEffect(() => {
    if (currentStep === 'verify' && !isLoading) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [currentStep, isLoading]);

  // Provider 이름을 사용자 친화적으로 변환
  const getProviderDisplayName = (provider: string) => {
    const names: Record<string, string> = {
      google: 'Google',
      kakao: '카카오',
      facebook: 'Facebook',
      apple: 'Apple',
    };
    return names[provider] || provider;
  };

  // Step 1: Send OTP
  const handleSendOTP = async () => {
    if (!isValidEmail) return;

    setIsLoading(true);
    setError('');

    try {
      // 먼저 이미 가입된 이메일인지 확인
      const checkResponse = await fetch(`${API_BASE_URL}/auth/check-provider`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (checkResponse.ok) {
        const checkResult = await checkResponse.json();
        const checkData = checkResult.data || checkResult; // API 응답 구조 대응

        if (checkData.exists) {
          if (checkData.isSocialLogin) {
            // 소셜 로그인으로 가입된 이메일
            setError(
              t('alreadySocialLogin', { provider: getProviderDisplayName(checkData.provider) }),
            );
            setIsLoading(false);
            return;
          } else {
            // 이메일로 이미 가입된 경우
            setError(t('alreadyRegistered'));
            setIsLoading(false);
            return;
          }
        }
      }
      // check-provider가 실패해도 OTP 전송은 시도 (Supabase에서 최종 검증됨)

      // OTP 전송
      const response = await fetch(`${API_BASE_URL}/auth/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'SIGNUP' }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCurrentStep('verify');
        setResendTimer(RESEND_COOLDOWN);
      } else {
        setError(data.message || tVerify('sendError'));
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError(tVerify('sendError'));
    }

    setIsLoading(false);
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setOtp(Array(OTP_LENGTH).fill(''));
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'SIGNUP' }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResendTimer(RESEND_COOLDOWN);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      } else {
        setError(data.message || tVerify('sendError'));
      }
    } catch {
      setError(tVerify('sendError'));
    }

    setIsLoading(false);
  };

  // OTP input handling
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];

    if (value.length > 1) {
      const digits = value.slice(0, OTP_LENGTH - index).split('');
      digits.forEach((digit, i) => {
        if (index + i < OTP_LENGTH) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
    } else {
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }

    setError('');
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = useCallback(async () => {
    const code = otp.join('');
    if (code.length !== OTP_LENGTH) {
      setError(tVerify('enterFullCode'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, type: 'SIGNUP' }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsOtpVerified(true);
        setTimeout(() => setCurrentStep('info'), 500);
      } else {
        setError(data.message || tVerify('verifyError'));
        setOtp(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError(tVerify('verifyError'));
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    }

    setIsLoading(false);
  }, [otp, email, tVerify]);

  // Auto-verify when all digits entered
  useEffect(() => {
    if (
      otp.every((digit) => digit !== '') &&
      !isLoading &&
      !isOtpVerified &&
      currentStep === 'verify'
    ) {
      handleVerifyOTP();
    }
  }, [otp, isLoading, isOtpVerified, currentStep, handleVerifyOTP]);

  // Step 3: Submit signup
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isFormValid =
      password.length >= 8 && password === confirmPassword && firstName && lastName && agreeTerms;

    if (!isFormValid) return;

    setIsLoading(true);
    setError('');

    try {
      // 백엔드 API로 회원가입 (Supabase Admin API 사용하여 이메일 인증 완료 상태로 생성)
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          phone: phoneNumber || undefined,
          countryCode: countryCode || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        // 백엔드에서 JSON 형식의 상세 에러를 반환할 수 있음
        let errorMessage = t('signupFailed');

        try {
          // data.message가 JSON 문자열인 경우 파싱
          const parsedError = JSON.parse(data.message);
          if (parsedError.code === 'SOCIAL_LOGIN_EXISTS') {
            errorMessage = t('alreadySocialLogin', {
              provider: getProviderDisplayName(parsedError.provider),
            });
          } else if (parsedError.code === 'EMAIL_EXISTS') {
            errorMessage = t('alreadyRegistered');
          } else {
            errorMessage = parsedError.message || t('signupFailed');
          }
        } catch {
          // JSON 파싱 실패 시 그냥 메시지 사용
          errorMessage = data.message || t('signupFailed');
        }

        setError(errorMessage);
      }
    } catch {
      setError(t('signupFailed'));
    }

    setIsLoading(false);
  };

  // Back navigation
  const handleBack = () => {
    if (currentStep === 'verify') {
      setCurrentStep('email');
      setOtp(Array(OTP_LENGTH).fill(''));
      setError('');
    } else if (currentStep === 'info') {
      // Don't go back from info step (already verified)
      router.back();
    } else {
      router.back();
    }
  };

  // Mask email for display
  const maskedEmail = (() => {
    const parts = email.split('@');
    const localPart = parts[0] ?? '';
    const domain = parts[1] ?? '';
    return localPart.length > 2
      ? `${localPart.charAt(0)}${'*'.repeat(Math.min(localPart.length - 1, 4))}@${domain}`
      : email;
  })();

  // Step indicator
  const steps = [
    { key: 'email', label: t('stepEmail') },
    { key: 'verify', label: t('stepVerify') },
    { key: 'info', label: t('stepInfo') },
  ];
  const currentStepIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="min-h-dvh flex flex-col bg-white">
      <main className="flex-1 flex flex-col items-center px-5 py-6 md:py-8 lg:py-10">
        {/* Header */}
        <div className="w-full max-w-[440px] md:max-w-[480px] lg:max-w-[520px] relative flex items-center justify-center mb-6">
          <button
            type="button"
            onClick={handleBack}
            className="absolute left-0 p-2 text-[hsl(var(--snug-text-primary))] hover:bg-[hsl(var(--snug-light-gray))] rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-semibold text-[hsl(var(--snug-text-primary))]">
            {t('title')}
          </h1>
        </div>

        {/* Step Indicator */}
        {!success && (
          <div className="w-full max-w-[320px] md:max-w-[420px] lg:max-w-[500px] mb-10">
            <div className="flex items-center">
              {steps.map((step, index) => (
                <div key={step.key} className="flex items-center flex-1 last:flex-none">
                  {/* Step Circle & Label */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                        index <= currentStepIndex
                          ? 'bg-[hsl(var(--snug-orange))] text-white'
                          : 'bg-[hsl(var(--snug-border))] text-[hsl(var(--snug-gray))]'
                      }`}
                    >
                      {index < currentStepIndex ? <CheckCircle className="w-4 h-4" /> : index + 1}
                    </div>
                    <span
                      className={`text-[11px] md:text-xs mt-1.5 whitespace-nowrap ${
                        index <= currentStepIndex
                          ? 'text-[hsl(var(--snug-text-primary))] font-medium'
                          : 'text-[hsl(var(--snug-gray))]'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-[2px] mx-3 md:mx-4 -mt-5 ${
                        index < currentStepIndex
                          ? 'bg-[hsl(var(--snug-orange))]'
                          : 'bg-[hsl(var(--snug-border))]'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Success Message */}
        {success ? (
          <div className="w-full max-w-[440px] md:max-w-[480px] lg:max-w-[520px] text-center space-y-4">
            {/* Hello Snug Logo */}
            <img
              src="/images/logo/logo_hellosnug.svg"
              alt="Hello Snug"
              className="h-7 mx-auto mb-2"
            />
            <h2 className="text-lg font-semibold text-[hsl(var(--snug-text-primary))]">
              {t('signupComplete')}
            </h2>
            <p className="text-sm text-[hsl(var(--snug-gray))]">{t('welcomeMessage')}</p>
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="w-full py-3 bg-[hsl(var(--snug-orange))] text-white text-sm font-medium rounded-full hover:bg-[hsl(var(--snug-orange))]/90 active:scale-[0.98] transition-all mt-4"
            >
              {t('goToLogin')}
            </button>
          </div>
        ) : (
          <>
            {/* Step 1: Email */}
            {currentStep === 'email' && (
              <div className="w-full max-w-[440px] md:max-w-[480px] lg:max-w-[520px]">
                <div className="text-center mb-8">
                  <h2 className="text-lg font-semibold text-[hsl(var(--snug-text-primary))] mb-1">
                    {t('enterEmail')}
                  </h2>
                  <p className="text-sm text-[hsl(var(--snug-gray))]">{t('emailDescription')}</p>
                </div>

                {error && <p className="text-sm text-red-500 text-center mb-4">{error}</p>}

                <div className="space-y-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('emailAddress')}
                    className="w-full px-4 py-3.5 border border-[hsl(var(--snug-border))] rounded-xl text-sm placeholder:text-[hsl(var(--snug-gray))] focus:outline-none focus:border-[hsl(var(--snug-orange))] transition-colors"
                    autoFocus
                  />

                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={!isValidEmail || isLoading}
                    className="w-full py-3 bg-[hsl(var(--snug-orange))] text-white text-sm font-medium rounded-full hover:bg-[hsl(var(--snug-orange))]/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {t('continue')}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: OTP Verification */}
            {currentStep === 'verify' && (
              <div className="w-full max-w-[440px] md:max-w-[480px] lg:max-w-[520px]">
                <div className="text-center mb-8">
                  <h2 className="text-lg font-semibold text-[hsl(var(--snug-text-primary))] mb-1">
                    {tVerify('title')}
                  </h2>
                  <p className="text-sm text-[hsl(var(--snug-gray))]">
                    {tVerify('sentTo', { email: maskedEmail })}
                  </p>
                </div>

                {error && <p className="text-sm text-red-500 text-center mb-4">{error}</p>}

                {/* OTP Inputs */}
                <div className="flex justify-center gap-2.5 md:gap-3">
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
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      disabled={isLoading || isOtpVerified}
                      className={`w-11 h-13 sm:w-12 sm:h-14 md:w-14 md:h-16 text-center text-lg md:text-xl font-semibold border rounded-lg transition-all
                        ${
                          isOtpVerified
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

                {/* Success indicator */}
                {isOtpVerified && (
                  <div className="flex items-center justify-center gap-2 text-green-600 mt-4">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">{tVerify('verified')}</span>
                  </div>
                )}

                {/* Resend */}
                {!isOtpVerified && (
                  <div className="text-center mt-6">
                    {isLoading ? (
                      <span className="text-sm text-[hsl(var(--snug-gray))] flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {tVerify('verifying')}
                      </span>
                    ) : resendTimer > 0 ? (
                      <span className="text-sm text-[hsl(var(--snug-gray))]">
                        {tVerify('resendIn', { seconds: resendTimer })}
                      </span>
                    ) : (
                      <button
                        onClick={handleResendOTP}
                        className="text-sm text-[hsl(var(--snug-orange))] hover:underline"
                      >
                        {tVerify('resend')}
                      </button>
                    )}
                  </div>
                )}

                {/* Verify Button */}
                <button
                  type="button"
                  onClick={handleVerifyOTP}
                  disabled={isLoading || isOtpVerified || otp.some((d) => !d)}
                  className="w-full py-3 bg-[hsl(var(--snug-orange))] text-white text-sm font-medium rounded-full hover:bg-[hsl(var(--snug-orange))]/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isOtpVerified ? tVerify('verified') : tVerify('verify')}
                </button>
              </div>
            )}

            {/* Step 3: Personal Info */}
            {currentStep === 'info' && (
              <form
                onSubmit={handleSubmit}
                className="w-full max-w-[440px] md:max-w-[480px] lg:max-w-[520px] space-y-3"
              >
                <div className="text-center mb-6">
                  <h2 className="text-lg font-semibold text-[hsl(var(--snug-text-primary))] mb-1">
                    {t('completeSignup')}
                  </h2>
                  <p className="text-sm text-[hsl(var(--snug-gray))]">{t('infoDescription')}</p>
                </div>

                {error && <p className="text-sm text-red-500 text-center mb-3">{error}</p>}

                {/* Verified Email Display */}
                <div className="px-4 py-3 bg-[hsl(var(--snug-light-gray))]/50 rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-[hsl(var(--snug-text-primary))]">{email}</span>
                </div>

                {/* Password */}
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('password')}
                    className="w-full px-4 py-3.5 pr-12 border border-[hsl(var(--snug-border))] rounded-xl text-sm placeholder:text-[hsl(var(--snug-gray))] focus:outline-none focus:border-[hsl(var(--snug-orange))] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(var(--snug-gray))]"
                  >
                    {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-[hsl(var(--snug-gray))] px-1">{t('passwordHint')}</p>

                {/* Confirm Password */}
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('confirmPassword')}
                    className={`w-full px-4 py-3.5 pr-12 border rounded-xl text-sm placeholder:text-[hsl(var(--snug-gray))] focus:outline-none transition-colors ${
                      passwordError
                        ? 'border-red-400'
                        : 'border-[hsl(var(--snug-border))] focus:border-[hsl(var(--snug-orange))]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(var(--snug-gray))]"
                  >
                    {showConfirmPassword ? (
                      <Eye className="w-5 h-5" />
                    ) : (
                      <EyeOff className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {passwordError && <p className="text-xs text-red-500 px-1">{passwordError}</p>}

                {/* Name */}
                <div className="grid grid-cols-2 gap-2.5 mt-1">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={t('firstName')}
                    className="w-full px-4 py-3.5 border border-[hsl(var(--snug-border))] rounded-xl text-sm placeholder:text-[hsl(var(--snug-gray))] focus:outline-none focus:border-[hsl(var(--snug-orange))] transition-colors"
                  />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={t('lastName')}
                    className="w-full px-4 py-3.5 border border-[hsl(var(--snug-border))] rounded-xl text-sm placeholder:text-[hsl(var(--snug-gray))] focus:outline-none focus:border-[hsl(var(--snug-orange))] transition-colors"
                  />
                </div>
                <p className="text-xs text-[hsl(var(--snug-gray))] px-1">{t('nameHint')}</p>

                {/* Phone (Optional) */}
                <div className="flex gap-2.5 mt-1">
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                      className="flex items-center gap-1.5 px-3 py-3.5 border border-[hsl(var(--snug-border))] rounded-xl text-sm hover:border-[hsl(var(--snug-gray))] transition-colors whitespace-nowrap"
                    >
                      <span>{selectedCountry?.flag || '🇰🇷'}</span>
                      <span className="text-[hsl(var(--snug-text-primary))]">
                        {selectedCountry?.code || '+82'}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-[hsl(var(--snug-gray))]" />
                    </button>
                    {showCountryDropdown && (
                      <div className="absolute bottom-full left-0 mb-2 w-[220px] bg-white border border-[hsl(var(--snug-border))] rounded-xl shadow-lg z-10">
                        <div className="p-2 border-b border-[hsl(var(--snug-border))]">
                          <input
                            type="text"
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            placeholder="국가 검색..."
                            className="w-full px-3 py-2 text-sm border border-[hsl(var(--snug-border))] rounded-lg focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                            autoFocus
                          />
                        </div>
                        <div className="max-h-[180px] overflow-y-auto p-1">
                          {COUNTRY_CODES.filter(
                            (country) =>
                              country.country.toLowerCase().includes(countrySearch.toLowerCase()) ||
                              country.code.includes(countrySearch),
                          ).map((country) => (
                            <button
                              key={country.code}
                              type="button"
                              onClick={() => {
                                setCountryCode(country.code);
                                setShowCountryDropdown(false);
                                setCountrySearch('');
                              }}
                              className="w-full px-2.5 py-2 text-left text-sm hover:bg-[hsl(var(--snug-light-gray))] rounded-lg transition-colors flex items-center gap-2"
                            >
                              <span className="text-base">{country.flag}</span>
                              <span className="text-[hsl(var(--snug-text-primary))] font-medium">
                                {country.code}
                              </span>
                              <span className="text-[hsl(var(--snug-gray))] text-xs truncate">
                                {country.country}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder={t('phoneNumber')}
                    className="flex-1 min-w-0 px-4 py-3.5 border border-[hsl(var(--snug-border))] rounded-xl text-sm placeholder:text-[hsl(var(--snug-gray))] focus:outline-none focus:border-[hsl(var(--snug-orange))] transition-colors"
                  />
                </div>
                <p className="text-xs text-[hsl(var(--snug-gray))] px-1">{t('phoneOptional')}</p>

                {/* Divider */}
                <div className="border-t border-[hsl(var(--snug-border))] my-3" />

                {/* Terms */}
                <label className="flex gap-3 cursor-pointer">
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
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
                  <div className="flex-1">
                    <p className="text-sm text-[hsl(var(--snug-text-primary))]">
                      <Link
                        href="/terms"
                        className="text-[hsl(var(--snug-orange))] hover:underline"
                        target="_blank"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {t('termsOfService')}
                      </Link>
                      {t('and')}
                      <Link
                        href="/privacy"
                        className="text-[hsl(var(--snug-orange))] hover:underline"
                        target="_blank"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {t('privacyPolicy')}
                      </Link>
                      {t('agreeToTerms')}
                    </p>
                  </div>
                </label>

                {/* Marketing */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={agreeMarketing}
                      onChange={(e) => setAgreeMarketing(e.target.checked)}
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
                  <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                    {t('agreeMarketing')}
                  </span>
                </label>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={
                    isLoading ||
                    password.length < 8 ||
                    password !== confirmPassword ||
                    !firstName ||
                    !lastName ||
                    !agreeTerms
                  }
                  className="w-full py-3 bg-[hsl(var(--snug-orange))] text-white text-sm font-medium rounded-full hover:bg-[hsl(var(--snug-orange))]/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-5"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {t('createAccount')}
                </button>
              </form>
            )}
          </>
        )}
      </main>
    </div>
  );
}
