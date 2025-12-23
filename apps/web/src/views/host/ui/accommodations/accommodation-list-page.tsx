'use client';

import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AccommodationList } from './accommodation-list';
import { AccommodationListDetail } from './accommodation-list-detail';
import type { AccommodationListItem } from './types';

export function AccommodationListPage() {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState<AccommodationListItem | null>(null);

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
    console.log('Group manage');
  };

  const handleBulkStatusChange = (ids: string[], status: boolean) => {
    console.log('Bulk status change:', ids, status);
  };

  const handleBulkDelete = (ids: string[]) => {
    console.log('Bulk delete:', ids);
  };

  const handleEditInfo = (id: string) => {
    router.push(`/host/properties/${id}/edit`);
  };

  const handleManagePricing = (id: string) => {
    console.log('Manage pricing:', id);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* List Section */}
        <div className={`${selectedItem ? 'hidden md:block md:flex-1' : 'flex-1'} overflow-hidden`}>
          <AccommodationList
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
    </div>
  );
}
