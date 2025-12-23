'use client';

import { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';

export type ContractStatus =
  | 'inquiry' // 문의
  | 'pending' // 계약 신청
  | 'confirmed' // 예약 확정
  | 'checkin_soon' // 체크인 예정
  | 'checkout_soon' // 체크아웃 예정 / 퇴실 D-X
  | 'staying' // 입주 중
  | 'completed' // 퇴실 완료
  | 'rejected' // 거절
  | 'cancelled'; // 취소/환불

export interface ContractPanelData {
  id: string;
  status: ContractStatus;
  statusLabel: string; // e.g., "문의 03.01", "퇴실 D-1"
  guestName: string;
  guestGender: string;
  checkInDate: string;
  checkOutDate: string;
  propertyName: string;
  roomNumber: string;
  thumbnailUrl: string;
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

interface ContractDetailPanelProps {
  data: ContractPanelData | null;
  onClose?: () => void;
  showCloseButton?: boolean;
  // Action handlers based on status
  onConfirmReservation?: () => void;
  onPaymentRequest?: () => void;
  onOtherProposal?: () => void;
  onChat?: () => void;
  onViewContract?: () => void;
}

function getStatusBadgeStyle(status: ContractStatus): string {
  switch (status) {
    case 'inquiry':
    case 'pending':
      return 'text-[hsl(var(--snug-orange))] border-[hsl(var(--snug-orange))]';
    case 'checkout_soon':
    case 'completed':
    case 'rejected':
    case 'cancelled':
      return 'text-[hsl(var(--snug-gray))] border-[hsl(var(--snug-gray))]';
    default:
      return 'text-[hsl(var(--snug-orange))] border-[hsl(var(--snug-orange))]';
  }
}

export function ContractDetailPanel({
  data,
  onClose,
  showCloseButton = true,
  onConfirmReservation,
  onPaymentRequest,
  onOtherProposal,
  onChat,
  onViewContract,
}: ContractDetailPanelProps) {
  const [isAdditionalInfoOpen, setIsAdditionalInfoOpen] = useState(false);

  if (!data) return null;

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  // Determine which action buttons to show based on status
  const renderActionButtons = () => {
    switch (data.status) {
      case 'inquiry':
      case 'pending':
        // Show: 예약 확정 (orange), 다른 제안 (outline)
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onOtherProposal}
                className="py-3 text-sm font-medium text-[hsl(var(--snug-text-primary))] border border-[hsl(var(--snug-border))] rounded-lg hover:bg-[hsl(var(--snug-light-gray))] transition-colors"
              >
                다른 제안
              </button>
              <button
                type="button"
                onClick={onConfirmReservation}
                className="py-3 text-sm font-bold text-white bg-[hsl(var(--snug-orange))] rounded-lg hover:opacity-90 transition-opacity"
              >
                예약 확정
              </button>
            </div>
          </div>
        );

      case 'confirmed':
      case 'checkin_soon':
      case 'staying':
        // Show: 결제 요청 (orange), 다른 제안, 1:1 채팅
        return (
          <div className="space-y-3">
            <button
              type="button"
              onClick={onPaymentRequest}
              className="w-full py-3 text-sm font-bold text-white bg-[hsl(var(--snug-orange))] rounded-lg hover:opacity-90 transition-opacity"
            >
              결제 요청
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onOtherProposal}
                className="py-3 text-sm font-medium text-[hsl(var(--snug-text-primary))] border border-[hsl(var(--snug-border))] rounded-lg hover:bg-[hsl(var(--snug-light-gray))] transition-colors"
              >
                다른 제안
              </button>
              <button
                type="button"
                onClick={onChat}
                className="py-3 text-sm font-medium text-[hsl(var(--snug-text-primary))] border border-[hsl(var(--snug-border))] rounded-lg hover:bg-[hsl(var(--snug-light-gray))] transition-colors"
              >
                1:1 채팅
              </button>
            </div>
          </div>
        );

      case 'checkout_soon':
      case 'completed':
        // Show: 계약서 확인 (gray outline)
        return (
          <button
            type="button"
            onClick={onViewContract}
            className="w-full py-3 text-sm font-medium text-[hsl(var(--snug-text-primary))] border border-[hsl(var(--snug-border))] rounded-lg hover:bg-[hsl(var(--snug-light-gray))] transition-colors"
          >
            계약서 확인
          </button>
        );

      case 'rejected':
      case 'cancelled':
        // Show: 계약서 확인 (gray outline)
        return (
          <button
            type="button"
            onClick={onViewContract}
            className="w-full py-3 text-sm font-medium text-[hsl(var(--snug-text-primary))] border border-[hsl(var(--snug-border))] rounded-lg hover:bg-[hsl(var(--snug-light-gray))] transition-colors"
          >
            계약서 확인
          </button>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--snug-border))]">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-[hsl(var(--snug-text-primary))]">계약 내용 상세</h2>
          <span
            className={`px-2 py-0.5 text-xs font-medium border rounded-full ${getStatusBadgeStyle(data.status)}`}
          >
            {data.statusLabel}
          </span>
        </div>
        {showCloseButton && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-[hsl(var(--snug-light-gray))] rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-[hsl(var(--snug-text-primary))]" />
          </button>
        )}
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {/* Guest Info with Thumbnail */}
        <div className="flex gap-4 mb-4">
          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-[hsl(var(--snug-light-gray))]">
            <Image
              src={data.thumbnailUrl}
              alt={data.propertyName}
              width={64}
              height={64}
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
            <span className="text-sm text-[hsl(var(--snug-text-primary))]">인원</span>
            <span className="text-sm font-bold text-[hsl(var(--snug-text-primary))]">
              {data.guestCount}명
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-[hsl(var(--snug-text-primary))]">
              {data.nights}박 (공과금 미포함)
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
            상세 요구사항
          </p>
          <p className="text-sm text-[hsl(var(--snug-text-primary))] leading-relaxed whitespace-pre-line">
            {data.detailRequest}
          </p>
        </div>

        {/* Basic Info Box */}
        <div className="bg-[hsl(var(--snug-light-gray))] rounded-lg p-4 mb-4">
          <p className="text-sm font-bold text-[hsl(var(--snug-text-primary))] mb-3">기본 정보</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-[hsl(var(--snug-gray))]">계약자명</span>
              <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                {data.guestName} ({data.guestGender})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[hsl(var(--snug-gray))]">연락처</span>
              <span className="text-sm text-[hsl(var(--snug-text-primary))]">{data.contact}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[hsl(var(--snug-gray))]">이메일</span>
              <span className="text-sm text-[hsl(var(--snug-text-primary))]">{data.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[hsl(var(--snug-gray))]">여권번호</span>
              <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                {data.passportNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[hsl(var(--snug-gray))]">주민번호</span>
              <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                {data.residentNumber}
              </span>
            </div>
          </div>

          {/* Additional Info Section */}
          <div className="mt-4">
            <p className="text-sm font-bold text-[hsl(var(--snug-text-primary))] mb-3">부가 정보</p>

            {isAdditionalInfoOpen && (
              <div className="space-y-2 mb-3">
                <div className="flex justify-between">
                  <span className="text-sm text-[hsl(var(--snug-gray))]">거주 목적</span>
                  <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                    {data.purpose}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[hsl(var(--snug-gray))]">결제자</span>
                  <span className="text-sm text-[hsl(var(--snug-text-primary))]">{data.payer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[hsl(var(--snug-gray))]">계좌</span>
                  <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                    {data.bankAccount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[hsl(var(--snug-gray))]">결제일</span>
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
              {isAdditionalInfoOpen ? '닫기' : '더보기'}
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
                결제 정보
              </p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-[hsl(var(--snug-gray))]">
                    {data.nights}박 (공과금 미포함)
                  </span>
                  <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                    {formatPrice(data.basePrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[hsl(var(--snug-gray))]">청소비</span>
                  <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                    {formatPrice(data.cleaningFee)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[hsl(var(--snug-gray))]">관리비</span>
                  <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                    {formatPrice(data.managementFee)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[hsl(var(--snug-border))]">
                  <span className="text-sm font-bold text-[hsl(var(--snug-text-primary))]">
                    총 금액
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
            <p className="text-sm font-bold text-[hsl(var(--snug-text-primary))] mb-2">기타 메모</p>
            <p className="text-sm text-[hsl(var(--snug-text-primary))]">{data.memo}</p>
          </div>
        )}
      </div>

      {/* Action Buttons - Fixed at bottom */}
      <div className="border-t border-[hsl(var(--snug-border))] p-4">{renderActionButtons()}</div>
    </div>
  );
}
