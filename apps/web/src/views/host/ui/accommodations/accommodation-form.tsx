'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, HelpCircle, Plus, Minus, X, AlertCircle, CheckCircle } from 'lucide-react';
import { PhotoUploadSection } from './photo-upload-section';
import { PhotoUploadModal } from './photo-upload-modal';
import { PhotoGalleryModal } from './photo-gallery-modal';
import { FacilityModal, AmenityModal, ManagerModal } from './selection-modal';
import { AddressSearchModal } from './address-search-modal';
import { AdditionalFeeModal } from './additional-fee-modal';
import type {
  AccommodationFormData,
  AccommodationType,
  AdditionalFeeItem,
  BuildingType,
  GenderRule,
  ManagerInfo,
  PhotoCategory,
} from './types';
import type { GroupItem } from './group-management-modal';
import {
  ACCOMMODATION_TYPE_OPTIONS,
  BUILDING_TYPE_OPTIONS,
  WEEKDAY_OPTIONS,
  DEFAULT_FORM_DATA,
} from './types';

interface AccommodationFormProps {
  initialData?: AccommodationFormData;
  onChange: (data: AccommodationFormData) => void;
  groups?: GroupItem[];
  onAddGroup?: (groupName: string) => void;
  onDeleteGroup?: (groupId: string) => void;
}

export function AccommodationForm({
  initialData = DEFAULT_FORM_DATA,
  onChange,
  groups = [],
  onAddGroup,
  onDeleteGroup,
}: AccommodationFormProps) {
  const t = useTranslations('host.accommodation.form');
  const tCommon = useTranslations('common');
  const tSpaceTypes = useTranslations('host.accommodation.spaceTypes');
  const tBedTypes = useTranslations('host.accommodation.bedTypes');
  const tFacilities = useTranslations('host.facilities');
  const tAmenities = useTranslations('host.amenities');
  const tAccommodationTypes = useTranslations('host.accommodation.accommodationTypes');
  const tBuildingTypes = useTranslations('host.accommodation.buildingTypes');
  const tWeekdays = useTranslations('host.accommodation.weekdays');
  const tValidation = useTranslations('host.accommodation.form.validation');
  const tPublishGate = useTranslations('host.accommodation.form.publishGate');
  const [data, setData] = useState<AccommodationFormData>(initialData);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isUsageTypeTooltipOpen, setIsUsageTypeTooltipOpen] = useState(false);
  const [isStayTooltipOpen, setIsStayTooltipOpen] = useState(false);

  // Mark field as touched on blur
  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Validation errors
  const errors = useMemo(() => {
    const errs: Record<string, string> = {};

    if (!data.roomName || data.roomName.trim() === '') {
      errs.roomName = tValidation('roomNameRequired');
    } else if (data.roomName.length > 100) {
      errs.roomName = tValidation('roomNameMaxLength');
    }

    if (!data.address || data.address.trim() === '') {
      errs.address = tValidation('addressRequired');
    }

    if (!data.accommodationType) {
      errs.accommodationType = tValidation('accommodationTypeRequired');
    }

    if (!data.usageTypes || data.usageTypes.length === 0) {
      errs.usageTypes = tValidation('usageTypesRequired');
    }

    // mainPhotos - at least 1 photo required
    const hasPhotos = data.mainPhotos.some((cat) => cat.photos.length > 0);
    if (!hasPhotos) {
      errs.mainPhotos = tValidation('mainPhotosRequired');
    }

    // rooms - at least 1 room required
    const { rooms } = data.space;
    const totalRooms =
      rooms.room + rooms.livingRoom + rooms.kitchen + rooms.bathroom + rooms.terrace;
    if (totalRooms === 0) {
      errs.rooms = tValidation('roomsRequired');
    }

    if (data.pricing.basePrice < 0) {
      errs.basePrice = tValidation('basePriceMin');
    }

    if (data.space.capacity < 1) {
      errs.capacity = tValidation('capacityMin');
    }

    return errs;
  }, [data, tValidation]);

  // Publish gate check (includes all BLOCKING validations + additional quality requirements)
  const publishGateStatus = useMemo(() => {
    const photoCount = data.mainPhotos.reduce((acc, cat) => acc + cat.photos.length, 0);
    const introLength = data.space.introduction?.length || 0;
    const basePrice = data.pricing.basePrice;
    const { rooms } = data.space;
    const totalRooms =
      rooms.room + rooms.livingRoom + rooms.kitchen + rooms.bathroom + rooms.terrace;

    // BLOCKING validations
    const roomNamePassed = data.roomName && data.roomName.trim().length > 0;
    const addressPassed = data.address && data.address.trim().length > 0;
    const accommodationTypePassed = !!data.accommodationType;
    const usageTypesPassed = data.usageTypes && data.usageTypes.length > 0;
    const photosPassed = photoCount >= 1;
    const roomsPassed = totalRooms > 0;
    const capacityPassed = data.space.capacity >= 1;

    // Publish gate additional requirements
    const introductionPassed = introLength >= 50;
    const basePricePassed = basePrice > 0;

    const canPublish =
      roomNamePassed &&
      addressPassed &&
      accommodationTypePassed &&
      usageTypesPassed &&
      photosPassed &&
      roomsPassed &&
      capacityPassed &&
      introductionPassed &&
      basePricePassed;

    return {
      roomName: { passed: roomNamePassed },
      address: { passed: addressPassed },
      accommodationType: { passed: accommodationTypePassed },
      usageTypes: { passed: usageTypesPassed },
      photos: { passed: photosPassed, current: photoCount },
      rooms: { passed: roomsPassed },
      capacity: { passed: capacityPassed, current: data.space.capacity },
      introduction: { passed: introductionPassed, current: introLength },
      basePrice: { passed: basePricePassed, current: basePrice },
      canPublish,
    };
  }, [data]);

  // Sync internal state when initialData changes (for edit mode)
  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const [isFacilityModalOpen, setIsFacilityModalOpen] = useState(false);
  const [isAmenityModalOpen, setIsAmenityModalOpen] = useState(false);
  const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);
  const [isAccommodationTypeOpen, setIsAccommodationTypeOpen] = useState(false);
  const [isBuildingTypeOpen, setIsBuildingTypeOpen] = useState(false);
  const [isMinDaysOpen, setIsMinDaysOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isPhotoUploadModalOpen, setIsPhotoUploadModalOpen] = useState(false);
  const [isPhotoGalleryModalOpen, setIsPhotoGalleryModalOpen] = useState(false);
  const [isAdditionalFeeModalOpen, setIsAdditionalFeeModalOpen] = useState(false);
  const [galleryInitialCategoryId, setGalleryInitialCategoryId] = useState<string>('main');
  const [galleryCategories, setGalleryCategories] = useState<PhotoCategory[]>([]);
  const [galleryOpenedFrom, setGalleryOpenedFrom] = useState<'main' | 'uploadModal'>('main');
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
  const [isAddingNewGroup, setIsAddingNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const updateData = (updates: Partial<AccommodationFormData>) => {
    const newData = { ...data, ...updates };
    setData(newData);
    onChange(newData);
  };

  const updatePricing = (updates: Partial<AccommodationFormData['pricing']>) => {
    updateData({ pricing: { ...data.pricing, ...updates } });
  };

  const updateSpace = (updates: Partial<AccommodationFormData['space']>) => {
    updateData({ space: { ...data.space, ...updates } });
  };

  const updateRoomCount = (key: keyof AccommodationFormData['space']['rooms'], value: number) => {
    updateSpace({ rooms: { ...data.space.rooms, [key]: Math.max(0, value) } });
  };

  const updateBedCount = (key: keyof AccommodationFormData['space']['beds'], value: number) => {
    updateSpace({ beds: { ...data.space.beds, [key]: Math.max(0, value) } });
  };

  const toggleWeekendDay = (day: string) => {
    const newDays = data.pricing.weekendDays.includes(day)
      ? data.pricing.weekendDays.filter((d) => d !== day)
      : [...data.pricing.weekendDays, day];
    updatePricing({ weekendDays: newDays });
  };

  const toggleGenderRule = (rule: GenderRule) => {
    const newRules = data.space.genderRules.includes(rule)
      ? data.space.genderRules.filter((r) => r !== rule)
      : [...data.space.genderRules, rule];
    updateSpace({ genderRules: newRules });
  };

  // Convert snake_case to camelCase (DB stores snake_case, translations use camelCase)
  const snakeToCamel = (str: string) =>
    str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

  const getFacilityLabel = (id: string) => {
    const camelId = snakeToCamel(id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return tFacilities(camelId as any);
  };

  const getAmenityLabel = (id: string) => {
    const camelId = snakeToCamel(id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return tAmenities(camelId as any);
  };

  const addManager = (manager: Omit<ManagerInfo, 'id'>) => {
    const newManager: ManagerInfo = {
      ...manager,
      id: Date.now().toString(),
    };
    updateData({ managers: [...data.managers, newManager] });
  };

  const addAdditionalFee = (name: string, amount: number) => {
    const newFee: AdditionalFeeItem = {
      id: Date.now().toString(),
      name,
      amount,
    };
    updatePricing({
      additionalFees: [...data.pricing.additionalFees, newFee],
    });
  };

  const removeAdditionalFee = (id: string) => {
    updatePricing({
      additionalFees: data.pricing.additionalFees.filter((fee) => fee.id !== id),
    });
  };

  return (
    <div className="space-y-8">
      {/* 기본 정보 (Basic Information) */}
      <section className="bg-white rounded-lg border border-[hsl(var(--snug-border))] p-6">
        <h2 className="text-lg font-bold text-[hsl(var(--snug-text-primary))] mb-2">
          {t('basicInfo')}
        </h2>
        <p className="text-sm text-[hsl(var(--snug-gray))] mb-6">{t('basicInfoDesc')}</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* 대표 사진 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-[hsl(var(--snug-text-primary))]">
                  {t('mainPhoto')} <span className="text-[hsl(var(--snug-orange))]">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsPhotoUploadModalOpen(true)}
                  className="text-sm text-[hsl(var(--snug-orange))] hover:underline"
                >
                  {t('addPhoto')}
                </button>
              </div>
              <PhotoUploadSection
                categories={data.mainPhotos}
                onChange={(categories) => updateData({ mainPhotos: categories })}
                onAddPhotos={() => setIsPhotoUploadModalOpen(true)}
                onViewGallery={() => {
                  setGalleryCategories(data.mainPhotos);
                  setGalleryInitialCategoryId('main');
                  setGalleryOpenedFrom('main');
                  setIsPhotoGalleryModalOpen(true);
                }}
              />
              {errors.mainPhotos && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.mainPhotos}
                </p>
              )}
            </div>

            {/* 그룹명 */}
            <div className="relative">
              <label className="block text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-2">
                {t('groupNameLabel')}
              </label>
              <button
                type="button"
                onClick={() => setIsGroupDropdownOpen(!isGroupDropdownOpen)}
                className="w-full px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))] flex items-center justify-between bg-white"
              >
                <span
                  className={
                    data.groupName
                      ? 'text-[hsl(var(--snug-text-primary))]'
                      : 'text-[hsl(var(--snug-gray))]'
                  }
                >
                  {data.groupName || t('selectGroup')}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-[hsl(var(--snug-gray))] transition-transform ${isGroupDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isGroupDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => {
                      setIsGroupDropdownOpen(false);
                      setIsAddingNewGroup(false);
                      setNewGroupName('');
                    }}
                  />
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[hsl(var(--snug-border))] rounded-lg shadow-lg z-20 max-h-[200px] overflow-y-auto scrollbar-minimal">
                    {/* 선택 안함 */}
                    <button
                      type="button"
                      onClick={() => {
                        updateData({ groupName: undefined });
                        setIsGroupDropdownOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-[hsl(var(--snug-gray))] hover:bg-[hsl(var(--snug-light-gray))]"
                    >
                      {t('noSelection')}
                    </button>

                    {/* 기존 그룹 목록 */}
                    {groups.map((group, index) => (
                      <div
                        key={group.id || `group-${index}`}
                        className={`flex items-center justify-between px-4 py-3 hover:bg-[hsl(var(--snug-light-gray))] ${
                          data.groupName === group.name
                            ? 'text-[hsl(var(--snug-orange))] bg-[hsl(var(--snug-light-gray))]'
                            : 'text-[hsl(var(--snug-text-primary))]'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            updateData({ groupName: group.name });
                            setIsGroupDropdownOpen(false);
                          }}
                          className="flex-1 text-left text-sm"
                        >
                          {group.name}
                        </button>
                        {onDeleteGroup && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteGroup(group.id);
                              if (data.groupName === group.name) {
                                updateData({ groupName: undefined });
                              }
                            }}
                            className="p-1 hover:bg-red-50 rounded transition-colors group/delete"
                          >
                            <X className="w-3.5 h-3.5 text-[hsl(var(--snug-gray))] group-hover/delete:text-red-500" />
                          </button>
                        )}
                      </div>
                    ))}

                    {/* 구분선 */}
                    <div className="border-t border-[hsl(var(--snug-border))]" />

                    {/* 새 그룹 추가 */}
                    {isAddingNewGroup ? (
                      <div className="p-3">
                        <input
                          type="text"
                          value={newGroupName}
                          onChange={(e) => setNewGroupName(e.target.value)}
                          placeholder={t('newGroupNamePlaceholder')}
                          className="w-full px-3 py-2 border border-[hsl(var(--snug-border))] rounded text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && newGroupName.trim()) {
                              onAddGroup?.(newGroupName.trim());
                              updateData({ groupName: newGroupName.trim() });
                              setNewGroupName('');
                              setIsAddingNewGroup(false);
                              setIsGroupDropdownOpen(false);
                            }
                            if (e.key === 'Escape') {
                              setIsAddingNewGroup(false);
                              setNewGroupName('');
                            }
                          }}
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingNewGroup(false);
                              setNewGroupName('');
                            }}
                            className="flex-1 px-3 py-1.5 text-xs text-[hsl(var(--snug-gray))] hover:bg-[hsl(var(--snug-light-gray))] rounded"
                          >
                            {tCommon('cancel')}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (newGroupName.trim()) {
                                onAddGroup?.(newGroupName.trim());
                                updateData({ groupName: newGroupName.trim() });
                                setNewGroupName('');
                                setIsAddingNewGroup(false);
                                setIsGroupDropdownOpen(false);
                              }
                            }}
                            className="flex-1 px-3 py-1.5 text-xs text-white bg-[hsl(var(--snug-orange))] hover:opacity-90 rounded"
                          >
                            {tCommon('add')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsAddingNewGroup(true)}
                        className="w-full px-4 py-3 text-left text-sm text-[hsl(var(--snug-orange))] hover:bg-[hsl(var(--snug-light-gray))] flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        {t('addNewGroup')}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* 방 이름 */}
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-2">
                {t('roomName')} <span className="text-[hsl(var(--snug-orange))]">*</span>
              </label>
              <input
                type="text"
                value={data.roomName}
                onChange={(e) => updateData({ roomName: e.target.value })}
                onBlur={() => handleBlur('roomName')}
                placeholder={t('roomNamePlaceholder')}
                className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))] ${
                  touched.roomName && errors.roomName
                    ? 'border-red-500'
                    : 'border-[hsl(var(--snug-border))]'
                }`}
              />
              {touched.roomName && errors.roomName && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.roomName}
                </p>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* 주소명 */}
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-2">
                {t('addressLabel')} <span className="text-[hsl(var(--snug-orange))]">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={data.zipCode}
                  placeholder={t('zipCode')}
                  className="flex-1 px-4 py-3 bg-[hsl(var(--snug-light-gray))] border border-[hsl(var(--snug-border))] rounded-lg text-sm"
                  readOnly
                />
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(true)}
                  className="px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm font-medium text-[hsl(var(--snug-text-primary))] hover:bg-[hsl(var(--snug-light-gray))] transition-colors"
                >
                  {t('searchAddress')}
                </button>
              </div>
              <input
                type="text"
                value={data.address}
                placeholder={t('searchAddressPlaceholder')}
                className={`w-full mt-2 px-4 py-3 bg-[hsl(var(--snug-light-gray))] border rounded-lg text-sm ${
                  errors.address ? 'border-red-500' : 'border-[hsl(var(--snug-border))]'
                }`}
                readOnly
              />
              <input
                type="text"
                value={data.addressDetail}
                onChange={(e) => updateData({ addressDetail: e.target.value })}
                placeholder={t('detailedAddressPlaceholder')}
                className="w-full mt-2 px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.address}
                </p>
              )}
            </div>

            {/* 숙소 이용 & 최소 예약일 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-1 mb-2 relative">
                  <label className="text-sm font-medium text-[hsl(var(--snug-text-primary))]">
                    {t('accommodationType')}{' '}
                    <span className="text-[hsl(var(--snug-orange))]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsUsageTypeTooltipOpen(!isUsageTypeTooltipOpen)}
                    className="hover:opacity-70"
                  >
                    <HelpCircle className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
                  </button>

                  {/* Usage Type Tooltip */}
                  {isUsageTypeTooltipOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsUsageTypeTooltipOpen(false)}
                      />
                      <div className="absolute -top-[270px] left-[95px] w-80 bg-white border border-[hsl(var(--snug-border))] rounded-lg shadow-lg z-20 p-4">
                        <button
                          type="button"
                          onClick={() => setIsUsageTypeTooltipOpen(false)}
                          className="absolute top-3 right-3 hover:opacity-70"
                        >
                          <X className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
                        </button>
                        <div className="space-y-3 text-sm">
                          <div>
                            <p className="font-bold text-[hsl(var(--snug-orange))]">
                              {t('stay')}은
                            </p>
                            <p className="text-[hsl(var(--snug-gray))] mt-1">
                              호텔·모텔·게스트하우스·펜션·외도민 등 숙박업 신고가 완료된 공간을
                              의미하며, 최소 1박부터 예약 받을 수 있습니다. (관련 사업자등록증이
                              필요합니다.)
                            </p>
                          </div>
                          <div>
                            <p className="font-bold text-[hsl(var(--snug-text-primary))]">
                              {t('shortTermRental')}는
                            </p>
                            <p className="text-[hsl(var(--snug-gray))] mt-1">
                              쉐어하우스 또는 주거용 공간처럼 1박 이상 거주를 받는 임대 형태입니다.
                              게스트 전입신고가 가능하며, 스너그에서 단기임대 계약서·거소증 문서를
                              지원합니다.
                            </p>
                          </div>
                          <p className="text-[hsl(var(--snug-gray))] text-xs pt-2 border-t border-[hsl(var(--snug-border))]">
                            숙박/단기임대 여부는 반드시 호스트가 직접 확인 후 선택해야 하며, 잘못된
                            선택으로 발생하는 책임은 호스트에게 있습니다.
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-6" onBlur={() => handleBlur('usageTypes')}>
                  <label
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => updateData({ usageTypes: ['short_term'] })}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        data.usageTypes.includes('short_term')
                          ? 'border-[hsl(var(--snug-orange))]'
                          : 'border-[hsl(var(--snug-border))]'
                      }`}
                    >
                      {data.usageTypes.includes('short_term') && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--snug-orange))]" />
                      )}
                    </div>
                    <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                      {t('shortTermRental')}
                    </span>
                  </label>
                  <label
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => {
                      updateData({ usageTypes: ['stay'] });
                      setIsStayTooltipOpen(true);
                      setTimeout(() => setIsStayTooltipOpen(false), 5000);
                    }}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        data.usageTypes.includes('stay')
                          ? 'border-[hsl(var(--snug-orange))]'
                          : 'border-[hsl(var(--snug-border))]'
                      }`}
                    >
                      {data.usageTypes.includes('stay') && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--snug-orange))]" />
                      )}
                    </div>
                    <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                      {t('stay')}
                    </span>
                  </label>
                </div>
                {touched.usageTypes && errors.usageTypes && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.usageTypes}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-2">
                  {t('minimumReservationDays')}{' '}
                  <span className="text-[hsl(var(--snug-orange))]">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsMinDaysOpen(!isMinDaysOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm text-[hsl(var(--snug-text-primary))]"
                  >
                    {t('daysUnit', { count: data.minReservationDays })}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {isMinDaysOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsMinDaysOpen(false)} />
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[hsl(var(--snug-border))] rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                        {[1, 7, 14, 30, 60, 90].map((days) => (
                          <button
                            key={days}
                            type="button"
                            onClick={() => {
                              updateData({ minReservationDays: days });
                              setIsMinDaysOpen(false);
                            }}
                            className={`block w-full px-4 py-2 text-sm text-left hover:bg-[hsl(var(--snug-light-gray))] ${
                              data.minReservationDays === days
                                ? 'text-[hsl(var(--snug-orange))]'
                                : 'text-[hsl(var(--snug-text-primary))]'
                            }`}
                          >
                            {t('daysUnit', { count: days })}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 숙소 유형 */}
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-2">
                {t('accommodationTypeLabel')}{' '}
                <span className="text-[hsl(var(--snug-orange))]">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsAccommodationTypeOpen(!isAccommodationTypeOpen)}
                  onBlur={() => handleBlur('accommodationType')}
                  className={`w-full flex items-center justify-between px-4 py-3 border rounded-lg text-sm text-[hsl(var(--snug-text-primary))] ${
                    touched.accommodationType && errors.accommodationType
                      ? 'border-red-500'
                      : 'border-[hsl(var(--snug-border))]'
                  }`}
                >
                  {data.accommodationType
                    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      tAccommodationTypes(data.accommodationType as any)
                    : tCommon('select')}
                  <ChevronDown className="w-4 h-4" />
                </button>
                {isAccommodationTypeOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsAccommodationTypeOpen(false)}
                    />
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[hsl(var(--snug-border))] rounded-lg shadow-lg z-20">
                      {ACCOMMODATION_TYPE_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            updateData({
                              accommodationType: option as AccommodationType,
                            });
                            setIsAccommodationTypeOpen(false);
                          }}
                          className={`block w-full px-4 py-2 text-sm text-left hover:bg-[hsl(var(--snug-light-gray))] ${
                            data.accommodationType === option
                              ? 'text-[hsl(var(--snug-orange))]'
                              : 'text-[hsl(var(--snug-text-primary))]'
                          }`}
                        >
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {tAccommodationTypes(option as any)}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              {touched.accommodationType && errors.accommodationType && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.accommodationType}
                </p>
              )}
            </div>

            {/* 건물 유형 */}
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-2">
                {t('buildingType')}
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsBuildingTypeOpen(!isBuildingTypeOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm text-[hsl(var(--snug-text-primary))]"
                >
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {data.buildingType ? tBuildingTypes(data.buildingType as any) : tCommon('select')}
                  <ChevronDown className="w-4 h-4" />
                </button>
                {isBuildingTypeOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsBuildingTypeOpen(false)}
                    />
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[hsl(var(--snug-border))] rounded-lg shadow-lg z-20">
                      {BUILDING_TYPE_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            updateData({ buildingType: option as BuildingType });
                            setIsBuildingTypeOpen(false);
                          }}
                          className={`block w-full px-4 py-2 text-sm text-left hover:bg-[hsl(var(--snug-light-gray))] ${
                            data.buildingType === option
                              ? 'text-[hsl(var(--snug-orange))]'
                              : 'text-[hsl(var(--snug-text-primary))]'
                          }`}
                        >
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {tBuildingTypes(option as any)}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 요금 정보 (Pricing Information) */}
      <section className="bg-white rounded-lg border border-[hsl(var(--snug-border))] p-6">
        <h2 className="text-lg font-bold text-[hsl(var(--snug-text-primary))] mb-2">
          {t('pricingInfo')}
        </h2>
        <p className="text-sm text-[hsl(var(--snug-gray))] mb-6">{t('pricingInfoDesc')}</p>

        <div className="space-y-6">
          {/* 기본 요금 */}
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-2">
              {t('basePrice')} <span className="text-[hsl(var(--snug-orange))]">*</span>
            </label>
            <input
              type="number"
              value={data.pricing.basePrice || ''}
              onChange={(e) => updatePricing({ basePrice: parseInt(e.target.value) || 0 })}
              onBlur={() => handleBlur('basePrice')}
              placeholder={t('amountPlaceholder')}
              className={`w-full max-w-xs px-4 py-3 border rounded-lg text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))] ${
                touched.basePrice && errors.basePrice
                  ? 'border-red-500'
                  : 'border-[hsl(var(--snug-border))]'
              }`}
            />
            {touched.basePrice && errors.basePrice && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.basePrice}
              </p>
            )}
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.pricing.includesUtilities}
                onChange={(e) => updatePricing({ includesUtilities: e.target.checked })}
                className="w-5 h-5 rounded border-[hsl(var(--snug-border))] text-[hsl(var(--snug-orange))] focus:ring-[hsl(var(--snug-orange))]"
              />
              <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                {t('utilitiesIncluded')}
              </span>
            </label>
          </div>

          {/* 주말 요금 */}
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-2">
              {t('weekendPriceOptional')}
            </label>
            <input
              type="number"
              value={data.pricing.weekendPrice || ''}
              onChange={(e) =>
                updatePricing({
                  weekendPrice: parseInt(e.target.value) || undefined,
                })
              }
              placeholder={t('amountPlaceholder')}
              className="w-full max-w-xs px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
            />
            <div className="flex flex-wrap gap-3 mt-3">
              {WEEKDAY_OPTIONS.map((day) => (
                <label
                  key={day}
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => toggleWeekendDay(day)}
                >
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                      data.pricing.weekendDays.includes(day)
                        ? 'bg-[#FF7900]'
                        : 'border-2 border-[hsl(var(--snug-border))]'
                    }`}
                  >
                    {data.pricing.weekendDays.includes(day) && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {tWeekdays(day as any)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 추가 요금 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[hsl(var(--snug-text-primary))]">
                {t('additionalFeeOptional')}
              </label>
              <button
                type="button"
                onClick={() => setIsAdditionalFeeModalOpen(true)}
                className="text-sm text-[hsl(var(--snug-orange))] hover:underline"
              >
                {t('addFeeItemButton')}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[hsl(var(--snug-gray))] mb-1">
                  {t('managementFee')}
                </label>
                <input
                  type="number"
                  value={data.pricing.managementFee || ''}
                  onChange={(e) =>
                    updatePricing({
                      managementFee: parseInt(e.target.value) || undefined,
                    })
                  }
                  placeholder={t('amountPlaceholder')}
                  className="w-full px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                />
              </div>
              <div>
                <label className="block text-xs text-[hsl(var(--snug-gray))] mb-1">
                  {t('cleaningFee')}
                </label>
                <input
                  type="number"
                  value={data.pricing.cleaningFee || ''}
                  onChange={(e) =>
                    updatePricing({
                      cleaningFee: parseInt(e.target.value) || undefined,
                    })
                  }
                  placeholder={t('amountPlaceholder')}
                  className="w-full px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                />
              </div>
              <div>
                <label className="block text-xs text-[hsl(var(--snug-gray))] mb-1">
                  {t('additionalGuest')}
                </label>
                <input
                  type="number"
                  value={data.pricing.extraPersonFee || ''}
                  onChange={(e) =>
                    updatePricing({
                      extraPersonFee: parseInt(e.target.value) || undefined,
                    })
                  }
                  placeholder={t('amountPlaceholder')}
                  className="w-full px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                />
              </div>
              <div>
                <label className="block text-xs text-[hsl(var(--snug-gray))] mb-1">
                  {t('pet')}
                </label>
                <input
                  type="number"
                  value={data.pricing.petFee || ''}
                  onChange={(e) =>
                    updatePricing({
                      petFee: parseInt(e.target.value) || undefined,
                    })
                  }
                  placeholder={t('amountPlaceholder')}
                  className="w-full px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                />
              </div>
              {/* 동적 추가 요금 항목 */}
              {data.pricing.additionalFees.map((fee) => (
                <div key={fee.id}>
                  <label className="block text-xs text-[hsl(var(--snug-gray))] mb-1">
                    {fee.name}
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm text-[hsl(var(--snug-text-primary))] bg-white">
                      {fee.amount.toLocaleString()}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAdditionalFee(fee.id)}
                      className="p-2 text-[hsl(var(--snug-gray))] hover:text-[hsl(var(--snug-orange))] hover:bg-[hsl(var(--snug-light-gray))] rounded-lg transition-colors"
                      aria-label={tCommon('delete')}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 공간 정보 (Space Information) */}
      <section className="bg-white rounded-lg border border-[hsl(var(--snug-border))] p-6">
        <h2 className="text-lg font-bold text-[hsl(var(--snug-text-primary))] mb-2">
          {t('spaceInfo')}
        </h2>
        <p className="text-sm text-[hsl(var(--snug-gray))] mb-6">{t('spaceInfoDesc')}</p>

        <div className="space-y-6">
          {/* 수용 인원 & 이용 규칙 */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-2">
                {t('capacity')} <span className="text-[hsl(var(--snug-orange))]">*</span>
              </label>
              <input
                type="number"
                value={data.space.capacity || ''}
                onChange={(e) => updateSpace({ capacity: parseInt(e.target.value) || 0 })}
                onBlur={() => handleBlur('capacity')}
                placeholder="0"
                min="0"
                className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))] ${
                  touched.capacity && errors.capacity
                    ? 'border-red-500'
                    : 'border-[hsl(var(--snug-border))]'
                }`}
              />
              {touched.capacity && errors.capacity && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.capacity}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-2">
                {t('usageRulesOptional')}
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.space.genderRules.includes('male_only')}
                    onChange={() => toggleGenderRule('male_only')}
                    className="w-5 h-5 rounded border-[hsl(var(--snug-border))] text-[hsl(var(--snug-orange))] focus:ring-[hsl(var(--snug-orange))]"
                  />
                  <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                    {t('menOnly')}
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.space.genderRules.includes('female_only')}
                    onChange={() => toggleGenderRule('female_only')}
                    className="w-5 h-5 rounded border-[hsl(var(--snug-border))] text-[hsl(var(--snug-orange))] focus:ring-[hsl(var(--snug-orange))]"
                  />
                  <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                    {t('womenOnly')}
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.space.genderRules.includes('pet_allowed')}
                    onChange={() => toggleGenderRule('pet_allowed')}
                    className="w-5 h-5 rounded border-[hsl(var(--snug-border))] text-[hsl(var(--snug-orange))] focus:ring-[hsl(var(--snug-orange))]"
                  />
                  <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                    {t('allowPets')}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* 공간 사이즈 */}
          <div>
            <label className="flex items-center gap-1 text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-2">
              {t('spaceSizeOptional')}
              <HelpCircle className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
            </label>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={data.space.sizeM2 || ''}
                  onChange={(e) => updateSpace({ sizeM2: parseFloat(e.target.value) || undefined })}
                  placeholder={t('spaceSizePlaceholder')}
                  className="w-32 px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                />
                <span className="text-sm text-[hsl(var(--snug-gray))]">{t('sqmUnit')}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={data.space.sizePyeong || ''}
                  onChange={(e) =>
                    updateSpace({
                      sizePyeong: parseFloat(e.target.value) || undefined,
                    })
                  }
                  placeholder={t('spaceSizePlaceholder')}
                  className="w-32 px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                />
                <span className="text-sm text-[hsl(var(--snug-gray))]">{t('pyeongUnit')}</span>
              </div>
            </div>
          </div>

          {/* 공간 */}
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-2">
              {t('space')} <span className="text-[hsl(var(--snug-orange))]">*</span>
            </label>
            <div className="flex flex-wrap gap-3">
              {[
                { key: 'room', label: tSpaceTypes('room') },
                { key: 'livingRoom', label: tSpaceTypes('livingRoom') },
                { key: 'kitchen', label: tSpaceTypes('kitchen') },
                { key: 'bathroom', label: tSpaceTypes('bathroom') },
                { key: 'terrace', label: tSpaceTypes('terrace') },
              ].map((room) => (
                <div
                  key={room.key}
                  className="flex items-center gap-2 bg-[hsl(var(--snug-light-gray))] rounded-lg px-3 py-2"
                >
                  <span className="text-sm text-[hsl(var(--snug-text-primary))]">{room.label}</span>
                  <button
                    type="button"
                    onClick={() =>
                      updateRoomCount(
                        room.key as keyof AccommodationFormData['space']['rooms'],
                        data.space.rooms[
                          room.key as keyof AccommodationFormData['space']['rooms']
                        ] - 1,
                      )
                    }
                    className="p-1 hover:bg-white rounded transition-colors"
                  >
                    <Minus className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
                  </button>
                  <span className="text-sm font-medium w-6 text-center">
                    {data.space.rooms[room.key as keyof AccommodationFormData['space']['rooms']]}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateRoomCount(
                        room.key as keyof AccommodationFormData['space']['rooms'],
                        data.space.rooms[
                          room.key as keyof AccommodationFormData['space']['rooms']
                        ] + 1,
                      )
                    }
                    className="p-1 hover:bg-white rounded transition-colors"
                  >
                    <Plus className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
                  </button>
                </div>
              ))}
            </div>
            {errors.rooms && (
              <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.rooms}
              </p>
            )}
          </div>

          {/* 침대 종류 */}
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-2">
              {t('bedTypeOptional')}
            </label>
            <div className="flex flex-wrap gap-3">
              {[
                { key: 'king', label: tBedTypes('king') },
                { key: 'queen', label: tBedTypes('queen') },
                { key: 'single', label: tBedTypes('single') },
                { key: 'superSingle', label: tBedTypes('superSingle') },
                { key: 'bunkBed', label: tBedTypes('bunk') },
              ].map((bed) => (
                <div
                  key={bed.key}
                  className="flex items-center gap-2 bg-[hsl(var(--snug-light-gray))] rounded-lg px-3 py-2"
                >
                  <span className="text-sm text-[hsl(var(--snug-text-primary))]">{bed.label}</span>
                  <button
                    type="button"
                    onClick={() =>
                      updateBedCount(
                        bed.key as keyof AccommodationFormData['space']['beds'],
                        data.space.beds[bed.key as keyof AccommodationFormData['space']['beds']] -
                          1,
                      )
                    }
                    className="p-1 hover:bg-white rounded transition-colors"
                  >
                    <Minus className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
                  </button>
                  <span className="text-sm font-medium w-6 text-center">
                    {data.space.beds[bed.key as keyof AccommodationFormData['space']['beds']]}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateBedCount(
                        bed.key as keyof AccommodationFormData['space']['beds'],
                        data.space.beds[bed.key as keyof AccommodationFormData['space']['beds']] +
                          1,
                      )
                    }
                    className="p-1 hover:bg-white rounded transition-colors"
                  >
                    <Plus className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 하우스 룰 */}
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-2">
              {t('houseRulesOptional')}
            </label>
            <textarea
              value={data.space.houseRules || ''}
              onChange={(e) => updateSpace({ houseRules: e.target.value })}
              placeholder={t('houseRulesPlaceholder')}
              rows={3}
              className="w-full px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))] resize-none"
            />
          </div>

          {/* 하우스 소개 */}
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-2">
              {t('introductionOptional')}
            </label>
            <textarea
              value={data.space.introduction || ''}
              onChange={(e) => updateSpace({ introduction: e.target.value })}
              placeholder={t('descriptionPlaceholder')}
              rows={4}
              className="w-full px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))] resize-none"
            />
          </div>

          {/* 시설 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[hsl(var(--snug-text-primary))]">
                {t('facilitiesOptional')}
              </label>
              <button
                type="button"
                onClick={() => setIsFacilityModalOpen(true)}
                className="text-sm text-[hsl(var(--snug-orange))] hover:underline"
              >
                {t('addFacilities')}
              </button>
            </div>
            {data.facilities.length > 0 ? (
              <div className="grid grid-cols-4 gap-2 text-sm text-[hsl(var(--snug-text-primary))]">
                {data.facilities.map((facility) => (
                  <div key={facility} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-[hsl(var(--snug-orange))]" />
                    {getFacilityLabel(facility)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[hsl(var(--snug-gray))]">{t('noFacilitiesAdded')}</p>
            )}
          </div>

          {/* 어메니티 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[hsl(var(--snug-text-primary))]">
                {t('amenitiesOptional')}
              </label>
              <button
                type="button"
                onClick={() => setIsAmenityModalOpen(true)}
                className="text-sm text-[hsl(var(--snug-orange))] hover:underline"
              >
                {t('addAmenities')}
              </button>
            </div>
            {data.amenities.length > 0 ? (
              <div className="grid grid-cols-4 gap-2 text-sm text-[hsl(var(--snug-text-primary))]">
                {data.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-[hsl(var(--snug-orange))]" />
                    {getAmenityLabel(amenity)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[hsl(var(--snug-gray))]">{t('noAmenitiesAdded')}</p>
            )}
          </div>
        </div>
      </section>

      {/* 관리자 정보 (Manager Information) */}
      <section className="bg-white rounded-lg border border-[hsl(var(--snug-border))] p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-[hsl(var(--snug-text-primary))]">
            {t('managerInfoOptional')}
          </h2>
          <button
            type="button"
            onClick={() => setIsManagerModalOpen(true)}
            className="text-sm text-[hsl(var(--snug-orange))] hover:underline"
          >
            {t('addManager')}
          </button>
        </div>
        <p className="text-sm text-[hsl(var(--snug-gray))] mb-4">{t('managerInfoHint')}</p>

        {data.managers.length > 0 ? (
          <div className="space-y-4">
            {data.managers.map((manager) => (
              <div key={manager.id} className="p-4 bg-[hsl(var(--snug-light-gray))] rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[hsl(var(--snug-gray))]">{t('manager')}</p>
                    <p className="text-sm text-[hsl(var(--snug-text-primary))]">{manager.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[hsl(var(--snug-gray))]">{t('contact')}</p>
                    <p className="text-sm text-[hsl(var(--snug-text-primary))]">{manager.phone}</p>
                  </div>
                </div>
                {manager.additionalInfo && (
                  <div className="mt-2">
                    <p className="text-xs text-[hsl(var(--snug-gray))]">{t('additionalInfo')}</p>
                    <p className="text-sm text-[hsl(var(--snug-text-primary))]">
                      {manager.additionalInfo}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-[hsl(var(--snug-gray))] mb-1">
                {t('manager')}
              </label>
              <input
                type="text"
                placeholder={t('managerNamePlaceholder')}
                disabled
                className="w-full max-w-xs px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm bg-[hsl(var(--snug-light-gray))]"
              />
            </div>
            <div>
              <label className="block text-xs text-[hsl(var(--snug-gray))] mb-1">
                {t('contact')}
              </label>
              <input
                type="text"
                placeholder={t('contactPlaceholder')}
                disabled
                className="w-full max-w-xs px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm bg-[hsl(var(--snug-light-gray))]"
              />
            </div>
            <div>
              <label className="block text-xs text-[hsl(var(--snug-gray))] mb-1">
                {t('additionalInfo')}
              </label>
              <textarea
                placeholder={t('additionalInfoPlaceholder')}
                disabled
                rows={3}
                className="w-full px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm bg-[hsl(var(--snug-light-gray))] resize-none"
              />
            </div>
          </div>
        )}
      </section>

      {/* 공개 조건 체크리스트 (Publish Gate Checklist) */}
      <section className="bg-white rounded-lg border border-[hsl(var(--snug-border))] p-6">
        <h2 className="text-lg font-bold text-[hsl(var(--snug-text-primary))] mb-2">
          {tPublishGate('title')}
        </h2>
        <p className="text-sm text-[hsl(var(--snug-gray))] mb-4">{tPublishGate('description')}</p>
        <ul className="space-y-2">
          {/* 방 이름 */}
          <li className="flex items-center gap-2">
            {publishGateStatus.roomName.passed ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            <span
              className={`text-sm ${
                publishGateStatus.roomName.passed ? 'text-green-600' : 'text-red-500'
              }`}
            >
              {tPublishGate('roomNameRequired')}
            </span>
          </li>
          {/* 주소 */}
          <li className="flex items-center gap-2">
            {publishGateStatus.address.passed ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            <span
              className={`text-sm ${
                publishGateStatus.address.passed ? 'text-green-600' : 'text-red-500'
              }`}
            >
              {tPublishGate('addressRequired')}
            </span>
          </li>
          {/* 숙소 유형 */}
          <li className="flex items-center gap-2">
            {publishGateStatus.accommodationType.passed ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            <span
              className={`text-sm ${
                publishGateStatus.accommodationType.passed ? 'text-green-600' : 'text-red-500'
              }`}
            >
              {tPublishGate('accommodationTypeRequired')}
            </span>
          </li>
          {/* 이용 타입 */}
          <li className="flex items-center gap-2">
            {publishGateStatus.usageTypes.passed ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            <span
              className={`text-sm ${
                publishGateStatus.usageTypes.passed ? 'text-green-600' : 'text-red-500'
              }`}
            >
              {tPublishGate('usageTypesRequired')}
            </span>
          </li>
          {/* 대표 사진 */}
          <li className="flex items-center gap-2">
            {publishGateStatus.photos.passed ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            <span
              className={`text-sm ${
                publishGateStatus.photos.passed ? 'text-green-600' : 'text-red-500'
              }`}
            >
              {tPublishGate('photosRequired', {
                current: publishGateStatus.photos.current,
              })}
            </span>
          </li>
          {/* 공간 */}
          <li className="flex items-center gap-2">
            {publishGateStatus.rooms.passed ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            <span
              className={`text-sm ${
                publishGateStatus.rooms.passed ? 'text-green-600' : 'text-red-500'
              }`}
            >
              {tPublishGate('roomsRequired')}
            </span>
          </li>
          {/* 수용 인원 */}
          <li className="flex items-center gap-2">
            {publishGateStatus.capacity.passed ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            <span
              className={`text-sm ${
                publishGateStatus.capacity.passed ? 'text-green-600' : 'text-red-500'
              }`}
            >
              {tPublishGate('capacityRequired', {
                current: publishGateStatus.capacity.current,
              })}
            </span>
          </li>
          {/* 기본가 */}
          <li className="flex items-center gap-2">
            {publishGateStatus.basePrice.passed ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            <span
              className={`text-sm ${
                publishGateStatus.basePrice.passed ? 'text-green-600' : 'text-red-500'
              }`}
            >
              {tPublishGate('basePriceRequired')}
            </span>
          </li>
          {/* 소개글 */}
          <li className="flex items-center gap-2">
            {publishGateStatus.introduction.passed ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            <span
              className={`text-sm ${
                publishGateStatus.introduction.passed ? 'text-green-600' : 'text-red-500'
              }`}
            >
              {tPublishGate('introductionRequired', {
                current: publishGateStatus.introduction.current,
              })}
            </span>
          </li>
        </ul>
        <div className="mt-4 pt-4 border-t border-[hsl(var(--snug-border))]">
          {publishGateStatus.canPublish ? (
            <p className="text-sm text-green-600 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {tPublishGate('canPublish')}
            </p>
          ) : (
            <p className="text-sm text-[hsl(var(--snug-gray))]">{tPublishGate('cannotPublish')}</p>
          )}
        </div>
      </section>

      {/* Modals */}
      <AddressSearchModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onComplete={(addressData) => {
          updateData({
            zipCode: addressData.zonecode,
            address: addressData.address,
            // 구조화된 주소 데이터 저장
            roadAddress: addressData.roadAddress,
            sido: addressData.sido,
            sigungu: addressData.sigungu,
            bname: addressData.bname,
            buildingName: addressData.buildingName,
          });
        }}
      />

      <FacilityModal
        isOpen={isFacilityModalOpen}
        onClose={() => setIsFacilityModalOpen(false)}
        onConfirm={(selected) => updateData({ facilities: selected })}
        initialSelected={data.facilities}
      />

      <AmenityModal
        isOpen={isAmenityModalOpen}
        onClose={() => setIsAmenityModalOpen(false)}
        onConfirm={(selected) => updateData({ amenities: selected })}
        initialSelected={data.amenities}
      />

      <ManagerModal
        isOpen={isManagerModalOpen}
        onClose={() => setIsManagerModalOpen(false)}
        onConfirm={addManager}
      />

      <PhotoUploadModal
        isOpen={isPhotoUploadModalOpen}
        onClose={() => setIsPhotoUploadModalOpen(false)}
        categories={data.mainPhotos}
        onSave={(categories) => updateData({ mainPhotos: categories })}
        onViewGallery={(categoryId, currentCategories) => {
          // Store current categories directly for gallery modal
          setGalleryCategories(currentCategories);
          setGalleryInitialCategoryId(categoryId);
          setGalleryOpenedFrom('uploadModal');
          setIsPhotoUploadModalOpen(false);
          setIsPhotoGalleryModalOpen(true);
        }}
      />

      {isPhotoGalleryModalOpen && (
        <PhotoGalleryModal
          isOpen={isPhotoGalleryModalOpen}
          onClose={() => {
            setIsPhotoGalleryModalOpen(false);
            if (galleryOpenedFrom === 'uploadModal') {
              setIsPhotoUploadModalOpen(true);
            }
          }}
          categories={galleryCategories}
          initialCategoryId={galleryInitialCategoryId}
          onSave={(categories) => {
            updateData({ mainPhotos: categories });
            setIsPhotoGalleryModalOpen(false);
            if (galleryOpenedFrom === 'uploadModal') {
              setIsPhotoUploadModalOpen(true);
            }
          }}
        />
      )}

      <AdditionalFeeModal
        isOpen={isAdditionalFeeModalOpen}
        onClose={() => setIsAdditionalFeeModalOpen(false)}
        onSave={addAdditionalFee}
      />

      {/* 숙박 선택 시 하단 중앙 팝오버 */}
      {isStayTooltipOpen && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 max-w-md">
          <div
            className="bg-[#333] text-white text-sm px-4 py-3 rounded-lg shadow-lg cursor-pointer"
            onClick={() => setIsStayTooltipOpen(false)}
          >
            숙박은 호텔·모텔·게스트하우스·펜션·외국인관광 도시민박 등 숙박업 신고가 완료된 공간을
            의미하며, 최소 1박부터 예약 받을 수 있습니다. (관련 사업자등록증이 필요합니다.)
          </div>
        </div>
      )}
    </div>
  );
}
