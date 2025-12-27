'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, HelpCircle, Plus, Minus, X } from 'lucide-react';
import { PhotoUploadSection } from './photo-upload-section';
import { PhotoUploadModal } from './photo-upload-modal';
import { PhotoGalleryModal } from './photo-gallery-modal';
import { FacilityModal, AmenityModal, ManagerModal } from './selection-modal';
import { AddressSearchModal } from './address-search-modal';
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
  FACILITY_OPTIONS,
  AMENITY_OPTIONS,
  DEFAULT_FORM_DATA,
} from './types';

interface AccommodationFormProps {
  initialData?: AccommodationFormData;
  onChange: (data: AccommodationFormData) => void;
  groups?: GroupItem[];
  onAddGroup?: (groupName: string) => void;
}

export function AccommodationForm({
  initialData = DEFAULT_FORM_DATA,
  onChange,
  groups = [],
  onAddGroup,
}: AccommodationFormProps) {
  const [data, setData] = useState<AccommodationFormData>(initialData);

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

  const toggleUsageType = (type: 'stay' | 'short_term') => {
    const newTypes = data.usageTypes.includes(type)
      ? data.usageTypes.filter((t) => t !== type)
      : [...data.usageTypes, type];
    updateData({ usageTypes: newTypes });
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

  const getFacilityLabel = (id: string) => {
    return FACILITY_OPTIONS.find((f) => f.id === id)?.label ?? id;
  };

  const getAmenityLabel = (id: string) => {
    return AMENITY_OPTIONS.find((a) => a.id === id)?.label ?? id;
  };

  const addManager = (manager: Omit<ManagerInfo, 'id'>) => {
    const newManager: ManagerInfo = {
      ...manager,
      id: Date.now().toString(),
    };
    updateData({ managers: [...data.managers, newManager] });
  };

  const addAdditionalFee = () => {
    const newFee: AdditionalFeeItem = {
      id: Date.now().toString(),
      name: '',
      amount: 0,
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

  const updateAdditionalFee = (id: string, updates: Partial<Omit<AdditionalFeeItem, 'id'>>) => {
    updatePricing({
      additionalFees: data.pricing.additionalFees.map((fee) =>
        fee.id === id ? { ...fee, ...updates } : fee,
      ),
    });
  };

  return (
    <div className="space-y-8">
      {/* 기본 정보 (Basic Information) */}
      <section className="bg-white rounded-lg border border-[hsl(var(--snug-border))] p-6">
        <h2 className="text-lg font-bold text-[hsl(var(--snug-text-primary))] mb-6">기본 정보</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* 대표 사진 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-[hsl(var(--snug-text-primary))]">
                  대표 사진 <span className="text-[hsl(var(--snug-orange))]">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsPhotoUploadModalOpen(true)}
                  className="text-sm text-[hsl(var(--snug-orange))] hover:underline"
                >
                  + 사진 등록
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
            </div>

            {/* 그룹명 */}
            <div className="relative">
              <label className="block text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-2">
                그룹명 (선택)
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
                  {data.groupName || '그룹 선택'}
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
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[hsl(var(--snug-border))] rounded-lg shadow-lg z-20 max-h-[200px] overflow-y-auto">
                    {/* 선택 안함 */}
                    <button
                      type="button"
                      onClick={() => {
                        updateData({ groupName: undefined });
                        setIsGroupDropdownOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-[hsl(var(--snug-gray))] hover:bg-[hsl(var(--snug-light-gray))]"
                    >
                      선택 안함
                    </button>

                    {/* 기존 그룹 목록 */}
                    {groups.map((group) => (
                      <button
                        key={group.id}
                        type="button"
                        onClick={() => {
                          updateData({ groupName: group.name });
                          setIsGroupDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left text-sm hover:bg-[hsl(var(--snug-light-gray))] ${
                          data.groupName === group.name
                            ? 'text-[hsl(var(--snug-orange))] bg-[hsl(var(--snug-light-gray))]'
                            : 'text-[hsl(var(--snug-text-primary))]'
                        }`}
                      >
                        {group.name}
                      </button>
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
                          placeholder="새 그룹명 입력"
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
                            취소
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
                            추가
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsAddingNewGroup(true)}
                        className="w-full px-4 py-3 text-left text-sm text-[hsl(var(--snug-orange))] hover:bg-[hsl(var(--snug-light-gray))] flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />새 그룹 추가
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* 방 이름 */}
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-2">
                방 이름 <span className="text-[hsl(var(--snug-orange))]">*</span>
              </label>
              <input
                type="text"
                value={data.roomName}
                onChange={(e) => updateData({ roomName: e.target.value })}
                placeholder="방 호실 또는 명칭 입력"
                className="w-full px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* 주소명 */}
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-2">
                주소명 <span className="text-[hsl(var(--snug-orange))]">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={data.zipCode}
                  placeholder="우편번호"
                  className="flex-1 px-4 py-3 bg-[hsl(var(--snug-light-gray))] border border-[hsl(var(--snug-border))] rounded-lg text-sm"
                  readOnly
                />
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(true)}
                  className="px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm font-medium text-[hsl(var(--snug-text-primary))] hover:bg-[hsl(var(--snug-light-gray))] transition-colors"
                >
                  주소 검색
                </button>
              </div>
              <input
                type="text"
                value={data.address}
                placeholder="주소를 검색해주세요"
                className="w-full mt-2 px-4 py-3 bg-[hsl(var(--snug-light-gray))] border border-[hsl(var(--snug-border))] rounded-lg text-sm"
                readOnly
              />
              <input
                type="text"
                value={data.addressDetail}
                onChange={(e) => updateData({ addressDetail: e.target.value })}
                placeholder="상세 주소 입력"
                className="w-full mt-2 px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
              />
            </div>

            {/* 숙소 이용 & 최소 예약일 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-2">
                  숙소 이용 <span className="text-[hsl(var(--snug-orange))]">*</span>
                  <HelpCircle className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.usageTypes.includes('stay')}
                      onChange={() => toggleUsageType('stay')}
                      className="w-5 h-5 rounded border-[hsl(var(--snug-border))] text-[hsl(var(--snug-orange))] focus:ring-[hsl(var(--snug-orange))]"
                    />
                    <span className="text-sm text-[hsl(var(--snug-text-primary))]">숙박</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.usageTypes.includes('short_term')}
                      onChange={() => toggleUsageType('short_term')}
                      className="w-5 h-5 rounded border-[hsl(var(--snug-border))] text-[hsl(var(--snug-orange))] focus:ring-[hsl(var(--snug-orange))]"
                    />
                    <span className="text-sm text-[hsl(var(--snug-text-primary))]">단기임대</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-2">
                  최소 예약일 <span className="text-[hsl(var(--snug-orange))]">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsMinDaysOpen(!isMinDaysOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm text-[hsl(var(--snug-text-primary))]"
                  >
                    {data.minReservationDays}일
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
                            {days}일
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
                숙소 유형 <span className="text-[hsl(var(--snug-orange))]">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsAccommodationTypeOpen(!isAccommodationTypeOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm text-[hsl(var(--snug-text-primary))]"
                >
                  {ACCOMMODATION_TYPE_OPTIONS.find((opt) => opt.id === data.accommodationType)
                    ?.label ?? '선택'}
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
                          key={option.id}
                          type="button"
                          onClick={() => {
                            updateData({
                              accommodationType: option.id as AccommodationType,
                            });
                            setIsAccommodationTypeOpen(false);
                          }}
                          className={`block w-full px-4 py-2 text-sm text-left hover:bg-[hsl(var(--snug-light-gray))] ${
                            data.accommodationType === option.id
                              ? 'text-[hsl(var(--snug-orange))]'
                              : 'text-[hsl(var(--snug-text-primary))]'
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

            {/* 건물 유형 */}
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-2">
                건물 유형
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsBuildingTypeOpen(!isBuildingTypeOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm text-[hsl(var(--snug-text-primary))]"
                >
                  {data.buildingType
                    ? BUILDING_TYPE_OPTIONS.find((opt) => opt.id === data.buildingType)?.label
                    : '선택'}
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
                          key={option.id}
                          type="button"
                          onClick={() => {
                            updateData({ buildingType: option.id as BuildingType });
                            setIsBuildingTypeOpen(false);
                          }}
                          className={`block w-full px-4 py-2 text-sm text-left hover:bg-[hsl(var(--snug-light-gray))] ${
                            data.buildingType === option.id
                              ? 'text-[hsl(var(--snug-orange))]'
                              : 'text-[hsl(var(--snug-text-primary))]'
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
          </div>
        </div>
      </section>

      {/* 요금 정보 (Pricing Information) */}
      <section className="bg-white rounded-lg border border-[hsl(var(--snug-border))] p-6">
        <h2 className="text-lg font-bold text-[hsl(var(--snug-text-primary))] mb-6">요금 정보</h2>

        <div className="space-y-6">
          {/* 기본 요금 */}
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-2">
              기본 요금 (1박) <span className="text-[hsl(var(--snug-orange))]">*</span>
            </label>
            <input
              type="number"
              value={data.pricing.basePrice || ''}
              onChange={(e) => updatePricing({ basePrice: parseInt(e.target.value) || 0 })}
              placeholder="금액 입력"
              className="w-full max-w-xs px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
            />
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.pricing.includesUtilities}
                onChange={(e) => updatePricing({ includesUtilities: e.target.checked })}
                className="w-5 h-5 rounded border-[hsl(var(--snug-border))] text-[hsl(var(--snug-orange))] focus:ring-[hsl(var(--snug-orange))]"
              />
              <span className="text-sm text-[hsl(var(--snug-text-primary))]">공과금 포함</span>
            </label>
          </div>

          {/* 주말 요금 */}
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-2">
              주말 요금 (1박) (선택)
            </label>
            <input
              type="number"
              value={data.pricing.weekendPrice || ''}
              onChange={(e) =>
                updatePricing({
                  weekendPrice: parseInt(e.target.value) || undefined,
                })
              }
              placeholder="금액 입력"
              className="w-full max-w-xs px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
            />
            <div className="flex flex-wrap gap-3 mt-3">
              {WEEKDAY_OPTIONS.map((day) => (
                <label key={day.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.pricing.weekendDays.includes(day.id)}
                    onChange={() => toggleWeekendDay(day.id)}
                    className="w-5 h-5 rounded border-[hsl(var(--snug-border))] text-[hsl(var(--snug-orange))] focus:ring-[hsl(var(--snug-orange))]"
                  />
                  <span className="text-sm text-[hsl(var(--snug-text-primary))]">{day.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 추가 요금 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[hsl(var(--snug-text-primary))]">
                추가 요금 (선택)
              </label>
              <button
                type="button"
                onClick={addAdditionalFee}
                className="text-sm text-[hsl(var(--snug-orange))] hover:underline"
              >
                + 추가 요금 항목 추가
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[hsl(var(--snug-gray))] mb-1">관리비</label>
                <input
                  type="number"
                  value={data.pricing.managementFee || ''}
                  onChange={(e) =>
                    updatePricing({
                      managementFee: parseInt(e.target.value) || undefined,
                    })
                  }
                  placeholder="금액 입력"
                  className="w-full px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                />
              </div>
              <div>
                <label className="block text-xs text-[hsl(var(--snug-gray))] mb-1">청소비</label>
                <input
                  type="number"
                  value={data.pricing.cleaningFee || ''}
                  onChange={(e) =>
                    updatePricing({
                      cleaningFee: parseInt(e.target.value) || undefined,
                    })
                  }
                  placeholder="금액 입력"
                  className="w-full px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                />
              </div>
              <div>
                <label className="block text-xs text-[hsl(var(--snug-gray))] mb-1">추가 인원</label>
                <input
                  type="number"
                  value={data.pricing.extraPersonFee || ''}
                  onChange={(e) =>
                    updatePricing({
                      extraPersonFee: parseInt(e.target.value) || undefined,
                    })
                  }
                  placeholder="금액 입력"
                  className="w-full px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                />
              </div>
              <div>
                <label className="block text-xs text-[hsl(var(--snug-gray))] mb-1">반려동물</label>
                <input
                  type="number"
                  value={data.pricing.petFee || ''}
                  onChange={(e) =>
                    updatePricing({
                      petFee: parseInt(e.target.value) || undefined,
                    })
                  }
                  placeholder="금액 입력"
                  className="w-full px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                />
              </div>
              {/* 동적 추가 요금 항목 */}
              {data.pricing.additionalFees.map((fee) => (
                <div key={fee.id} className="col-span-2 flex items-end gap-3">
                  <div className="flex-1">
                    <label className="block text-xs text-[hsl(var(--snug-gray))] mb-1">
                      항목명
                    </label>
                    <input
                      type="text"
                      value={fee.name}
                      onChange={(e) => updateAdditionalFee(fee.id, { name: e.target.value })}
                      placeholder="항목명 입력"
                      className="w-full px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-[hsl(var(--snug-gray))] mb-1">금액</label>
                    <input
                      type="number"
                      value={fee.amount || ''}
                      onChange={(e) =>
                        updateAdditionalFee(fee.id, { amount: parseInt(e.target.value) || 0 })
                      }
                      placeholder="금액 입력"
                      className="w-full px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAdditionalFee(fee.id)}
                    className="p-3 text-[hsl(var(--snug-gray))] hover:text-[hsl(var(--snug-orange))] hover:bg-[hsl(var(--snug-light-gray))] rounded-lg transition-colors"
                    aria-label="삭제"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 공간 정보 (Space Information) */}
      <section className="bg-white rounded-lg border border-[hsl(var(--snug-border))] p-6">
        <h2 className="text-lg font-bold text-[hsl(var(--snug-text-primary))] mb-6">공간 정보</h2>

        <div className="space-y-6">
          {/* 수용 인원 & 이용 규칙 */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-2">
                수용 인원 <span className="text-[hsl(var(--snug-orange))]">*</span>
              </label>
              <input
                type="number"
                value={data.space.capacity || ''}
                onChange={(e) => updateSpace({ capacity: parseInt(e.target.value) || 0 })}
                placeholder="0"
                min="0"
                className="w-full px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-2">
                숙소 이용 규칙 (선택)
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.space.genderRules.includes('male_only')}
                    onChange={() => toggleGenderRule('male_only')}
                    className="w-5 h-5 rounded border-[hsl(var(--snug-border))] text-[hsl(var(--snug-orange))] focus:ring-[hsl(var(--snug-orange))]"
                  />
                  <span className="text-sm text-[hsl(var(--snug-text-primary))]">남성전용</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.space.genderRules.includes('female_only')}
                    onChange={() => toggleGenderRule('female_only')}
                    className="w-5 h-5 rounded border-[hsl(var(--snug-border))] text-[hsl(var(--snug-orange))] focus:ring-[hsl(var(--snug-orange))]"
                  />
                  <span className="text-sm text-[hsl(var(--snug-text-primary))]">여성전용</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.space.genderRules.includes('pet_allowed')}
                    onChange={() => toggleGenderRule('pet_allowed')}
                    className="w-5 h-5 rounded border-[hsl(var(--snug-border))] text-[hsl(var(--snug-orange))] focus:ring-[hsl(var(--snug-orange))]"
                  />
                  <span className="text-sm text-[hsl(var(--snug-text-primary))]">반려동물</span>
                </label>
              </div>
            </div>
          </div>

          {/* 공간 사이즈 */}
          <div>
            <label className="flex items-center gap-1 text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-2">
              공간 사이즈 (선택)
              <HelpCircle className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
            </label>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={data.space.sizeM2 || ''}
                  onChange={(e) => updateSpace({ sizeM2: parseFloat(e.target.value) || undefined })}
                  placeholder="공간 사이즈"
                  className="w-32 px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                />
                <span className="text-sm text-[hsl(var(--snug-gray))]">m²</span>
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
                  placeholder="공간 사이즈"
                  className="w-32 px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
                />
                <span className="text-sm text-[hsl(var(--snug-gray))]">평</span>
              </div>
            </div>
          </div>

          {/* 공간 */}
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-2">
              공간 <span className="text-[hsl(var(--snug-orange))]">*</span>
            </label>
            <div className="flex flex-wrap gap-3">
              {[
                { key: 'room', label: '방' },
                { key: 'livingRoom', label: '거실' },
                { key: 'kitchen', label: '부엌' },
                { key: 'bathroom', label: '화장실' },
                { key: 'terrace', label: '테라스' },
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
          </div>

          {/* 침대 종류 */}
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-2">
              침대 종류 (선택)
            </label>
            <div className="flex flex-wrap gap-3">
              {[
                { key: 'king', label: '킹' },
                { key: 'queen', label: '퀸' },
                { key: 'single', label: '싱글' },
                { key: 'superSingle', label: '슈퍼 싱글' },
                { key: 'bunkBed', label: '이층 침대' },
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
              하우스 룰 (선택)
            </label>
            <textarea
              value={data.space.houseRules || ''}
              onChange={(e) => updateSpace({ houseRules: e.target.value })}
              placeholder="하우스 룰이 있는 경우 입력해주세요."
              rows={3}
              className="w-full px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))] resize-none"
            />
          </div>

          {/* 하우스 소개 */}
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--snug-text-primary))] mb-2">
              하우스 소개 (선택)
            </label>
            <textarea
              value={data.space.introduction || ''}
              onChange={(e) => updateSpace({ introduction: e.target.value })}
              placeholder="하우스 소개 내용을 입력해주세요."
              rows={4}
              className="w-full px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))] resize-none"
            />
          </div>

          {/* 시설 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[hsl(var(--snug-text-primary))]">
                시설 (선택)
              </label>
              <button
                type="button"
                onClick={() => setIsFacilityModalOpen(true)}
                className="text-sm text-[hsl(var(--snug-orange))] hover:underline"
              >
                + 시설 추가
              </button>
            </div>
            {data.facilities.length > 0 ? (
              <ul className="list-disc list-inside text-sm text-[hsl(var(--snug-text-primary))] space-y-1">
                {data.facilities.map((facility) => (
                  <li key={facility}>{getFacilityLabel(facility)}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[hsl(var(--snug-gray))]">등록된 시설이 없습니다.</p>
            )}
          </div>

          {/* 어메니티 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[hsl(var(--snug-text-primary))]">
                어메니티 (선택)
              </label>
              <button
                type="button"
                onClick={() => setIsAmenityModalOpen(true)}
                className="text-sm text-[hsl(var(--snug-orange))] hover:underline"
              >
                + 어메니티 추가
              </button>
            </div>
            {data.amenities.length > 0 ? (
              <ul className="list-disc list-inside text-sm text-[hsl(var(--snug-text-primary))] space-y-1">
                {data.amenities.map((amenity) => (
                  <li key={amenity}>{getAmenityLabel(amenity)}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[hsl(var(--snug-gray))]">등록된 어메니티가 없습니다.</p>
            )}
          </div>
        </div>
      </section>

      {/* 관리자 정보 (Manager Information) */}
      <section className="bg-white rounded-lg border border-[hsl(var(--snug-border))] p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-[hsl(var(--snug-text-primary))]">
            관리자 정보 (선택)
          </h2>
          <button
            type="button"
            onClick={() => setIsManagerModalOpen(true)}
            className="text-sm text-[hsl(var(--snug-orange))] hover:underline"
          >
            + 관리자 추가
          </button>
        </div>
        <p className="text-sm text-[hsl(var(--snug-gray))] mb-4">
          관리자 정보 미 기입 시 호스트 정보가 기입됩니다.
        </p>

        {data.managers.length > 0 ? (
          <div className="space-y-4">
            {data.managers.map((manager) => (
              <div key={manager.id} className="p-4 bg-[hsl(var(--snug-light-gray))] rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[hsl(var(--snug-gray))]">관리자</p>
                    <p className="text-sm text-[hsl(var(--snug-text-primary))]">{manager.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[hsl(var(--snug-gray))]">연락처</p>
                    <p className="text-sm text-[hsl(var(--snug-text-primary))]">{manager.phone}</p>
                  </div>
                </div>
                {manager.additionalInfo && (
                  <div className="mt-2">
                    <p className="text-xs text-[hsl(var(--snug-gray))]">추가 정보</p>
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
              <label className="block text-xs text-[hsl(var(--snug-gray))] mb-1">관리자</label>
              <input
                type="text"
                placeholder="관리자명"
                disabled
                className="w-full max-w-xs px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm bg-[hsl(var(--snug-light-gray))]"
              />
            </div>
            <div>
              <label className="block text-xs text-[hsl(var(--snug-gray))] mb-1">연락처</label>
              <input
                type="text"
                placeholder="010 - 0000 - 0000"
                disabled
                className="w-full max-w-xs px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm bg-[hsl(var(--snug-light-gray))]"
              />
            </div>
            <div>
              <label className="block text-xs text-[hsl(var(--snug-gray))] mb-1">추가 정보</label>
              <textarea
                placeholder="추가 정보가 있는 경우 입력해주세요."
                disabled
                rows={3}
                className="w-full px-4 py-3 border border-[hsl(var(--snug-border))] rounded-lg text-sm bg-[hsl(var(--snug-light-gray))] resize-none"
              />
            </div>
          </div>
        )}
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
    </div>
  );
}
