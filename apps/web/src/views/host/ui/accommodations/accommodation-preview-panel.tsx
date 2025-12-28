'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ImagePlus } from 'lucide-react';
import Image from 'next/image';
import type { AccommodationFormData } from './types';
import { AccommodationPreviewModal } from './accommodation-preview-modal';

interface AccommodationPreviewPanelProps {
  data: AccommodationFormData;
  contractorName?: string;
  accommodationId?: string; // 편집 모드에서 유사 숙소 조회용
}

export function AccommodationPreviewPanel({
  data,
  contractorName = '',
  accommodationId,
}: AccommodationPreviewPanelProps) {
  const t = useTranslations('host.accommodation.previewPanel');
  const tSpaceTypes = useTranslations('host.accommodation.spaceTypes');
  const tGenderRules = useTranslations('host.accommodation.genderRules');

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const formatPrice = (price: number | undefined) => {
    if (!price) return '-';
    return price.toLocaleString('ko-KR') + '원';
  };

  const getSharedSpaces = () => {
    const spaces: string[] = [];
    if (data.space.rooms.livingRoom > 0) spaces.push(tSpaceTypes('livingRoom'));
    if (data.space.rooms.kitchen > 0) spaces.push(tSpaceTypes('kitchen'));
    if (data.space.rooms.bathroom > 0)
      spaces.push(`${tSpaceTypes('bathroom')} ${data.space.rooms.bathroom}`);
    return spaces.length > 0 ? spaces.join(', ') : '-';
  };

  const getPrivateSpaces = () => {
    if (data.space.rooms.room > 0) return `${tSpaceTypes('room')} ${data.space.rooms.room}`;
    return '-';
  };

  const getHouseRules = () => {
    const rules: string[] = [];
    if (data.space.genderRules.includes('male_only')) rules.push(tGenderRules('male_only'));
    if (data.space.genderRules.includes('female_only')) rules.push(tGenderRules('female_only'));
    if (data.space.genderRules.includes('pet_allowed')) rules.push(tGenderRules('pet_allowed'));
    return rules.length > 0 ? rules.join(', ') : '-';
  };

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
      <h3 className="text-lg font-bold text-[hsl(var(--snug-text-primary))] mb-2">{t('title')}</h3>
      <p className="text-sm text-[hsl(var(--snug-gray))] mb-4">{t('description')}</p>

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
            <p className="text-sm text-[hsl(var(--snug-gray))]">{t('noPhotos')}</p>
            <ImagePlus className="w-8 h-8 text-[hsl(var(--snug-gray))] mt-2" />
          </div>
        )}
      </div>

      {/* Info Display */}
      <div className="space-y-3">
        {/* Contractor Name */}
        <div>
          <p className="text-xs text-[hsl(var(--snug-gray))]">{t('contractorName')}</p>
          <p className="text-sm font-medium text-[hsl(var(--snug-text-primary))]">
            {contractorName || t('accommodationName')}
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
            <span className="text-sm text-[hsl(var(--snug-gray))]">{t('basePrice')}</span>
            <span className="text-sm text-[hsl(var(--snug-text-primary))]">
              {formatPrice(data.pricing.basePrice)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-[hsl(var(--snug-gray))]">{t('managementFee')}</span>
            <span className="text-sm text-[hsl(var(--snug-text-primary))]">
              {formatPrice(data.pricing.managementFee)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-[hsl(var(--snug-gray))]">{t('address')}</span>
            <span className="text-sm text-[hsl(var(--snug-text-primary))] text-right max-w-[60%]">
              {data.address || '-'}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-[hsl(var(--snug-gray))]">{t('sharedSpace')}</span>
            <span className="text-sm text-[hsl(var(--snug-text-primary))]">
              {getSharedSpaces()}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-[hsl(var(--snug-gray))]">{t('privateSpace')}</span>
            <span className="text-sm text-[hsl(var(--snug-text-primary))]">
              {getPrivateSpaces()}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-[hsl(var(--snug-gray))]">{t('houseRules')}</span>
            <span className="text-sm text-[hsl(var(--snug-text-primary))]">{getHouseRules()}</span>
          </div>
        </div>
      </div>

      {/* Preview Button */}
      <button
        type="button"
        onClick={() => setIsPreviewModalOpen(true)}
        className="w-full mt-6 py-3 text-sm font-medium rounded-lg transition-colors bg-[hsl(var(--snug-orange))] text-white hover:opacity-90"
      >
        {t('previewDetail')}
      </button>

      {/* Preview Modal */}
      <AccommodationPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        data={data}
        accommodationId={accommodationId}
      />
    </div>
  );
}
