'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { X, ChevronDown, Calendar, Clock } from 'lucide-react';

type ManagerStatus = 'pending' | 'not_started' | 'in_progress' | 'completed';

export interface InquiryDetailData {
  id: string;
  guestName: string;
  inquiryDateTime: string;
  requestType: string;
  requestDetails: string[];
  desiredDate: string;
  location: string;
  keywords: string[];
  managerVisitDate: string;
  managerVisitTime: string;
  managerStatus: ManagerStatus;
}

interface InquiryDetailPanelProps {
  data: InquiryDetailData;
  onClose: () => void;
  onChat: () => void;
}

// Keyword Badge Component
function KeywordBadge({ label, colorKey }: { label: string; colorKey?: string }) {
  // Determine color based on colorKey or label
  const getColors = () => {
    const key = colorKey || label;
    switch (key) {
      case 'cleaning':
      case '청소':
      case 'Cleaning':
        return 'bg-[#d0e2ff] text-[#0043ce]';
      case 'repair':
      case '수리':
      case 'Repair':
        return 'bg-[#ffd7d9] text-[#a2191f]';
      case 'bedding':
      case '침구':
      case 'Bedding':
        return 'bg-[#9ef0f0] text-[#005d5d]';
      default:
        return 'bg-[#e0e0e0] text-[#525252]';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${getColors()}`}>
      {label}
    </span>
  );
}

export function InquiryDetailPanel({ data, onClose, onChat }: InquiryDetailPanelProps) {
  const t = useTranslations('host.operations.detail');
  const tStatus = useTranslations('host.operations.status');
  const [managerStatus, setManagerStatus] = useState<ManagerStatus>(data.managerStatus);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [visitDate, setVisitDate] = useState(data.managerVisitDate);
  const [visitTime, setVisitTime] = useState(data.managerVisitTime);

  const managerStatusOptions: { value: ManagerStatus; label: string }[] = [
    { value: 'pending', label: tStatus('pendingReview') },
    { value: 'not_started', label: tStatus('notStarted') },
    { value: 'in_progress', label: tStatus('scheduled') },
    { value: 'completed', label: tStatus('completed') },
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#f0f0f0]">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-black">{t('title')}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-[#f4f4f4] rounded transition-colors"
          >
            <X className="w-4 h-4 text-[#161616]" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-5 py-4">
        <div className="space-y-5">
          {/* Guest Info */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-black">{data.guestName}</h3>
              <p className="text-xs text-[#525252]">
                {t('inquiryDateTime', { date: data.inquiryDateTime })}
              </p>
            </div>
            <button
              type="button"
              className="text-xs text-[hsl(var(--snug-orange))] hover:underline"
            >
              {t('viewInquiry')}
            </button>
          </div>

          {/* Request Info Box */}
          <div className="bg-[#f4f4f4] rounded-lg p-4">
            <h4 className="text-xs font-bold text-[#161616] mb-2">{data.requestType}</h4>
            <ul className="space-y-1">
              {data.requestDetails.map((detail, index) => (
                <li key={index} className="text-xs text-[#525252] flex items-start gap-1">
                  <span className="mt-1">•</span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 space-y-1">
              <p className="text-xs text-[#161616]">
                <span className="text-[#525252]">{t('preferredDate')} </span>
                <span className="font-medium">{data.desiredDate}</span>
              </p>
              <p className="text-xs text-[#161616]">
                <span className="text-[#525252]">{t('accommodationLocation')} </span>
                <span className="font-medium">{data.location}</span>
              </p>
            </div>
          </div>

          {/* Edit Inquiry Button */}
          <button
            type="button"
            className="w-full py-2.5 border border-[#161616] rounded text-xs font-medium text-[#161616] hover:bg-[#f4f4f4] transition-colors"
          >
            {t('editCustomerInquiry')}
          </button>

          {/* Keywords */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#161616]">{t('keywords')}</h4>
            <div className="flex flex-wrap gap-2">
              {data.keywords.map((keyword, index) => (
                <KeywordBadge key={index} label={keyword} />
              ))}
            </div>
          </div>

          {/* Manager Visit Schedule */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-[#525252]">{t('managerVisitDate')}</label>
                <div className="relative">
                  <input
                    type="text"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full px-3 py-2 border border-[#e0e0e0] rounded text-xs text-[#161616] pr-8"
                  />
                  <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#525252]" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-[#525252]">{t('managerVisitTime')}</label>
                <div className="relative">
                  <input
                    type="text"
                    value={visitTime}
                    onChange={(e) => setVisitTime(e.target.value)}
                    className="w-full px-3 py-2 border border-[#e0e0e0] rounded text-xs text-[#161616] pr-8"
                  />
                  <Clock className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#525252]" />
                </div>
              </div>
            </div>
          </div>

          {/* Manager Status */}
          <div className="space-y-1.5">
            <label className="text-xs text-[#525252]">{t('managerConfirmStatus')}</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="w-full flex items-center justify-between px-3 py-2.5 border border-[#e0e0e0] rounded text-xs text-[#161616]"
              >
                <span>
                  {managerStatusOptions.find((opt) => opt.value === managerStatus)?.label}
                </span>
                <ChevronDown className="w-4 h-4 text-[#525252]" />
              </button>
              {showStatusDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e0e0e0] rounded shadow-lg z-10">
                  {managerStatusOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setManagerStatus(option.value);
                        setShowStatusDropdown(false);
                      }}
                      className={`w-full px-3 py-2.5 text-left text-xs hover:bg-[#f4f4f4] transition-colors ${
                        managerStatus === option.value ? 'bg-[#f4f4f4]' : ''
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Manager Name (shown when status is in_progress or completed) */}
          {(managerStatus === 'in_progress' || managerStatus === 'completed') && (
            <div className="space-y-1.5">
              <label className="text-xs text-[#525252]">{t('managerName')}</label>
              <input
                type="text"
                placeholder={t('managerNamePlaceholder')}
                className="w-full px-3 py-2 border border-[#e0e0e0] rounded text-xs text-[#161616]"
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-[#f0f0f0] space-y-2.5">
        <button
          type="button"
          className="w-full py-3 bg-[hsl(var(--snug-orange))] text-white text-sm font-medium rounded hover:bg-[hsl(var(--snug-orange))]/90 transition-colors"
        >
          {t('workRequest')}
        </button>
        <button
          type="button"
          onClick={onChat}
          className="w-full py-3 border border-[#e0e0e0] text-[#161616] text-sm font-medium rounded hover:bg-[#f4f4f4] transition-colors"
        >
          {t('oneOnOneChat')}
        </button>
      </div>
    </div>
  );
}
