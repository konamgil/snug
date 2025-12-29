'use client';

import { useTranslations } from 'next-intl';

interface ComingSoonOverlayProps {
  children: React.ReactNode;
}

export function ComingSoonOverlay({ children }: ComingSoonOverlayProps) {
  const t = useTranslations('host.dashboard');

  return (
    <div className="relative min-h-[calc(100vh-120px)]">
      {/* Page content - blurred and disabled */}
      <div className="blur-sm pointer-events-none select-none">{children}</div>

      {/* Coming soon overlay */}
      <div className="absolute inset-0 flex items-start justify-center pt-24 md:pt-32 bg-white/60 backdrop-blur-[2px]">
        <div className="text-center px-4 max-w-md">
          <div className="bg-white rounded-2xl shadow-lg px-8 py-8 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('comingSoonTitle')}</h3>
            <p className="text-sm text-gray-600 mb-6">{t('comingSoonDescription')}</p>
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                {t('comingSoonContact')} :{' '}
                <a
                  href={`mailto:${t('comingSoonEmail')}`}
                  className="text-[hsl(var(--snug-orange))] font-medium hover:underline"
                >
                  {t('comingSoonEmail')}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
