'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Check, AlertCircle } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { useAuthStore } from '@/shared/stores';
import {
  createAccommodation,
  createAccommodationGroup,
  getAccommodationGroups,
  getAccommodation,
  updateAccommodation,
  deleteAccommodation,
} from '@/shared/api/accommodation/actions';
import type { Accommodation } from '@snug/types';
import { AccommodationForm } from './accommodation-form';
import { AccommodationPreviewPanel } from './accommodation-preview-panel';
import type { AccommodationFormData, AccommodationType, BuildingType, GenderRule } from './types';
import { DEFAULT_FORM_DATA } from './types';
import type { GroupItem } from './group-management-modal';
import { useBreadcrumb } from '../host-breadcrumb-context';

interface AccommodationPageFooterProps {
  onDelete?: () => void;
  onCancel?: () => void;
  onSaveDraft?: () => void;
  onSave?: () => void;
  showDelete?: boolean;
  isSaving?: boolean;
  isFormValid?: boolean;
}

function AccommodationPageFooter({
  onDelete,
  onCancel,
  onSaveDraft,
  onSave,
  showDelete = false,
  isSaving = false,
  isFormValid = true,
}: AccommodationPageFooterProps) {
  const t = useTranslations('host.accommodation.page');
  const tCommon = useTranslations('common');

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-[hsl(var(--snug-border))]">
      <div>
        {showDelete && (
          <button
            type="button"
            onClick={onDelete}
            disabled={isSaving}
            className="px-6 py-3 text-sm font-medium text-[hsl(var(--snug-text-primary))] border border-[hsl(var(--snug-border))] rounded-lg hover:bg-[hsl(var(--snug-light-gray))] transition-colors disabled:opacity-50"
          >
            {t('delete')}
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-6 py-3 text-sm font-medium text-[hsl(var(--snug-text-primary))] border border-[hsl(var(--snug-border))] rounded-lg hover:bg-[hsl(var(--snug-light-gray))] transition-colors disabled:opacity-50"
        >
          {tCommon('cancel')}
        </button>
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={isSaving}
          className="px-6 py-3 text-sm font-medium text-[hsl(var(--snug-text-primary))] border border-[hsl(var(--snug-border))] rounded-lg hover:bg-[hsl(var(--snug-light-gray))] transition-colors disabled:opacity-50"
        >
          {isSaving ? t('saving') : t('draftSave')}
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving || !isFormValid}
          className="px-6 py-3 text-sm font-bold text-white bg-[hsl(var(--snug-orange))] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? t('saving') : t('save')}
        </button>
      </div>
    </div>
  );
}

// Helper: Convert form type to API type
function toApiAccommodationType(
  type: AccommodationType,
): 'HOUSE' | 'SHARE_ROOM' | 'SHARE_HOUSE' | 'APARTMENT' {
  const map: Record<AccommodationType, 'HOUSE' | 'SHARE_ROOM' | 'SHARE_HOUSE' | 'APARTMENT'> = {
    house: 'HOUSE',
    share_room: 'SHARE_ROOM',
    share_house: 'SHARE_HOUSE',
    apartment: 'APARTMENT',
  };
  return map[type];
}

function toApiBuildingType(
  type?: BuildingType,
): 'APARTMENT' | 'VILLA' | 'HOUSE' | 'OFFICETEL' | undefined {
  if (!type) return undefined;
  const map: Record<BuildingType, 'APARTMENT' | 'VILLA' | 'HOUSE' | 'OFFICETEL'> = {
    apartment: 'APARTMENT',
    villa: 'VILLA',
    house: 'HOUSE',
    officetel: 'OFFICETEL',
  };
  return map[type];
}

function toApiUsageTypes(types: ('stay' | 'short_term')[]): ('STAY' | 'SHORT_TERM')[] {
  return types.map((t) => (t === 'stay' ? 'STAY' : 'SHORT_TERM'));
}

function toApiGenderRules(rules: GenderRule[]): ('MALE_ONLY' | 'FEMALE_ONLY' | 'PET_ALLOWED')[] {
  const map: Record<GenderRule, 'MALE_ONLY' | 'FEMALE_ONLY' | 'PET_ALLOWED'> = {
    male_only: 'MALE_ONLY',
    female_only: 'FEMALE_ONLY',
    pet_allowed: 'PET_ALLOWED',
  };
  return rules.map((r) => map[r]);
}

function toApiBedCounts(beds: {
  king: number;
  queen: number;
  single: number;
  superSingle: number;
  bunkBed: number;
}): Record<string, number> {
  return { ...beds } as Record<string, number>;
}

// Convert PhotoCategory[] to AddAccommodationPhotoInput[]
function toApiPhotos(
  mainPhotos: {
    id: string;
    name: string;
    photos: { id: string; url: string; order: number }[];
    order: number;
  }[],
): { category: string; url: string; order: number }[] {
  const apiPhotos: { category: string; url: string; order: number }[] = [];
  let globalOrder = 0;

  for (const category of mainPhotos) {
    for (const photo of category.photos) {
      // Skip blob URLs (not uploaded to storage)
      if (photo.url.startsWith('blob:')) {
        console.warn('[toApiPhotos] Skipping blob URL:', photo.url);
        continue;
      }
      apiPhotos.push({
        category: category.id,
        url: photo.url,
        order: globalOrder++,
      });
    }
  }

  return apiPhotos;
}

// ============================================
// API → Form Type Converters (Reverse mapping)
// ============================================

function fromApiAccommodationType(
  type: 'HOUSE' | 'SHARE_ROOM' | 'SHARE_HOUSE' | 'APARTMENT',
): AccommodationType {
  const map: Record<string, AccommodationType> = {
    HOUSE: 'house',
    SHARE_ROOM: 'share_room',
    SHARE_HOUSE: 'share_house',
    APARTMENT: 'apartment',
  };
  return map[type] || 'house';
}

function fromApiBuildingType(
  type: 'APARTMENT' | 'VILLA' | 'HOUSE' | 'OFFICETEL' | null,
): BuildingType | undefined {
  if (!type) return undefined;
  const map: Record<string, BuildingType> = {
    APARTMENT: 'apartment',
    VILLA: 'villa',
    HOUSE: 'house',
    OFFICETEL: 'officetel',
  };
  return map[type];
}

function fromApiUsageTypes(
  types: ('STAY' | 'SHORT_TERM')[] | undefined | null,
): ('stay' | 'short_term')[] {
  if (!types || !Array.isArray(types)) return [];
  return types.map((t) => (t === 'STAY' ? 'stay' : 'short_term'));
}

function fromApiGenderRules(
  rules: ('MALE_ONLY' | 'FEMALE_ONLY' | 'PET_ALLOWED')[] | undefined | null,
): GenderRule[] {
  if (!rules || !Array.isArray(rules)) return [];
  const map: Record<string, GenderRule> = {
    MALE_ONLY: 'male_only',
    FEMALE_ONLY: 'female_only',
    PET_ALLOWED: 'pet_allowed',
  };
  return rules.map((r) => map[r]).filter((r): r is GenderRule => r !== undefined);
}

// Convert API Accommodation to Form Data
function accommodationToFormData(acc: Accommodation, groupName?: string): AccommodationFormData {
  // Convert photos from flat array to categorized structure
  const photosByCategory = new Map<string, { id: string; url: string; order: number }[]>();
  if (acc.photos) {
    for (const photo of acc.photos) {
      const category = photo.category || 'main';
      if (!photosByCategory.has(category)) {
        photosByCategory.set(category, []);
      }
      photosByCategory.get(category)!.push({
        id: photo.id,
        url: photo.url,
        order: photo.order,
      });
    }
  }

  // Build mainPhotos array
  const mainPhotos: AccommodationFormData['mainPhotos'] = [];
  const categoryOrder = ['main', 'room', 'living_room', 'kitchen', 'bathroom'];
  const categoryNames: Record<string, string> = {
    main: '대표사진',
    room: '방',
    living_room: '거실',
    kitchen: '부엌',
    bathroom: '화장실',
  };

  let orderIndex = 0;
  for (const catId of categoryOrder) {
    const photos = photosByCategory.get(catId) || [];
    if (photos.length > 0) {
      mainPhotos.push({
        id: catId,
        name: categoryNames[catId] || catId,
        photos: photos.sort((a, b) => a.order - b.order),
        order: orderIndex++,
      });
    }
  }

  // Add any remaining categories not in the default list
  for (const [catId, photos] of photosByCategory) {
    if (!categoryOrder.includes(catId)) {
      mainPhotos.push({
        id: catId,
        name: catId,
        photos: photos.sort((a, b) => a.order - b.order),
        order: orderIndex++,
      });
    }
  }

  // Convert bedCounts
  const bedCounts = acc.bedCounts as Record<string, number> | null;

  return {
    mainPhotos,
    address: acc.address || '',
    addressDetail: acc.addressDetail || '',
    zipCode: acc.zipCode || '',
    roadAddress: acc.roadAddress || undefined,
    sido: acc.sido || undefined,
    sigungu: acc.sigungu || undefined,
    bname: acc.bname || undefined,
    buildingName: acc.buildingName || undefined,
    usageTypes: fromApiUsageTypes(acc.usageTypes),
    minReservationDays: acc.minReservationDays || 1,
    groupName,
    accommodationType: fromApiAccommodationType(acc.accommodationType),
    roomName: acc.roomName || '',
    buildingType: fromApiBuildingType(acc.buildingType),
    pricing: {
      basePrice: acc.basePrice || 0,
      includesUtilities: acc.includesUtilities || false,
      weekendPrice: acc.weekendPrice || undefined,
      weekendDays: acc.weekendDays || [],
      managementFee: acc.managementFee || undefined,
      cleaningFee: acc.cleaningFee || undefined,
      extraPersonFee: acc.extraPersonFee || undefined,
      petFee: acc.petFee || undefined,
      additionalFees: [], // TODO: Load additional fees if stored
    },
    space: {
      capacity: acc.capacity || 1,
      genderRules: fromApiGenderRules(acc.genderRules),
      sizeM2: acc.sizeM2 || undefined,
      sizePyeong: acc.sizePyeong || undefined,
      rooms: {
        room: acc.roomCount || 0,
        livingRoom: acc.livingRoomCount || 0,
        kitchen: acc.kitchenCount || 0,
        bathroom: acc.bathroomCount || 0,
        terrace: acc.terraceCount || 0,
      },
      beds: {
        king: bedCounts?.king || 0,
        queen: bedCounts?.queen || 0,
        single: bedCounts?.single || 0,
        superSingle: bedCounts?.superSingle || 0,
        bunkBed: bedCounts?.bunkBed || bedCounts?.bunk || 0,
      },
      houseRules: acc.houseRules || '',
      introduction: acc.introduction || '',
    },
    facilities: acc.facilities?.map((f) => f.facilityCode) || [],
    amenities: acc.amenities?.map((a) => a.amenityCode) || [],
    managers:
      acc.managers?.map((m) => ({
        id: m.id,
        name: m.name,
        phone: m.phone,
        additionalInfo: m.additionalInfo || undefined,
      })) || [],
    isOperating: acc.isOperating || false,
    openDate: acc.openDate ? new Date(acc.openDate).toLocaleDateString('ko-KR') : undefined,
    lastModifiedBy: undefined,
    lastModifiedAt: acc.updatedAt ? new Date(acc.updatedAt).toLocaleDateString('ko-KR') : undefined,
  };
}

// New Accommodation Page
export function AccommodationNewPage() {
  const router = useRouter();
  const t = useTranslations('host.accommodation.page');
  const { user, refreshUser } = useAuthStore();
  const { setBreadcrumb, setHeaderActions } = useBreadcrumb();
  const [formData, setFormData] = useState<AccommodationFormData>(DEFAULT_FORM_DATA);
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Toast 상태
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Toast 표시 함수
  const showToastMessage = useCallback((message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }, []);

  // 필수값 유효성 검사
  const isFormValid = useMemo(() => {
    return !!(formData.roomName?.trim() && formData.address?.trim());
  }, [formData.roomName, formData.address]);

  // Set breadcrumb
  useEffect(() => {
    setBreadcrumb([t('breadcrumbManagement'), t('breadcrumbNew')]);
    return () => setBreadcrumb([]);
  }, [setBreadcrumb, t]);

  // Set header actions
  useEffect(() => {
    setHeaderActions({
      isOperating: formData.isOperating,
      onToggleOperating: (value: boolean) =>
        setFormData((prev) => ({ ...prev, isOperating: value })),
    });
    return () => setHeaderActions({});
  }, [setHeaderActions, formData.isOperating]);

  // Fetch groups on mount
  useEffect(() => {
    async function loadGroups() {
      if (!user?.id) return;
      try {
        const fetchedGroups = await getAccommodationGroups();
        // 방어적 코딩: 배열 확인
        const groupsArray = Array.isArray(fetchedGroups) ? fetchedGroups : [];
        setGroups(
          groupsArray.map((g) => ({
            id: g.id,
            name: g.name,
            isSelected: false,
            accommodationIds: [],
          })),
        );
      } catch (error) {
        console.error('Failed to load groups:', error);
        showToastMessage('그룹 목록을 불러오는데 실패했습니다.', 'error');
      }
    }
    loadGroups();
  }, [user?.id, showToastMessage]);

  const handleSave = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      // Find or create group if specified
      let groupId: string | undefined;
      if (formData.groupName) {
        const existingGroup = groups.find((g) => g.name === formData.groupName);
        if (existingGroup) {
          groupId = existingGroup.id;
        } else {
          // Create new group
          // hostId is derived from JWT token on server side
          const newGroup = await createAccommodationGroup({
            name: formData.groupName,
            address: formData.address || undefined,
          });
          groupId = newGroup.id;
        }
      }

      // Convert photos to API format
      const apiPhotos = toApiPhotos(formData.mainPhotos);

      // Create accommodation
      // hostId is derived from JWT token on server side
      const { roleUpgraded } = await createAccommodation({
        groupId,
        roomName: formData.roomName,
        accommodationType: toApiAccommodationType(formData.accommodationType),
        buildingType: toApiBuildingType(formData.buildingType),
        usageTypes: toApiUsageTypes(formData.usageTypes),
        minReservationDays: formData.minReservationDays,
        address: formData.address,
        addressDetail: formData.addressDetail || undefined,
        zipCode: formData.zipCode || undefined,
        // 구조화된 주소 (다음 주소 API에서 파싱)
        roadAddress: formData.roadAddress || undefined,
        sido: formData.sido || undefined,
        sigungu: formData.sigungu || undefined,
        bname: formData.bname || undefined,
        buildingName: formData.buildingName || undefined,
        basePrice: formData.pricing.basePrice,
        includesUtilities: formData.pricing.includesUtilities,
        weekendPrice: formData.pricing.weekendPrice,
        weekendDays: formData.pricing.weekendDays,
        managementFee: formData.pricing.managementFee,
        cleaningFee: formData.pricing.cleaningFee,
        extraPersonFee: formData.pricing.extraPersonFee,
        petFee: formData.pricing.petFee,
        capacity: formData.space.capacity,
        genderRules: toApiGenderRules(formData.space.genderRules),
        sizeM2: formData.space.sizeM2,
        sizePyeong: formData.space.sizePyeong,
        roomCount: formData.space.rooms.room,
        livingRoomCount: formData.space.rooms.livingRoom,
        kitchenCount: formData.space.rooms.kitchen,
        bathroomCount: formData.space.rooms.bathroom,
        terraceCount: formData.space.rooms.terrace,
        bedCounts: toApiBedCounts(formData.space.beds),
        houseRules: formData.space.houseRules || undefined,
        introduction: formData.space.introduction || undefined,
        status: 'ACTIVE',
        isOperating: formData.isOperating,
        photos: apiPhotos.length > 0 ? apiPhotos : undefined,
      });

      // If role was upgraded (GUEST → HOST), refresh user state
      if (roleUpgraded) {
        await refreshUser();
      }

      // Navigate to properties list
      router.push('/host/properties');
    } catch (error) {
      console.error('Failed to save accommodation:', error);
      showToastMessage('숙소 저장에 실패했습니다.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      // Similar to handleSave but with status: 'DRAFT'
      let groupId: string | undefined;
      if (formData.groupName) {
        const existingGroup = groups.find((g) => g.name === formData.groupName);
        if (existingGroup) {
          groupId = existingGroup.id;
        } else {
          const newGroup = await createAccommodationGroup({
            name: formData.groupName,
            address: formData.address || undefined,
          });
          groupId = newGroup.id;
        }
      }

      // Convert photos to API format
      const apiPhotos = toApiPhotos(formData.mainPhotos);

      await createAccommodation({
        groupId,
        roomName: formData.roomName || '임시 저장',
        accommodationType: toApiAccommodationType(formData.accommodationType),
        buildingType: toApiBuildingType(formData.buildingType),
        usageTypes: toApiUsageTypes(formData.usageTypes),
        minReservationDays: formData.minReservationDays,
        address: formData.address || '주소 미입력',
        addressDetail: formData.addressDetail || undefined,
        zipCode: formData.zipCode || undefined,
        // 구조화된 주소 (다음 주소 API에서 파싱)
        roadAddress: formData.roadAddress || undefined,
        sido: formData.sido || undefined,
        sigungu: formData.sigungu || undefined,
        bname: formData.bname || undefined,
        buildingName: formData.buildingName || undefined,
        basePrice: formData.pricing.basePrice || 0,
        includesUtilities: formData.pricing.includesUtilities,
        weekendPrice: formData.pricing.weekendPrice,
        weekendDays: formData.pricing.weekendDays,
        managementFee: formData.pricing.managementFee,
        cleaningFee: formData.pricing.cleaningFee,
        extraPersonFee: formData.pricing.extraPersonFee,
        petFee: formData.pricing.petFee,
        capacity: formData.space.capacity || 1,
        genderRules: toApiGenderRules(formData.space.genderRules),
        sizeM2: formData.space.sizeM2,
        sizePyeong: formData.space.sizePyeong,
        roomCount: formData.space.rooms.room,
        livingRoomCount: formData.space.rooms.livingRoom,
        kitchenCount: formData.space.rooms.kitchen,
        bathroomCount: formData.space.rooms.bathroom,
        terraceCount: formData.space.rooms.terrace,
        bedCounts: toApiBedCounts(formData.space.beds),
        houseRules: formData.space.houseRules || undefined,
        introduction: formData.space.introduction || undefined,
        status: 'DRAFT',
        isOperating: false,
        photos: apiPhotos.length > 0 ? apiPhotos : undefined,
      });

      router.push('/host/properties');
    } catch (error) {
      console.error('Failed to save draft:', error);
      showToastMessage('임시 저장에 실패했습니다.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleAddGroup = async (groupName: string) => {
    if (!user?.id) return;

    try {
      const newGroup = await createAccommodationGroup({
        name: groupName,
      });

      setGroups([
        ...groups,
        {
          id: newGroup.id,
          name: newGroup.name,
          isSelected: false,
          accommodationIds: [],
        },
      ]);
    } catch (error) {
      console.error('Failed to create group:', error);
      showToastMessage('그룹 생성에 실패했습니다.', 'error');
    }
  };

  return (
    <div className="h-full flex flex-col bg-[hsl(var(--snug-light-gray))]">
      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Form Section */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6">
          <AccommodationForm
            initialData={formData}
            onChange={setFormData}
            groups={groups}
            onAddGroup={handleAddGroup}
          />
        </div>

        {/* Preview Panel - Desktop Only */}
        <div className="hidden lg:block w-[380px] flex-shrink-0 overflow-y-auto no-scrollbar p-6 border-l border-[hsl(var(--snug-border))] bg-[hsl(var(--snug-light-gray))]">
          <AccommodationPreviewPanel data={formData} />
        </div>
      </div>

      {/* Footer */}
      <AccommodationPageFooter
        onCancel={handleCancel}
        onSaveDraft={handleSaveDraft}
        onSave={handleSave}
        showDelete={false}
        isSaving={isSaving}
        isFormValid={isFormValid}
      />

      {/* Toast Notification */}
      {showToast && (
        <div
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 text-white text-sm rounded-lg shadow-lg z-50 flex items-center gap-2 ${
            toastType === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toastType === 'success' ? (
            <Check className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {toastMessage}
        </div>
      )}
    </div>
  );
}

// Edit Accommodation Page
interface AccommodationEditPageProps {
  accommodationId: string;
}

export function AccommodationEditPage({ accommodationId }: AccommodationEditPageProps) {
  const router = useRouter();
  const t = useTranslations('host.accommodation.page');
  const tCommon = useTranslations('common');
  const { user } = useAuthStore();
  const { setBreadcrumb, setHeaderActions } = useBreadcrumb();
  const [formData, setFormData] = useState<AccommodationFormData>(DEFAULT_FORM_DATA);
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Toast 상태
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Toast 표시 함수
  const showToastMessage = useCallback((message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }, []);

  // 필수값 유효성 검사
  const isFormValid = useMemo(() => {
    return !!(formData.roomName?.trim() && formData.address?.trim());
  }, [formData.roomName, formData.address]);

  // Set breadcrumb (only after data is loaded)
  useEffect(() => {
    if (!isLoading && formData.roomName) {
      setBreadcrumb([t('breadcrumbManagement'), formData.roomName]);
    }
    return () => setBreadcrumb([]);
  }, [setBreadcrumb, t, isLoading, formData.roomName]);

  // Set header actions (only after data is loaded)
  useEffect(() => {
    if (!isLoading) {
      setHeaderActions({
        lastModifiedBy: formData.lastModifiedAt,
        isOperating: formData.isOperating,
        onToggleOperating: (value: boolean) =>
          setFormData((prev) => ({ ...prev, isOperating: value })),
      });
    }
    return () => setHeaderActions({});
  }, [setHeaderActions, isLoading, formData.lastModifiedAt, formData.isOperating]);

  // Fetch groups and accommodation data on mount
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // 그룹과 숙소 데이터 병렬 로드
        const [fetchedGroups, accommodation] = await Promise.all([
          getAccommodationGroups(),
          getAccommodation(accommodationId),
        ]);

        // 그룹 설정
        const groupsArray = Array.isArray(fetchedGroups) ? fetchedGroups : [];
        const groupItems = groupsArray.map((g) => ({
          id: g.id,
          name: g.name,
          isSelected: false,
          accommodationIds: [],
        }));
        setGroups(groupItems);

        // 숙소 데이터를 폼 데이터로 변환
        if (accommodation) {
          // 그룹 이름 찾기
          const groupName = accommodation.groupId
            ? groupItems.find((g) => g.id === accommodation.groupId)?.name
            : undefined;

          const formDataFromApi = accommodationToFormData(accommodation, groupName);
          setFormData(formDataFromApi);
        } else {
          router.push('/host/properties');
        }
      } catch (error) {
        console.error('Failed to load accommodation:', error);
        showToastMessage('숙소 정보를 불러오는데 실패했습니다.', 'error');
        router.push('/host/properties');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [accommodationId, router, showToastMessage]);

  const handleSave = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      // Find or create group if specified
      let groupId: string | undefined | null = undefined;
      if (formData.groupName) {
        const existingGroup = groups.find((g) => g.name === formData.groupName);
        if (existingGroup) {
          groupId = existingGroup.id;
        } else {
          // Create new group
          const newGroup = await createAccommodationGroup({
            name: formData.groupName,
          });
          groupId = newGroup.id;
        }
      } else {
        groupId = null; // Disconnect from group
      }

      // Convert photos to API format
      const apiPhotos = toApiPhotos(formData.mainPhotos);

      // Update accommodation
      await updateAccommodation(accommodationId, {
        groupId,
        roomName: formData.roomName,
        accommodationType: toApiAccommodationType(formData.accommodationType),
        buildingType: toApiBuildingType(formData.buildingType),
        usageTypes: toApiUsageTypes(formData.usageTypes),
        minReservationDays: formData.minReservationDays,
        address: formData.address,
        addressDetail: formData.addressDetail || undefined,
        zipCode: formData.zipCode || undefined,
        roadAddress: formData.roadAddress || undefined,
        sido: formData.sido || undefined,
        sigungu: formData.sigungu || undefined,
        bname: formData.bname || undefined,
        buildingName: formData.buildingName || undefined,
        basePrice: formData.pricing.basePrice,
        includesUtilities: formData.pricing.includesUtilities,
        weekendPrice: formData.pricing.weekendPrice,
        weekendDays: formData.pricing.weekendDays,
        managementFee: formData.pricing.managementFee,
        cleaningFee: formData.pricing.cleaningFee,
        extraPersonFee: formData.pricing.extraPersonFee,
        petFee: formData.pricing.petFee,
        capacity: formData.space.capacity,
        genderRules: toApiGenderRules(formData.space.genderRules),
        sizeM2: formData.space.sizeM2,
        sizePyeong: formData.space.sizePyeong,
        roomCount: formData.space.rooms.room,
        livingRoomCount: formData.space.rooms.livingRoom,
        kitchenCount: formData.space.rooms.kitchen,
        bathroomCount: formData.space.rooms.bathroom,
        terraceCount: formData.space.rooms.terrace,
        bedCounts: toApiBedCounts(formData.space.beds),
        houseRules: formData.space.houseRules || undefined,
        introduction: formData.space.introduction || undefined,
        status: 'ACTIVE',
        isOperating: formData.isOperating,
        photos: apiPhotos.length > 0 ? apiPhotos : undefined,
      });

      router.push('/host/properties');
    } catch (error) {
      console.error('Failed to save accommodation:', error);
      showToastMessage('숙소 저장에 실패했습니다.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      // Similar to handleSave but with status: 'DRAFT'
      let groupId: string | undefined | null = undefined;
      if (formData.groupName) {
        const existingGroup = groups.find((g) => g.name === formData.groupName);
        if (existingGroup) {
          groupId = existingGroup.id;
        } else {
          const newGroup = await createAccommodationGroup({
            name: formData.groupName,
          });
          groupId = newGroup.id;
        }
      } else {
        groupId = null;
      }

      // Convert photos to API format
      const apiPhotos = toApiPhotos(formData.mainPhotos);

      await updateAccommodation(accommodationId, {
        groupId,
        roomName: formData.roomName || '임시 저장',
        accommodationType: toApiAccommodationType(formData.accommodationType),
        buildingType: toApiBuildingType(formData.buildingType),
        usageTypes: toApiUsageTypes(formData.usageTypes),
        minReservationDays: formData.minReservationDays,
        address: formData.address || '주소 미입력',
        addressDetail: formData.addressDetail || undefined,
        zipCode: formData.zipCode || undefined,
        roadAddress: formData.roadAddress || undefined,
        sido: formData.sido || undefined,
        sigungu: formData.sigungu || undefined,
        bname: formData.bname || undefined,
        buildingName: formData.buildingName || undefined,
        basePrice: formData.pricing.basePrice || 0,
        includesUtilities: formData.pricing.includesUtilities,
        weekendPrice: formData.pricing.weekendPrice,
        weekendDays: formData.pricing.weekendDays,
        managementFee: formData.pricing.managementFee,
        cleaningFee: formData.pricing.cleaningFee,
        extraPersonFee: formData.pricing.extraPersonFee,
        petFee: formData.pricing.petFee,
        capacity: formData.space.capacity || 1,
        genderRules: toApiGenderRules(formData.space.genderRules),
        sizeM2: formData.space.sizeM2,
        sizePyeong: formData.space.sizePyeong,
        roomCount: formData.space.rooms.room,
        livingRoomCount: formData.space.rooms.livingRoom,
        kitchenCount: formData.space.rooms.kitchen,
        bathroomCount: formData.space.rooms.bathroom,
        terraceCount: formData.space.rooms.terrace,
        bedCounts: toApiBedCounts(formData.space.beds),
        houseRules: formData.space.houseRules || undefined,
        introduction: formData.space.introduction || undefined,
        status: 'DRAFT',
        isOperating: false,
        photos: apiPhotos.length > 0 ? apiPhotos : undefined,
      });

      router.push('/host/properties');
    } catch (error) {
      console.error('Failed to save draft:', error);
      showToastMessage('임시 저장에 실패했습니다.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteAccommodation(accommodationId);
      router.push('/host/properties');
    } catch (error) {
      console.error('Failed to delete accommodation:', error);
      showToastMessage('숙소 삭제에 실패했습니다.', 'error');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleAddGroup = async (groupName: string) => {
    if (!user?.id) return;

    try {
      const newGroup = await createAccommodationGroup({
        name: groupName,
      });

      setGroups([
        ...groups,
        {
          id: newGroup.id,
          name: newGroup.name,
          isSelected: false,
          accommodationIds: [],
        },
      ]);
    } catch (error) {
      console.error('Failed to create group:', error);
      showToastMessage('그룹 생성에 실패했습니다.', 'error');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-[hsl(var(--snug-light-gray))]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[hsl(var(--snug-orange))] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-[hsl(var(--snug-gray))]">{tCommon('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[hsl(var(--snug-light-gray))]">
      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Form Section */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6">
          <AccommodationForm
            initialData={formData}
            onChange={setFormData}
            groups={groups}
            onAddGroup={handleAddGroup}
          />
        </div>

        {/* Preview Panel - Desktop Only */}
        <div className="hidden lg:block w-[380px] flex-shrink-0 overflow-y-auto no-scrollbar p-6 border-l border-[hsl(var(--snug-border))] bg-[hsl(var(--snug-light-gray))]">
          <AccommodationPreviewPanel data={formData} accommodationId={accommodationId} />
        </div>
      </div>

      {/* Footer */}
      <AccommodationPageFooter
        onDelete={handleDelete}
        onCancel={handleCancel}
        onSaveDraft={handleSaveDraft}
        onSave={handleSave}
        showDelete={true}
        isSaving={isSaving}
        isFormValid={isFormValid}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold text-[hsl(var(--snug-text-primary))] mb-2">
              {t('deleteConfirmTitle')}
            </h3>
            <p className="text-sm text-[hsl(var(--snug-gray))] mb-6">{t('deleteConfirmMessage')}</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-sm font-medium text-[hsl(var(--snug-text-primary))] border border-[hsl(var(--snug-border))] rounded-lg hover:bg-[hsl(var(--snug-light-gray))] transition-colors disabled:opacity-50"
              >
                {tCommon('cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-sm font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isDeleting ? t('deleting') : t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 text-white text-sm rounded-lg shadow-lg z-50 flex items-center gap-2 ${
            toastType === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toastType === 'success' ? (
            <Check className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {toastMessage}
        </div>
      )}
    </div>
  );
}

// Empty State Page (for list view when no accommodations)
export function AccommodationsEmptyPage() {
  const t = useTranslations('host.accommodation.page');

  return (
    <div className="h-full flex items-center justify-center bg-white">
      <div className="text-center">
        <p className="text-sm text-[hsl(var(--snug-gray))]">{t('emptyTitle')}</p>
        <p className="text-sm text-[hsl(var(--snug-gray))]">{t('emptyDescription')}</p>
        <button
          type="button"
          className="mt-4 px-6 py-3 text-sm font-bold text-white bg-[hsl(var(--snug-orange))] rounded-lg hover:opacity-90 transition-opacity"
        >
          {t('registerAccommodation')}
        </button>
      </div>
    </div>
  );
}
