'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';

export interface ContractDetailData {
  id: string;
  guestName: string;
  guestGender: string;
  checkInDate: string;
  checkOutDate: string;
  propertyName: string;
  roomNumber: string;
  thumbnailUrl: string;
  inquiryDate: string;
  guestCount: number;
  nights: number;
  basePrice: number;
  detailRequest: string;
  // Basic info
  contact: string;
  email: string;
  passportNumber: string;
  residentNumber: string;
  // Additional info
  purpose: string;
  payer: string;
  bankAccount: string;
  paymentDate: string;
  // Payment info
  cleaningFee: number;
  managementFee: number;
  totalPrice: number;
  // Memo
  memo: string;
}

interface ContractDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: ContractDetailData | null;
  onPaymentRequest?: () => void;
  onOtherProposal?: () => void;
  onChat?: () => void;
}

export function ContractDetailDrawer({
  isOpen,
  onClose,
  data,
  onPaymentRequest,
  onOtherProposal,
  onChat,
}: ContractDetailDrawerProps) {
  const t = useTranslations('host.contracts.detail');
  const [isAdditionalInfoOpen, setIsAdditionalInfoOpen] = useState(false);

  if (!data) return null;

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR') + t('won');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full bg-white z-50 transform transition-transform duration-300 ease-out overflow-y-auto
          w-full md:w-[420px] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--snug-border))] md:border-b-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-[hsl(var(--snug-text-primary))]">{t('title')}</h2>
            <span className="px-2 py-0.5 text-xs font-medium text-[hsl(var(--snug-orange))] border border-[hsl(var(--snug-orange))] rounded-full">
              {t('inquiry', { date: data.inquiryDate })}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-[hsl(var(--snug-light-gray))] rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-[hsl(var(--snug-text-primary))]" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-4 pb-48 md:pb-8">
          {/* Guest Info with Thumbnail */}
          <div className="flex gap-4 mb-4">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-[hsl(var(--snug-light-gray))]">
              <Image
                src={data.thumbnailUrl}
                alt={data.propertyName}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-[hsl(var(--snug-text-primary))]">
                {data.guestName}
              </p>
              <p className="text-xs text-[hsl(var(--snug-gray))]">
                {data.checkInDate} - {data.checkOutDate}
              </p>
              <p className="text-sm text-[hsl(var(--snug-text-primary))]">{data.propertyName}</p>
              <p className="text-sm font-bold text-[hsl(var(--snug-text-primary))]">
                {data.roomNumber}
              </p>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-[hsl(var(--snug-border))] mb-4" />

          {/* Guest Count & Price Summary */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                {t('guestCount')}
              </span>
              <span className="text-sm font-bold text-[hsl(var(--snug-text-primary))]">
                {t('guestCountValue', { count: data.guestCount })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                {t('nightsExcludingUtilities', { count: data.nights })}
              </span>
              <span className="text-sm font-bold text-[hsl(var(--snug-text-primary))]">
                {formatPrice(data.basePrice)}
              </span>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-[hsl(var(--snug-border))] mb-4" />

          {/* Detail Request */}
          <div className="mb-4">
            <p className="text-sm font-bold text-[hsl(var(--snug-text-primary))] mb-2">
              {t('detailRequest')}
            </p>
            <p className="text-sm text-[hsl(var(--snug-text-primary))] leading-relaxed whitespace-pre-line">
              {data.detailRequest}
            </p>
          </div>

          {/* Basic Info Box */}
          <div className="bg-[hsl(var(--snug-light-gray))] rounded-lg p-4 mb-4">
            <p className="text-sm font-bold text-[hsl(var(--snug-text-primary))] mb-3">
              {t('basicInfo')}
            </p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-[hsl(var(--snug-gray))]">{t('contractorName')}</span>
                <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                  {data.guestName} ({data.guestGender})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[hsl(var(--snug-gray))]">{t('contact')}</span>
                <span className="text-sm text-[hsl(var(--snug-text-primary))]">{data.contact}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[hsl(var(--snug-gray))]">{t('email')}</span>
                <span className="text-sm text-[hsl(var(--snug-text-primary))]">{data.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[hsl(var(--snug-gray))]">{t('passportNumber')}</span>
                <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                  {data.passportNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[hsl(var(--snug-gray))]">{t('residentNumber')}</span>
                <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                  {data.residentNumber}
                </span>
              </div>
            </div>

            {/* Additional Info Section */}
            <div className="mt-4">
              <p className="text-sm font-bold text-[hsl(var(--snug-text-primary))] mb-3">
                {t('additionalInfo')}
              </p>

              {isAdditionalInfoOpen && (
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-[hsl(var(--snug-gray))]">{t('purpose')}</span>
                    <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                      {data.purpose}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[hsl(var(--snug-gray))]">{t('payer')}</span>
                    <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                      {data.payer}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[hsl(var(--snug-gray))]">{t('bankAccount')}</span>
                    <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                      {data.bankAccount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[hsl(var(--snug-gray))]">{t('paymentDate')}</span>
                    <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                      {data.paymentDate}
                    </span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsAdditionalInfoOpen(!isAdditionalInfoOpen)}
                className="flex items-center gap-1 text-sm text-[hsl(var(--snug-text-primary))] mx-auto"
              >
                {isAdditionalInfoOpen ? t('close') : t('showMore')}
                {isAdditionalInfoOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Payment Info */}
            {isAdditionalInfoOpen && (
              <div className="mt-4 pt-4 border-t border-[hsl(var(--snug-border))]">
                <p className="text-sm font-bold text-[hsl(var(--snug-text-primary))] mb-3">
                  {t('paymentInfo')}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-[hsl(var(--snug-gray))]">
                      {t('nightsExcludingUtilities', { count: data.nights })}
                    </span>
                    <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                      {formatPrice(data.basePrice)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[hsl(var(--snug-gray))]">{t('cleaningFee')}</span>
                    <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                      {formatPrice(data.cleaningFee)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[hsl(var(--snug-gray))]">
                      {t('managementFee')}
                    </span>
                    <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                      {formatPrice(data.managementFee)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[hsl(var(--snug-border))]">
                    <span className="text-sm font-bold text-[hsl(var(--snug-text-primary))]">
                      {t('totalAmount')}
                    </span>
                    <span className="text-sm font-bold text-[hsl(var(--snug-text-primary))]">
                      {formatPrice(data.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Memo */}
          {data.memo && (
            <div className="mb-6">
              <p className="text-sm font-bold text-[hsl(var(--snug-text-primary))] mb-2">
                {t('memo')}
              </p>
              <p className="text-sm text-[hsl(var(--snug-text-primary))]">{data.memo}</p>
            </div>
          )}

          {/* Action Buttons - Desktop */}
          <div className="hidden md:block space-y-3">
            <button
              type="button"
              onClick={onPaymentRequest}
              className="w-full py-3 text-sm font-bold text-white bg-[hsl(var(--snug-orange))] rounded-lg hover:opacity-90 transition-opacity"
            >
              {t('paymentRequest')}
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onOtherProposal}
                className="py-3 text-sm font-medium text-[hsl(var(--snug-text-primary))] border border-[hsl(var(--snug-border))] rounded-lg hover:bg-[hsl(var(--snug-light-gray))] transition-colors"
              >
                {t('otherProposal')}
              </button>
              <button
                type="button"
                onClick={onChat}
                className="py-3 text-sm font-medium text-[hsl(var(--snug-text-primary))] border border-[hsl(var(--snug-border))] rounded-lg hover:bg-[hsl(var(--snug-light-gray))] transition-colors"
              >
                {t('oneOnOneChat')}
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons - Mobile Fixed Bottom */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[hsl(var(--snug-border))] space-y-2 md:hidden">
          <button
            type="button"
            onClick={onPaymentRequest}
            className="w-full py-3 text-sm font-bold text-white bg-[hsl(var(--snug-orange))] rounded-lg active:opacity-90 transition-opacity"
          >
            {t('paymentRequest')}
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onOtherProposal}
              className="py-3 text-sm font-medium text-[hsl(var(--snug-text-primary))] border border-[hsl(var(--snug-border))] rounded-lg active:bg-[hsl(var(--snug-light-gray))] transition-colors"
            >
              {t('otherProposal')}
            </button>
            <button
              type="button"
              onClick={onChat}
              className="py-3 text-sm font-medium text-[hsl(var(--snug-text-primary))] border border-[hsl(var(--snug-border))] rounded-lg active:bg-[hsl(var(--snug-light-gray))] transition-colors"
            >
              {t('oneOnOneChat')}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
