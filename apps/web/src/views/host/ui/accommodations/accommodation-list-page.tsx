'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, Check, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AccommodationList } from './accommodation-list';
import { AccommodationListDetail } from './accommodation-list-detail';
import {
  GroupManagementModal,
  type GroupItem,
  type AccommodationSimple,
} from './group-management-modal';
import type { AccommodationListItem } from './types';
import {
  getAccommodations,
  getAccommodationGroups,
  updateAccommodation,
  deleteAccommodation,
} from '@/shared/api/accommodation/actions';
import type { Accommodation, AccommodationGroup } from '@snug/types';

/**
 * API Accommodation을 프론트엔드 AccommodationListItem으로 변환
 */
function toListItem(acc: Accommodation): AccommodationListItem {
  // 첫 번째 사진을 썸네일로 사용
  const thumbnailUrl = acc.photos?.[0]?.url || '';

  // usageType 변환 (API: 'STAY' | 'SHORT_TERM' → UI: 'stay' | 'short_term')
  const usageType = (acc.usageTypes[0]?.toLowerCase() as 'stay' | 'short_term') || 'stay';

  return {
    id: acc.id,
    thumbnailUrl,
    groupName: acc.group?.name,
    roomName: acc.roomName,
    nickname: undefined, // API에 별명 필드가 없음
    usageType,
    isOperating: acc.isOperating,
    pricing: {
      nights: 30, // 기본값
      includesUtilities: acc.includesUtilities,
      totalPrice: acc.basePrice,
    },
    address: acc.address,
    sharedSpace: {
      totalSizeM2: acc.sizeM2 || 0,
      description: `거실 ${acc.livingRoomCount}, 부엌 ${acc.kitchenCount}, 화장실 ${acc.bathroomCount}`,
    },
    privateSpace: {
      sizeM2: acc.sizeM2 || 0,
      description: `방 ${acc.roomCount}`,
    },
    houseRule: acc.houseRules || undefined,
  };
}

/**
 * API AccommodationGroup을 프론트엔드 GroupItem으로 변환
 */
function toGroupItem(group: AccommodationGroup, accommodations: Accommodation[]): GroupItem {
  const accommodationIds = accommodations
    .filter((acc) => acc.groupId === group.id)
    .map((acc) => acc.id);

  return {
    id: group.id,
    name: group.name,
    isSelected: false,
    accommodationIds,
  };
}

export function AccommodationListPage() {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState<AccommodationListItem | null>(null);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  // API 데이터 상태
  const [items, setItems] = useState<AccommodationListItem[]>([]);
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [accommodationSimples, setAccommodationSimples] = useState<AccommodationSimple[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 원본 Accommodation 데이터 (상태 업데이트에 필요)
  const [, setRawAccommodations] = useState<Accommodation[]>([]);

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

  /**
   * 데이터 로드
   */
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 숙소와 그룹 데이터를 병렬로 로드
      const [accommodationsData, groupsData] = await Promise.all([
        getAccommodations(),
        getAccommodationGroups(),
      ]);

      // 방어적 코딩: 배열 확인
      const accommodations = Array.isArray(accommodationsData) ? accommodationsData : [];
      const groups = Array.isArray(groupsData) ? groupsData : [];

      // 원본 데이터 저장
      setRawAccommodations(accommodations);

      // 프론트엔드 형식으로 변환
      const listItems = accommodations.map(toListItem);
      setItems(listItems);

      // 그룹 데이터 변환
      const groupItems = groups.map((g) => toGroupItem(g, accommodations));
      setGroups(groupItems);

      // 그룹 모달용 간단한 숙소 목록
      const simples: AccommodationSimple[] = accommodations.map((acc) => ({
        id: acc.id,
        name: acc.roomName,
      }));
      setAccommodationSimples(simples);
    } catch (err) {
      console.error('Failed to load accommodations:', err);
      setError('숙소 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSelect = (item: AccommodationListItem) => {
    setSelectedItem(item);
  };

  const handleCloseDetail = () => {
    setSelectedItem(null);
  };

  const handleNewAccommodation = () => {
    router.push('/host/properties/new');
  };

  const handleGroupManage = () => {
    setIsGroupModalOpen(true);
  };

  const handleGroupSave = async (updatedGroups: GroupItem[]) => {
    setGroups(updatedGroups);
    // 그룹 변경사항은 개별 API 호출로 처리해야 함
    // 현재는 로컬 상태만 업데이트
  };

  /**
   * 일괄 운영상태 변경
   */
  const handleBulkStatusChange = async (ids: string[], status: boolean) => {
    try {
      // 모든 선택된 숙소의 운영상태를 병렬로 업데이트
      await Promise.all(ids.map((id) => updateAccommodation(id, { isOperating: status })));

      // 로컬 상태 업데이트
      setItems((prev) =>
        prev.map((item) => (ids.includes(item.id) ? { ...item, isOperating: status } : item)),
      );

      // 선택된 아이템도 업데이트
      if (selectedItem && ids.includes(selectedItem.id)) {
        setSelectedItem({ ...selectedItem, isOperating: status });
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      showToastMessage('운영상태 변경에 실패했습니다.', 'error');
    }
  };

  /**
   * 일괄 삭제
   */
  const handleBulkDelete = async (ids: string[]) => {
    if (!confirm(`${ids.length}개의 숙소를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      // 모든 선택된 숙소를 병렬로 삭제
      await Promise.all(ids.map((id) => deleteAccommodation(id)));

      // 로컬 상태 업데이트
      setItems((prev) => prev.filter((item) => !ids.includes(item.id)));

      // 선택된 아이템이 삭제된 경우 선택 해제
      if (selectedItem && ids.includes(selectedItem.id)) {
        setSelectedItem(null);
      }
    } catch (err) {
      console.error('Failed to delete accommodations:', err);
      showToastMessage('숙소 삭제에 실패했습니다.', 'error');
    }
  };

  const handleEditInfo = (id: string) => {
    router.push(`/host/properties/${id}/edit`);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleManagePricing = (id: string) => {
    // TODO: 가격 관리 페이지 구현 후 라우팅
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--snug-orange))]" />
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white gap-4">
        <p className="text-[hsl(var(--snug-gray))]">{error}</p>
        <button
          type="button"
          onClick={loadData}
          className="px-4 py-2 text-sm font-medium text-white bg-[hsl(var(--snug-orange))] rounded-lg hover:opacity-90"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* List Section */}
        <div className={`${selectedItem ? 'hidden md:block md:flex-1' : 'flex-1'} overflow-hidden`}>
          <AccommodationList
            items={items}
            selectedId={selectedItem?.id}
            onSelect={handleSelect}
            onNewAccommodation={handleNewAccommodation}
            onGroupManage={handleGroupManage}
            onBulkStatusChange={handleBulkStatusChange}
            onBulkDelete={handleBulkDelete}
          />
        </div>

        {/* Detail Panel - Desktop */}
        {selectedItem && (
          <div className="hidden md:block w-[380px] flex-shrink-0">
            <AccommodationListDetail
              item={selectedItem}
              onClose={handleCloseDetail}
              onEditInfo={handleEditInfo}
              onManagePricing={handleManagePricing}
            />
          </div>
        )}

        {/* Detail Panel - Mobile (Full Screen) */}
        {selectedItem && (
          <div className="md:hidden fixed inset-0 z-50 bg-white">
            <div className="h-full flex flex-col">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[hsl(var(--snug-border))]">
                <button
                  type="button"
                  onClick={handleCloseDetail}
                  className="p-2 hover:bg-[hsl(var(--snug-light-gray))] rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="font-bold">숙소 상세</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <AccommodationListDetail
                  item={selectedItem}
                  onClose={handleCloseDetail}
                  onEditInfo={handleEditInfo}
                  onManagePricing={handleManagePricing}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Group Management Modal */}
      <GroupManagementModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        groups={groups}
        accommodations={accommodationSimples}
        onSave={handleGroupSave}
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
