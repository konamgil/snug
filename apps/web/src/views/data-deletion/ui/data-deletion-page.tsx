'use client';

import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

export function DataDeletionPage() {
  const t = useTranslations('legal.dataDeletion');
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-5 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 text-[hsl(var(--snug-text-primary))] hover:bg-[hsl(var(--snug-light-gray))] rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-[hsl(var(--snug-text-primary))]">{t('title')}</h1>
        </div>

        {/* Content */}
        <div className="prose prose-sm max-w-none text-[hsl(var(--snug-text-primary))]">
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-3">{t('section1.title')}</h2>
            <p className="text-sm leading-relaxed text-[hsl(var(--snug-text-secondary))]">
              {t('section1.content')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-3">{t('section2.title')}</h2>
            <div className="text-sm leading-relaxed text-[hsl(var(--snug-text-secondary))] space-y-2">
              <p>{t('section2.step1')}</p>
              <p>{t('section2.step2')}</p>
              <p>{t('section2.step3')}</p>
              <p>{t('section2.step4')}</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-3">{t('section3.title')}</h2>
            <p className="text-sm leading-relaxed text-[hsl(var(--snug-text-secondary))]">
              {t('section3.content')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-3">{t('section4.title')}</h2>
            <p className="text-sm leading-relaxed text-[hsl(var(--snug-text-secondary))]">
              {t('section4.content')}
            </p>
            <p className="text-sm mt-2">
              <a
                href="mailto:cs@findsnug.com"
                className="text-[hsl(var(--snug-orange))] hover:underline"
              >
                cs@findsnug.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
