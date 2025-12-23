'use client';

import { X } from 'lucide-react';
import Image from 'next/image';
import type { AccommodationListItem } from './types';

interface AccommodationListDetailProps {
  item: AccommodationListItem | null;
  onClose: () => void;
  onEditInfo: (id: string) => void;
  onManagePricing: (id: string) => void;
}

export function AccommodationListDetail({
  item,
  onClose,
  onEditInfo,
  onManagePricing,
}: AccommodationListDetailProps) {
  if (!item) return null;

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  const getDisplayName = () => {
    if (item.groupName) {
      return `${item.roomName.split(' ')[0]} (${item.groupName})`;
    }
    return item.roomName;
  };

  const getRoomNumber = () => {
    // Extract room number from roomName like "Korea Stay 101호" -> "101호"
    const match = item.roomName.match(/(\d+호)/);
    return match ? match[1] : item.roomName;
  };

  return (
    <div className="h-full flex flex-col bg-white border-l border-[hsl(var(--snug-border))]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--snug-border))]">
        <h3 className="text-lg font-bold text-[hsl(var(--snug-text-primary))]">숙소 상세</h3>
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
      <div className="flex-1 overflow-y-auto p-5">
        {/* Photo */}
        <div className="mb-4">
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
            {item.thumbnailUrl ? (
              <Image src={item.thumbnailUrl} alt={item.roomName} fill className="object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-50" />
            )}
          </div>
        </div>

        {/* Title */}
        <div className="mb-6">
          <p className="text-sm text-[hsl(var(--snug-gray))]">{getDisplayName()}</p>
          <p className="text-xl font-bold text-[hsl(var(--snug-text-primary))]">
            {getRoomNumber()}
          </p>
        </div>

        {/* 요금 정보 */}
        <div className="mb-6">
          <h4 className="text-sm font-bold text-[hsl(var(--snug-text-primary))] mb-3">요금 정보</h4>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-[hsl(var(--snug-gray))]">
              {item.pricing.nights}박{' '}
              {item.pricing.includesUtilities ? '(공과금 포함)' : '(공과금 미포함)'}
            </span>
            <span className="text-sm font-medium text-[hsl(var(--snug-text-primary))]">
              {formatPrice(item.pricing.totalPrice)}
            </span>
          </div>
          <button type="button" className="text-sm text-[hsl(var(--snug-text-primary))] underline">
            요금 상세 내용
          </button>
        </div>

        {/* 상세 정보 */}
        <div className="mb-6">
          <h4 className="text-sm font-bold text-[hsl(var(--snug-text-primary))] mb-3">상세 정보</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-[hsl(var(--snug-gray))]">주소</span>
              <span className="text-sm text-[hsl(var(--snug-text-primary))] text-right max-w-[60%]">
                {item.address}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[hsl(var(--snug-gray))]">
                공용공간 (전체 평수: {item.sharedSpace.totalSizeM2}m2)
              </span>
              <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                {item.sharedSpace.description}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[hsl(var(--snug-gray))]">
                개인공간 (방 평수: {item.privateSpace.sizeM2}m2)
              </span>
              <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                {item.privateSpace.description}
              </span>
            </div>
            {item.houseRule && (
              <div className="flex justify-between">
                <span className="text-sm text-[hsl(var(--snug-gray))]">하우스 룰</span>
                <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                  {item.houseRule}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-5 border-t border-[hsl(var(--snug-border))] space-y-3">
        <button
          type="button"
          onClick={() => onEditInfo(item.id)}
          className="w-full py-3 text-sm font-bold text-white bg-[hsl(var(--snug-orange))] rounded-lg hover:opacity-90 transition-opacity"
        >
          숙소 정보 수정
        </button>
        <button
          type="button"
          onClick={() => onManagePricing(item.id)}
          className="w-full py-3 text-sm font-medium text-[hsl(var(--snug-text-primary))] border border-[hsl(var(--snug-border))] rounded-lg hover:bg-[hsl(var(--snug-light-gray))] transition-colors"
        >
          숙소 요금 관리
        </button>
      </div>
    </div>
  );
}
