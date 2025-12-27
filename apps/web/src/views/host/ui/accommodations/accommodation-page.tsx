'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

interface AccommodationPageHeaderProps {
  breadcrumb: string[];
  openDate?: string;
  lastModifiedBy?: string;
  isOperating: boolean;
  onToggleOperating: (value: boolean) => void;
}

function AccommodationPageHeader({
  breadcrumb,
  openDate,
  lastModifiedBy,
  isOperating,
  onToggleOperating,
}: AccommodationPageHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-[hsl(var(--snug-border))]">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="p-2 hover:bg-[hsl(var(--snug-light-gray))] rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-[hsl(var(--snug-text-primary))]" />
        </button>
        <nav className="flex items-center gap-2 text-sm">
          {breadcrumb.map((item, index) => (
            <span key={item} className="flex items-center gap-2">
              {index > 0 && <ChevronRight className="w-4 h-4 text-[hsl(var(--snug-gray))]" />}
              <span
                className={
                  index === breadcrumb.length - 1
                    ? 'font-bold text-[hsl(var(--snug-text-primary))]'
                    : 'text-[hsl(var(--snug-gray))]'
                }
              >
                {item}
              </span>
            </span>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4 text-sm">
        {/* Meta Info */}
        {openDate && (
          <>
            <span className="text-[hsl(var(--snug-gray))]">{openDate} 오픈</span>
            <span className="text-[hsl(var(--snug-border))]">|</span>
          </>
        )}
        {lastModifiedBy && (
          <>
            <span className="text-[hsl(var(--snug-gray))]">{lastModifiedBy}</span>
            <span className="text-[hsl(var(--snug-border))]">|</span>
          </>
        )}

        {/* Operating Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleOperating(!isOperating)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              isOperating ? 'bg-[hsl(var(--snug-orange))]' : 'bg-[hsl(var(--snug-gray))]'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                isOperating ? 'left-7' : 'left-1'
              }`}
            />
          </button>
          <span className="text-[hsl(var(--snug-text-primary))]">
            {isOperating ? '운영 중' : '미운영 중'}
          </span>
        </div>
      </div>
    </div>
  );
}

interface AccommodationPageFooterProps {
  onDelete?: () => void;
  onCancel?: () => void;
  onSaveDraft?: () => void;
  onSave?: () => void;
  showDelete?: boolean;
  isSaving?: boolean;
}

function AccommodationPageFooter({
  onDelete,
  onCancel,
  onSaveDraft,
  onSave,
  showDelete = false,
  isSaving = false,
}: AccommodationPageFooterProps) {
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
            삭제
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
          취소
        </button>
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={isSaving}
          className="px-6 py-3 text-sm font-medium text-[hsl(var(--snug-text-primary))] border border-[hsl(var(--snug-border))] rounded-lg hover:bg-[hsl(var(--snug-light-gray))] transition-colors disabled:opacity-50"
        >
          {isSaving ? '저장 중...' : '임시저장'}
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="px-6 py-3 text-sm font-bold text-white bg-[hsl(var(--snug-orange))] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSaving ? '저장 중...' : '저장'}
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
  const { user, refreshUser } = useAuthStore();
  const [formData, setFormData] = useState<AccommodationFormData>(DEFAULT_FORM_DATA);
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

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
      }
    }
    loadGroups();
  }, [user?.id]);

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
      const { accommodation: _accommodation, roleUpgraded } = await createAccommodation({
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
      // TODO: Show error toast
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
    }
  };

  return (
    <div className="h-full flex flex-col bg-[hsl(var(--snug-light-gray))]">
      {/* Header */}
      <AccommodationPageHeader
        breadcrumb={['숙소 관리', '신규등록']}
        isOperating={formData.isOperating}
        onToggleOperating={(value) => setFormData((prev) => ({ ...prev, isOperating: value }))}
      />

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
      />
    </div>
  );
}

// Edit Accommodation Page
interface AccommodationEditPageProps {
  accommodationId: string;
}

export function AccommodationEditPage({ accommodationId }: AccommodationEditPageProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [formData, setFormData] = useState<AccommodationFormData>(DEFAULT_FORM_DATA);
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
        router.push('/host/properties');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [accommodationId, router]);

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

      console.log('Accommodation updated successfully');
      router.push('/host/properties');
    } catch (error) {
      console.error('Failed to save accommodation:', error);
      // TODO: Show error toast
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
      console.log('Accommodation deleted successfully');
      router.push('/host/properties');
    } catch (error) {
      console.error('Failed to delete accommodation:', error);
      // TODO: Show error toast
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
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-[hsl(var(--snug-light-gray))]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[hsl(var(--snug-orange))] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-[hsl(var(--snug-gray))]">숙소 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // Debug: log formData before render
  console.log('[EditPage] Rendering with formData:', formData);
  console.log('[EditPage] formData.roomName:', formData.roomName);
  console.log('[EditPage] formData.address:', formData.address);

  return (
    <div className="h-full flex flex-col bg-[hsl(var(--snug-light-gray))]">
      {/* Header */}
      <AccommodationPageHeader
        breadcrumb={['숙소 관리', formData.roomName || '수정']}
        openDate={formData.openDate}
        lastModifiedBy={formData.lastModifiedAt}
        isOperating={formData.isOperating}
        onToggleOperating={(value) => setFormData((prev) => ({ ...prev, isOperating: value }))}
      />

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
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold text-[hsl(var(--snug-text-primary))] mb-2">
              숙소 삭제
            </h3>
            <p className="text-sm text-[hsl(var(--snug-gray))] mb-6">
              정말로 이 숙소를 삭제하시겠습니까?
              <br />
              삭제된 숙소는 복구할 수 없습니다.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-sm font-medium text-[hsl(var(--snug-text-primary))] border border-[hsl(var(--snug-border))] rounded-lg hover:bg-[hsl(var(--snug-light-gray))] transition-colors disabled:opacity-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-sm font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isDeleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Empty State Page (for list view when no accommodations)
export function AccommodationsEmptyPage() {
  return (
    <div className="h-full flex items-center justify-center bg-white">
      <div className="text-center">
        <p className="text-sm text-[hsl(var(--snug-gray))]">아직 등록된 숙소가 없습니다.</p>
        <p className="text-sm text-[hsl(var(--snug-gray))]">숙소를 등록하여 관리를 시작해보세요.</p>
        <button
          type="button"
          className="mt-4 px-6 py-3 text-sm font-bold text-white bg-[hsl(var(--snug-orange))] rounded-lg hover:opacity-90 transition-opacity"
        >
          숙소 등록하기
        </button>
      </div>
    </div>
  );
}
