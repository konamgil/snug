'use client';

import { ImagePlus } from 'lucide-react';
import Image from 'next/image';
import type { AccommodationFormData } from './types';

interface AccommodationPreviewPanelProps {
  data: AccommodationFormData;
  contractorName?: string;
}

export function AccommodationPreviewPanel({
  data,
  contractorName = '',
}: AccommodationPreviewPanelProps) {
  const formatPrice = (price: number | undefined) => {
    if (!price) return '-';
    return price.toLocaleString('ko-KR') + '원';
  };

  const getSharedSpaces = () => {
    const spaces: string[] = [];
    if (data.space.rooms.livingRoom > 0) spaces.push('거실');
    if (data.space.rooms.kitchen > 0) spaces.push('부엌');
    if (data.space.rooms.bathroom > 0) spaces.push(`화장실 ${data.space.rooms.bathroom}`);
    return spaces.length > 0 ? spaces.join(', ') : '-';
  };

  const getPrivateSpaces = () => {
    if (data.space.rooms.room > 0) return `방 ${data.space.rooms.room}`;
    return '-';
  };

  const getHouseRules = () => {
    const rules: string[] = [];
    if (data.space.genderRules.includes('male_only')) rules.push('남성전용');
    if (data.space.genderRules.includes('female_only')) rules.push('여성전용');
    if (data.space.genderRules.includes('pet_allowed')) rules.push('반려동물');
    return rules.length > 0 ? rules.join(', ') : '-';
  };

  const hasData =
    data.roomName ||
    data.address ||
    data.pricing.basePrice > 0 ||
    data.mainPhotos.some((cat) => cat.photos.length > 0);

  const getMainPhoto = () => {
    // First photo from "main" category, or first photo from any category
    const mainCategory = data.mainPhotos.find((c) => c.id === 'main');
    if (mainCategory && mainCategory.photos.length > 0) {
      return mainCategory.photos[0];
    }
    for (const category of data.mainPhotos) {
      if (category.photos.length > 0) return category.photos[0];
    }
    return null;
  };

  const mainPhoto = getMainPhoto();
  const allPhotos = data.mainPhotos.flatMap((cat) => cat.photos);

  return (
    <div className="bg-white rounded-lg border border-[hsl(var(--snug-border))] p-5">
      {/* Header */}
      <h3 className="text-lg font-bold text-[hsl(var(--snug-text-primary))] mb-2">
        숙소 간략 보기
      </h3>
      <p className="text-sm text-[hsl(var(--snug-gray))] mb-4">
        왼쪽에 등록된 정보가 다음과 같이 노출됩니다.
      </p>

      {/* Photo Preview */}
      <div className="mb-4">
        {mainPhoto ? (
          <div className="space-y-2">
            {/* Main image */}
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <Image src={mainPhoto.url} alt="Main photo" fill className="object-cover" />
            </div>

            {/* Thumbnail row */}
            {allPhotos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {allPhotos.slice(0, 4).map((photo, index) => (
                  <div
                    key={photo.id}
                    className="relative w-16 h-12 rounded overflow-hidden flex-shrink-0"
                  >
                    <Image
                      src={photo.url}
                      alt={`Photo ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
                {allPhotos.length > 4 && (
                  <div className="w-16 h-12 rounded bg-[hsl(var(--snug-light-gray))] flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-[hsl(var(--snug-gray))]">
                      +{allPhotos.length - 4}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-video bg-[hsl(var(--snug-light-gray))] rounded-lg flex flex-col items-center justify-center">
            <p className="text-sm text-[hsl(var(--snug-gray))]">등록된 사진이 없습니다.</p>
            <ImagePlus className="w-8 h-8 text-[hsl(var(--snug-gray))] mt-2" />
          </div>
        )}
      </div>

      {/* Info Display */}
      <div className="space-y-3">
        {/* Contractor Name */}
        <div>
          <p className="text-xs text-[hsl(var(--snug-gray))]">계약자명</p>
          <p className="text-sm font-medium text-[hsl(var(--snug-text-primary))]">
            {contractorName || '숙소명'}
          </p>
        </div>

        {/* Accommodation Name */}
        {data.roomName && data.groupName && (
          <p className="text-base font-bold text-[hsl(var(--snug-text-primary))]">
            {data.groupName} {data.roomName}호 ({data.groupName})
          </p>
        )}

        {/* Info Table */}
        <div className="space-y-2 pt-2 border-t border-[hsl(var(--snug-border))]">
          <div className="flex justify-between">
            <span className="text-sm text-[hsl(var(--snug-gray))]">기본 요금(1박)</span>
            <span className="text-sm text-[hsl(var(--snug-text-primary))]">
              {formatPrice(data.pricing.basePrice)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-[hsl(var(--snug-gray))]">관리비</span>
            <span className="text-sm text-[hsl(var(--snug-text-primary))]">
              {formatPrice(data.pricing.managementFee)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-[hsl(var(--snug-gray))]">주소</span>
            <span className="text-sm text-[hsl(var(--snug-text-primary))] text-right max-w-[60%]">
              {data.address || '-'}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-[hsl(var(--snug-gray))]">공용공간</span>
            <span className="text-sm text-[hsl(var(--snug-text-primary))]">
              {getSharedSpaces()}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-[hsl(var(--snug-gray))]">개인공간</span>
            <span className="text-sm text-[hsl(var(--snug-text-primary))]">
              {getPrivateSpaces()}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-[hsl(var(--snug-gray))]">하우스 룰</span>
            <span className="text-sm text-[hsl(var(--snug-text-primary))]">{getHouseRules()}</span>
          </div>
        </div>
      </div>

      {/* Preview Button */}
      <button
        type="button"
        disabled={!hasData}
        className={`w-full mt-6 py-3 text-sm font-medium rounded-lg transition-colors ${
          hasData
            ? 'bg-[hsl(var(--snug-orange))] text-white hover:opacity-90'
            : 'bg-[hsl(var(--snug-light-gray))] text-[hsl(var(--snug-gray))] cursor-not-allowed'
        }`}
      >
        숙소 상세 미리 보기
      </button>
    </div>
  );
}
