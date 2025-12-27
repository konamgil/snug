'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { X, Calendar, Clock, ChevronDown } from 'lucide-react';

export interface OperationDetailData {
  id: string;
  customerName: string;
  inquiryDate: string;
  title: string;
  details: string[];
  preferredDate: string;
  preferredTime: string;
  location: string;
  keywords: string[];
}

interface OperationDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: OperationDetailData | null;
  onWorkRequest?: () => void;
}

type ConfirmStatus = 'pending' | 'not_started' | 'in_progress' | 'completed';

export function OperationDetailDrawer({
  isOpen,
  onClose,
  data,
  onWorkRequest,
}: OperationDetailDrawerProps) {
  const t = useTranslations('host.operations.detail');
  const tStatus = useTranslations('host.operations.status');
  const [visitDate, setVisitDate] = useState('25.09.12');
  const [visitTime, setVisitTime] = useState('10:00');
  const [confirmStatus, setConfirmStatus] = useState<ConfirmStatus>('in_progress');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [managerName, setManagerName] = useState('');
  const [hostMemo, setHostMemo] = useState('');
  const [partnerMemo, setPartnerMemo] = useState('');

  const STATUS_OPTIONS: { id: ConfirmStatus; label: string }[] = [
    { id: 'pending', label: tStatus('pendingReview') },
    { id: 'not_started', label: tStatus('notStarted') },
    { id: 'in_progress', label: tStatus('scheduled') },
    { id: 'completed', label: tStatus('completed') },
  ];

  if (!data) return null;

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
          <h2 className="text-lg font-bold text-[hsl(var(--snug-text-primary))]">{t('title')}</h2>
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
        <div className="px-5 py-4 pb-32 md:pb-8">
          {/* Customer Info */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-base font-bold text-[hsl(var(--snug-text-primary))]">
                {data.customerName}
              </p>
              <p className="text-xs text-[hsl(var(--snug-gray))]">
                {t('inquiryDateTime', { date: data.inquiryDate })}
              </p>
            </div>
            <button
              type="button"
              className="text-sm text-[hsl(var(--snug-orange))] hover:underline"
            >
              {t('viewInquiry')}
            </button>
          </div>

          {/* Inquiry Details Box */}
          <div className="bg-[hsl(var(--snug-light-gray))] rounded-lg p-4 mb-4">
            <p className="text-sm font-bold text-[hsl(var(--snug-text-primary))] mb-2">
              {data.title}
            </p>
            {data.details.map((detail, index) => (
              <p key={index} className="text-sm text-[hsl(var(--snug-text-primary))]">
                ■ {detail}
              </p>
            ))}
            <div className="mt-3 space-y-1">
              <p className="text-sm text-[hsl(var(--snug-text-primary))]">
                <span className="text-[hsl(var(--snug-gray))]">{t('preferredDate')}</span>{' '}
                <span className="font-bold">
                  {data.preferredDate} {data.preferredTime}
                </span>
              </p>
              <p className="text-sm text-[hsl(var(--snug-text-primary))]">
                <span className="text-[hsl(var(--snug-gray))]">{t('accommodationLocation')}</span>{' '}
                <span className="font-bold">{data.location}</span>
              </p>
            </div>
          </div>

          {/* Edit Button */}
          <button
            type="button"
            className="w-full py-3 text-sm font-medium text-[hsl(var(--snug-text-primary))] border border-[hsl(var(--snug-border))] rounded-lg hover:bg-[hsl(var(--snug-light-gray))] transition-colors mb-6"
          >
            {t('editCustomerInquiry')}
          </button>

          {/* Keywords */}
          <div className="mb-6">
            <p className="text-sm text-[hsl(var(--snug-gray))] mb-2">{t('keywords')}</p>
            <div className="flex flex-wrap gap-2">
              {data.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="px-3 py-1 text-sm text-[hsl(var(--snug-orange))] bg-[hsl(var(--snug-orange))]/10 border border-[hsl(var(--snug-orange))] rounded-full"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          {/* Visit Date/Time */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <p className="text-sm text-[hsl(var(--snug-gray))] mb-2">{t('managerVisitDate')}</p>
              <div className="relative">
                <input
                  type="text"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full px-3 py-2.5 pr-10 text-sm border border-[hsl(var(--snug-border))] rounded-lg focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--snug-gray))]" />
              </div>
            </div>
            <div>
              <p className="text-sm text-[hsl(var(--snug-gray))] mb-2">{t('managerVisitTime')}</p>
              <div className="relative">
                <input
                  type="text"
                  value={visitTime}
                  onChange={(e) => setVisitTime(e.target.value)}
                  className="w-full px-3 py-2.5 pr-10 text-sm border border-[hsl(var(--snug-border))] rounded-lg focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                />
                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--snug-gray))]" />
              </div>
            </div>
          </div>

          {/* Confirm Status Dropdown */}
          <div className="mb-4">
            <p className="text-sm text-[hsl(var(--snug-gray))] mb-2">{t('managerConfirmStatus')}</p>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="w-full px-3 py-2.5 text-sm text-left border border-[hsl(var(--snug-border))] rounded-lg flex items-center justify-between focus:outline-none focus:border-[hsl(var(--snug-orange))]"
              >
                <span>{STATUS_OPTIONS.find((s) => s.id === confirmStatus)?.label}</span>
                <ChevronDown className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
              </button>
              {isStatusDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsStatusDropdownOpen(false)}
                  />
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[hsl(var(--snug-border))] rounded-lg shadow-lg z-20 overflow-hidden">
                    {STATUS_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setConfirmStatus(option.id);
                          setIsStatusDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-sm text-left border-b border-[hsl(var(--snug-border))] last:border-b-0 ${
                          confirmStatus === option.id
                            ? 'bg-[hsl(var(--snug-light-gray))] text-[hsl(var(--snug-text-primary))] font-medium'
                            : 'text-[hsl(var(--snug-text-primary))] hover:bg-[hsl(var(--snug-light-gray))]'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Manager Name */}
          <div className="mb-4">
            <p className="text-sm text-[hsl(var(--snug-gray))] mb-2">{t('managerName')}</p>
            <input
              type="text"
              value={managerName}
              onChange={(e) => setManagerName(e.target.value)}
              placeholder=""
              className="w-full px-3 py-2.5 text-sm border border-[hsl(var(--snug-border))] rounded-lg bg-[hsl(var(--snug-light-gray))] focus:outline-none focus:border-[hsl(var(--snug-orange))]"
            />
          </div>

          {/* Host Memo */}
          <div className="mb-4">
            <p className="text-sm text-[hsl(var(--snug-gray))] mb-2">{t('hostMemo')}</p>
            <textarea
              value={hostMemo}
              onChange={(e) => setHostMemo(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 text-sm border border-[hsl(var(--snug-border))] rounded-lg resize-none focus:outline-none focus:border-[hsl(var(--snug-orange))]"
            />
          </div>

          {/* Partner Memo */}
          <div className="mb-6">
            <p className="text-sm text-[hsl(var(--snug-gray))] mb-2">{t('partnerMemo')}</p>
            <textarea
              value={partnerMemo}
              onChange={(e) => setPartnerMemo(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 text-sm border border-[hsl(var(--snug-border))] rounded-lg bg-[hsl(var(--snug-light-gray))] resize-none focus:outline-none focus:border-[hsl(var(--snug-orange))]"
            />
          </div>

          {/* Action Buttons - Desktop */}
          <div className="hidden md:block space-y-3">
            <button
              type="button"
              onClick={onWorkRequest}
              className="w-full py-3 text-sm font-bold text-white bg-[hsl(var(--snug-orange))] rounded-lg hover:opacity-90 transition-opacity"
            >
              {t('workRequest')}
            </button>
            <button
              type="button"
              className="w-full py-3 text-sm font-medium text-[hsl(var(--snug-text-primary))] bg-[hsl(var(--snug-light-gray))] rounded-lg hover:bg-[hsl(var(--snug-border))] transition-colors"
            >
              {t('oneOnOneChat')}
            </button>
          </div>
        </div>

        {/* Action Buttons - Mobile Fixed Bottom */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[hsl(var(--snug-border))] space-y-2 md:hidden">
          <button
            type="button"
            onClick={onWorkRequest}
            className="w-full py-3 text-sm font-bold text-white bg-[hsl(var(--snug-orange))] rounded-lg active:opacity-90 transition-opacity"
          >
            {t('workRequest')}
          </button>
          <button
            type="button"
            className="w-full py-3 text-sm font-medium text-[hsl(var(--snug-text-primary))] bg-[hsl(var(--snug-light-gray))] rounded-lg active:bg-[hsl(var(--snug-border))] transition-colors"
          >
            {t('oneOnOneChat')}
          </button>
        </div>
      </aside>
    </>
  );
}
