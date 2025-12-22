'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Home,
  FileText,
  Receipt,
  Headphones,
  X,
  User,
  ImageIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Header } from '@/widgets/header';
import { MypageSidebar } from './mypage-sidebar';

interface ReservationDetailProps {
  id: string;
}

export function ReservationDetailPage({ id }: ReservationDetailProps) {
  const t = useTranslations('mypage.reservations');
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showRefundPolicy, setShowRefundPolicy] = useState(false);

  // Mock data
  const reservation = {
    id,
    location: 'Cheongdam-dong, Gangnam-gu',
    images: ['/images/room-placeholder.jpg'],
    totalImages: 20,
    checkIn: {
      time: '3:00 PM',
      date: 'Mon, Sep 12',
    },
    checkOut: {
      time: '11:00 AM',
      date: 'Fri, Sep 16',
    },
    host: {
      name: 'Hong Lug',
      bio: 'Hello, this is Hong Rug, your host for the stay in Cheongdam-dong.',
    },
    stayName: 'Cheongdam-dong, Snug Stay ...',
    guest: 1,
    reservationCode: 'GNUS1234SG',
    refundPolicyDesc:
      'You can receive a partial refund if you cancel before 12:00 PM on June 15. Cancellations made after that time are non-refundable.',
    total: 600,
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % reservation.totalImages);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + reservation.totalImages) % reservation.totalImages);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header showLogo />

      <div className="flex">
        {/* Sidebar - Desktop only */}
        <div className="hidden lg:block w-[260px] flex-shrink-0 px-6 py-8 border-r border-[hsl(var(--snug-border))]">
          <MypageSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex justify-center py-8 px-6">
          <div className="w-full max-w-[560px]">
            {/* Back Button */}
            <button
              type="button"
              onClick={() => router.back()}
              className="mb-6 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[hsl(var(--snug-text-primary))]" />
            </button>

            {/* Image Gallery */}
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] mb-4">
              {/* Placeholder Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--snug-light-gray))] to-[hsl(var(--snug-border))] flex items-center justify-center">
                <ImageIcon className="w-16 h-16 text-[hsl(var(--snug-gray))]/30" />
              </div>

              {/* Navigation Arrows */}
              <button
                type="button"
                onClick={prevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <button
                type="button"
                onClick={nextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>

              {/* Image Counter with More */}
              <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/60 text-white text-xs rounded-full">
                {currentImageIndex + 1} / {reservation.totalImages} • {t('more')}
              </div>
            </div>

            {/* Location */}
            <h1 className="text-lg font-semibold text-[hsl(var(--snug-text-primary))] mb-4">
              {reservation.location}
            </h1>

            {/* Check-In / Check-Out */}
            <div className="flex gap-3 mb-6">
              <div className="flex-1 flex items-center justify-between px-5 py-3 border border-[hsl(var(--snug-border))] rounded-full">
                <p className="text-xs text-[hsl(var(--snug-gray))]">{t('checkIn')}</p>
                <div className="text-right">
                  <p className="text-sm text-[hsl(var(--snug-text-primary))]">
                    {reservation.checkIn.time}
                  </p>
                  <p className="text-sm font-medium text-[hsl(var(--snug-orange))]">
                    {reservation.checkIn.date}
                  </p>
                </div>
              </div>
              <div className="flex-1 flex items-center justify-between px-5 py-3 border border-[hsl(var(--snug-border))] rounded-full">
                <p className="text-xs text-[hsl(var(--snug-gray))]">{t('checkOut')}</p>
                <div className="text-right">
                  <p className="text-sm text-[hsl(var(--snug-text-primary))]">
                    {reservation.checkOut.time}
                  </p>
                  <p className="text-sm font-medium text-[hsl(var(--snug-orange))]">
                    {reservation.checkOut.date}
                  </p>
                </div>
              </div>
            </div>

            {/* Message Host */}
            <button
              type="button"
              className="w-full flex items-center justify-between py-4 border-b border-[hsl(var(--snug-border))]"
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-[hsl(var(--snug-gray))]" />
                <span className="text-sm font-semibold text-[hsl(var(--snug-text-primary))]">
                  {t('messageTheHost')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[hsl(var(--snug-gray))]">
                  {reservation.host.name}
                </span>
                <ChevronRight className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
              </div>
            </button>

            {/* View Stay Details */}
            <button
              type="button"
              className="w-full flex items-center justify-between py-4 border-b border-[hsl(var(--snug-border))]"
            >
              <div className="flex items-center gap-3">
                <Home className="w-5 h-5 text-[hsl(var(--snug-gray))]" />
                <span className="text-sm font-semibold text-[hsl(var(--snug-text-primary))]">
                  {t('viewStayDetails')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[hsl(var(--snug-gray))] max-w-[150px] truncate">
                  {reservation.stayName}
                </span>
                <ChevronRight className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
              </div>
            </button>

            {/* Agreement Information */}
            <div className="py-6 border-b border-[hsl(var(--snug-border))]">
              <h2 className="text-base font-semibold text-[hsl(var(--snug-text-primary))] mb-4">
                {t('agreementInformation')}
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-semibold text-[hsl(var(--snug-gray))]">
                    {t('guest')}
                  </span>
                  <span className="text-sm text-[hsl(var(--snug-gray))]">{reservation.guest}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-semibold text-[hsl(var(--snug-gray))]">
                    {t('reservationCode')}
                  </span>
                  <span className="text-sm text-[hsl(var(--snug-gray))]">
                    {reservation.reservationCode}
                  </span>
                </div>
              </div>

              {/* Refund Policy */}
              <button
                type="button"
                onClick={() => setShowRefundPolicy(true)}
                className="w-full mt-4"
              >
                <div className="flex justify-between items-start">
                  <div className="text-left">
                    <p className="text-sm font-semibold text-[hsl(var(--snug-gray))]">
                      {t('refundPolicy')}
                    </p>
                    <p className="text-xs text-[hsl(var(--snug-gray))] mt-1 max-w-[400px]">
                      {reservation.refundPolicyDesc}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[hsl(var(--snug-gray))] flex-shrink-0 mt-1" />
                </div>
              </button>

              {/* View Agreement Button */}
              <button
                type="button"
                className="w-full mt-4 flex items-center justify-between px-5 py-3.5 border border-[hsl(var(--snug-border))] rounded-full hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[hsl(var(--snug-gray))]" />
                  <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                    {t('viewAgreement')}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
              </button>
            </div>

            {/* Payment Information */}
            <div className="py-6 border-b border-[hsl(var(--snug-border))]">
              <h2 className="text-base font-semibold text-[hsl(var(--snug-text-primary))] mb-4">
                {t('paymentInformation')}
              </h2>

              <p className="text-sm font-semibold text-[hsl(var(--snug-gray))] mb-2">
                {t('billingDetails')}
              </p>
              <div className="flex justify-between mb-4">
                <span className="text-sm text-[hsl(var(--snug-gray))]">{t('total')}</span>
                <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                  ${reservation.total}
                </span>
              </div>

              {/* View Receipt Button */}
              <button
                type="button"
                className="w-full flex items-center justify-between px-5 py-3.5 border border-[hsl(var(--snug-border))] rounded-full hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Receipt className="w-5 h-5 text-[hsl(var(--snug-gray))]" />
                  <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                    {t('viewReceipt')}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
              </button>
            </div>

            {/* Host */}
            <div className="py-6 border-b border-[hsl(var(--snug-border))]">
              <h2 className="text-base font-semibold text-[hsl(var(--snug-text-primary))] mb-4">
                {t('host')}
              </h2>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[hsl(var(--snug-light-gray))] flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-[hsl(var(--snug-gray))]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[hsl(var(--snug-gray))]">
                      {reservation.host.name}
                    </span>
                    <button
                      type="button"
                      className="flex items-center gap-1 text-sm text-[hsl(var(--snug-gray))]"
                    >
                      {t('more')}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-[hsl(var(--snug-gray))] mt-1">
                    {reservation.host.bio}
                  </p>
                </div>
              </div>
            </div>

            {/* Help & Support */}
            <div className="py-6">
              <h2 className="text-base font-semibold text-[hsl(var(--snug-text-primary))] mb-2">
                {t('helpAndSupport')}
              </h2>
              <p className="text-sm text-[hsl(var(--snug-gray))] mb-4">{t('helpAndSupportDesc')}</p>

              {/* Contact Support Button */}
              <button
                type="button"
                className="w-full flex items-center justify-between px-5 py-3.5 border border-[hsl(var(--snug-border))] rounded-full hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Headphones className="w-5 h-5 text-[hsl(var(--snug-gray))]" />
                  <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                    {t('contactSupportTeam')}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Refund Policy Modal */}
      {showRefundPolicy && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-[480px] max-h-[80vh] overflow-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--snug-border))] sticky top-0 bg-white">
              <h3 className="text-base font-semibold text-[hsl(var(--snug-text-primary))]">
                {t('refundPolicy')}
              </h3>
              <button
                type="button"
                onClick={() => setShowRefundPolicy(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-[hsl(var(--snug-gray))]" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5">
              <h4 className="text-sm font-semibold text-[hsl(var(--snug-text-primary))] mb-3">
                {t('refundPolicy')}
              </h4>
              <ul className="space-y-2 text-sm text-[hsl(var(--snug-text-primary))] list-disc pl-4">
                <li>{t('refundPolicy15Days')}</li>
                <li>{t('refundPolicy14to8Days')}</li>
                <li>{t('refundPolicy7to1Days')}</li>
                <li>{t('refundPolicyCheckInDay')}</li>
              </ul>

              <h4 className="text-sm font-semibold text-[hsl(var(--snug-text-primary))] mt-6 mb-3">
                {t('notes')}
              </h4>
              <ul className="space-y-2 text-sm text-[hsl(var(--snug-text-primary))] list-disc pl-4">
                <li>{t('refundNote1')}</li>
                <li>{t('refundNote2')}</li>
                <li>{t('refundNote3')}</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
