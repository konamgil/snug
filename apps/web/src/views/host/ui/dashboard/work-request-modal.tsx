'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';

interface WorkRequestData {
  id: string;
  customerName: string;
  inquiryDate: string;
  title: string;
  details: string[];
  preferredDate: string;
  preferredTime: string;
  location: string;
  additionalRequest?: string;
  scheduledDate: string;
  daysAgo: string;
}

interface WorkRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: WorkRequestData | null;
  isServiceDay?: boolean;
  onScheduleChange?: () => void;
  onServiceComplete?: () => void;
}

export type { WorkRequestData };

export function WorkRequestModal({
  isOpen,
  onClose,
  data,
  isServiceDay = false,
  onScheduleChange,
  onServiceComplete,
}: WorkRequestModalProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!isOpen || !data) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-[60]" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-[420px] max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4">
            <h2 className="text-lg font-bold text-[hsl(var(--snug-text-primary))]">
              스너그 호스트 헬퍼
            </h2>
            <span className="text-sm text-[hsl(var(--snug-orange))]">{data.daysAgo}</span>
          </div>

          {/* Content */}
          <div className="px-5 pb-5">
            {/* Guide Section */}
            <div className="mb-4">
              <p className="text-sm text-[hsl(var(--snug-orange))] mb-2">안내</p>
              {isServiceDay ? (
                <p className="text-sm text-[hsl(var(--snug-text-primary))]">
                  오늘은 서비스 방문 예정일입니다.
                  <br />
                  서비스 완료시, 완료 버튼을 클릭해주세요.
                </p>
              ) : (
                <p className="text-sm text-[hsl(var(--snug-text-primary))]">
                  관리인이 {data.scheduledDate}에 방문 예정입니다.
                </p>
              )}
            </div>

            {/* Divider - only for service day */}
            {isServiceDay && <hr className="border-[hsl(var(--snug-border))] mb-4" />}

            {/* Customer Info - only for service day */}
            {isServiceDay && (
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-[hsl(var(--snug-text-primary))]">
                  {data.customerName}
                </span>
                <span className="text-xs text-[hsl(var(--snug-gray))]">
                  문의일시 {data.inquiryDate}
                </span>
              </div>
            )}

            {/* Request Summary Box */}
            <div className="bg-[hsl(var(--snug-light-gray))] rounded-lg p-4 mb-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-bold text-[hsl(var(--snug-text-primary))] flex-1">
                  {data.title}
                </p>
                <div className="relative ml-2">
                  <button
                    type="button"
                    className="p-1 hover:bg-white/50 rounded-full transition-colors"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    onClick={() => setShowTooltip(!showTooltip)}
                  >
                    <Info className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
                  </button>
                  {showTooltip && (
                    <div className="absolute right-0 top-full mt-1 px-3 py-2 bg-[hsl(var(--snug-text-primary))] text-white text-xs rounded-lg whitespace-nowrap z-10">
                      AI로 요약된 요청 건입니다.
                      <div className="absolute -top-1 right-3 w-2 h-2 bg-[hsl(var(--snug-text-primary))] rotate-45" />
                    </div>
                  )}
                </div>
              </div>

              {data.details.map((detail, index) => (
                <p key={index} className="text-sm text-[hsl(var(--snug-text-primary))]">
                  ■ {detail}
                </p>
              ))}

              {/* Additional info - only for service day */}
              {isServiceDay && (
                <div className="mt-4 space-y-2">
                  <div>
                    <p className="text-sm font-bold text-[hsl(var(--snug-text-primary))]">
                      희망일자
                    </p>
                    <p className="text-sm text-[hsl(var(--snug-text-primary))]">
                      {data.preferredDate} {data.preferredTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[hsl(var(--snug-text-primary))]">
                      숙소 위치
                    </p>
                    <p className="text-sm text-[hsl(var(--snug-text-primary))]">{data.location}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Request - only for service day */}
            {isServiceDay && data.additionalRequest && (
              <div className="mb-6">
                <p className="text-sm text-[hsl(var(--snug-orange))] mb-2">추가요청 내용</p>
                <p className="text-sm text-[hsl(var(--snug-text-primary))] leading-relaxed">
                  {data.additionalRequest}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {isServiceDay ? (
              <button
                type="button"
                onClick={onServiceComplete}
                className="w-full py-3 text-sm font-bold text-white bg-[hsl(var(--snug-orange))] rounded-lg hover:opacity-90 transition-opacity"
              >
                서비스 완료
              </button>
            ) : (
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 text-sm font-medium text-[hsl(var(--snug-text-primary))] bg-[hsl(var(--snug-light-gray))] rounded-lg hover:bg-[hsl(var(--snug-border))] transition-colors"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={onScheduleChange}
                  className="flex-1 py-3 text-sm font-bold text-[hsl(var(--snug-orange))] border border-[hsl(var(--snug-orange))] rounded-lg hover:bg-[hsl(var(--snug-orange))]/5 transition-colors"
                >
                  일정 변경 요청
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
