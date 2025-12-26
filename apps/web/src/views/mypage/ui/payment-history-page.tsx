'use client';

import { useTranslations } from 'next-intl';
import { ArrowLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { Header } from '@/widgets/header';
import { MypageSidebar } from './mypage-sidebar';

interface PaymentHistoryItem {
  id: string;
  location: string;
  price: number;
  startDate: string;
  endDate: string;
  status?: 'refunded' | 'completed';
  imageUrl: string;
  year: number;
}

export function PaymentHistoryPage() {
  const t = useTranslations('mypage.payment');
  const router = useRouter();

  // Mock data
  const paymentHistory: PaymentHistoryItem[] = [
    {
      id: '1',
      location: 'Cheongdam-dong, Gangnam-gu',
      price: 600,
      startDate: 'Aug 1, 25',
      endDate: 'Aug 31, 25',
      status: 'refunded',
      imageUrl: '/images/room-placeholder.jpg',
      year: 2025,
    },
    {
      id: '2',
      location: 'Cheongdam-dong, Gangnam-gu',
      price: 600,
      startDate: 'Aug 1, 25',
      endDate: 'Aug 31, 25',
      imageUrl: '/images/room-placeholder.jpg',
      year: 2025,
    },
    {
      id: '3',
      location: 'Cheongdam-dong, Gangnam-gu',
      price: 600,
      startDate: 'Aug 1, 25',
      endDate: 'Aug 31, 25',
      imageUrl: '/images/room-placeholder.jpg',
      year: 2022,
    },
    {
      id: '4',
      location: 'Cheongdam-dong, Gangnam-gu',
      price: 600,
      startDate: 'Aug 1, 25',
      endDate: 'Aug 31, 25',
      imageUrl: '/images/room-placeholder.jpg',
      year: 2022,
    },
    {
      id: '5',
      location: 'Cheongdam-dong, Gangnam-gu',
      price: 600,
      startDate: 'Aug 1, 25',
      endDate: 'Aug 31, 25',
      imageUrl: '/images/room-placeholder.jpg',
      year: 2022,
    },
  ];

  // Group by year
  const currentYear = new Date().getFullYear();
  const recentPayments = paymentHistory.filter((item) => item.year >= currentYear);
  const pastPayments = paymentHistory.filter((item) => item.year < currentYear);

  // Group past payments by year
  const pastPaymentsByYear = pastPayments.reduce<Record<number, PaymentHistoryItem[]>>(
    (acc, item) => {
      if (!acc[item.year]) {
        acc[item.year] = [];
      }
      acc[item.year]!.push(item);
      return acc;
    },
    {},
  );

  const PaymentItem = ({ item }: { item: PaymentHistoryItem }) => (
    <button
      type="button"
      className="w-full flex items-center gap-4 p-4 border border-[hsl(var(--snug-border))] rounded-2xl hover:bg-gray-50 transition-colors"
    >
      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-[hsl(var(--snug-light-gray))] to-[hsl(var(--snug-border))] flex items-center justify-center">
        <ImageIcon className="w-6 h-6 text-[hsl(var(--snug-gray))]/30" />
      </div>
      <div className="flex-1 text-left">
        <h4 className="text-sm font-medium text-[hsl(var(--snug-text-primary))]">
          {item.location}
        </h4>
        <p className="text-sm font-semibold text-[hsl(var(--snug-orange))]">${item.price}</p>
        <p className="text-xs text-[hsl(var(--snug-gray))]">
          {item.startDate} - {item.endDate}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {item.status === 'refunded' && (
          <span className="text-sm text-[hsl(var(--snug-gray))]">{t('refunded')}</span>
        )}
        <ChevronRight className="w-5 h-5 text-[hsl(var(--snug-gray))]" />
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* PC Header with Logo */}
      <div className="hidden md:block">
        <Header showLogo />
      </div>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-5 py-4">
        <button type="button" onClick={() => router.back()} className="p-1" aria-label="Back">
          <ArrowLeft className="w-6 h-6 text-[hsl(var(--snug-text-primary))]" />
        </button>
        <div className="w-6" />
      </header>

      <div className="flex">
        {/* Sidebar - Desktop only */}
        <div className="hidden lg:block w-[280px] flex-shrink-0 px-6 py-8 border-r border-[hsl(var(--snug-border))]">
          <MypageSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex justify-center py-6 px-5 md:py-8 md:px-6">
          <div className="w-full max-w-[560px]">
            {/* Page Header - Mobile */}
            <div className="md:hidden mb-6">
              <h1 className="text-lg font-bold text-[hsl(var(--snug-text-primary))] mb-1">
                {t('title')}
              </h1>
              <p className="text-sm text-[hsl(var(--snug-gray))]">{t('historySubtitle')}</p>
            </div>

            {/* Page Header with Back Button - PC */}
            <div className="hidden md:block mb-8">
              <div className="flex items-center gap-4 mb-1">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-[hsl(var(--snug-text-primary))]" />
                </button>
                <h1 className="text-xl font-bold text-[hsl(var(--snug-text-primary))]">
                  {t('title')}
                </h1>
              </div>
              <p className="text-sm text-[hsl(var(--snug-gray))] ml-10">{t('historySubtitle')}</p>
            </div>

            {/* Recent Payments */}
            {recentPayments.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-[hsl(var(--snug-text-primary))] mb-3">
                  {t('recent')}
                </h3>
                <div className="space-y-3">
                  {recentPayments.map((item) => (
                    <PaymentItem key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* Past Payments by Year */}
            {Object.keys(pastPaymentsByYear)
              .sort((a, b) => Number(b) - Number(a))
              .map((year) => (
                <div key={year} className="mb-8">
                  <h3 className="text-sm font-semibold text-[hsl(var(--snug-text-primary))] mb-3">
                    {year}
                  </h3>
                  <div className="space-y-3">
                    {pastPaymentsByYear[Number(year)]?.map((item) => (
                      <PaymentItem key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              ))}

            {/* Empty State */}
            {paymentHistory.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-sm text-[hsl(var(--snug-gray))]">{t('noPaymentHistory')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
