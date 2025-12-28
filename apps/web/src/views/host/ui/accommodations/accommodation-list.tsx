'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Search, ChevronDown, ChevronUp, MoreVertical } from 'lucide-react';
import Image from 'next/image';
import type { AccommodationListItem, AccommodationListFilter } from './types';

interface FilterTab {
  id: AccommodationListFilter;
  label: string;
  count: number;
}

interface AccommodationListProps {
  items?: AccommodationListItem[];
  selectedId?: string;
  onSelect: (item: AccommodationListItem) => void;
  onNewAccommodation: () => void;
  onGroupManage: () => void;
  onBulkStatusChange: (ids: string[], status: boolean) => void;
  onBulkDelete?: (ids: string[]) => void;
}

export function AccommodationList({
  items = [],
  selectedId,
  onSelect,
  onNewAccommodation,
  onGroupManage,
  onBulkStatusChange,
  onBulkDelete,
}: AccommodationListProps) {
  const t = useTranslations('host.accommodation.list');
  const tUsageTypes = useTranslations('host.accommodation.usageTypes');

  const [activeFilter, setActiveFilter] = useState<AccommodationListFilter>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const operatingCount = items.filter((item) => item.isOperating).length;
  const notOperatingCount = items.filter((item) => !item.isOperating).length;

  const FILTERS: FilterTab[] = [
    { id: 'all', label: t('all'), count: items.length },
    { id: 'operating', label: t('operating'), count: operatingCount },
    { id: 'not_operating', label: t('notOperating'), count: notOperatingCount },
  ];

  const filteredItems = items.filter((item) => {
    if (activeFilter === 'operating') return item.isOperating;
    if (activeFilter === 'not_operating') return !item.isOperating;
    return true;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((item) => item.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const getUsageTypeLabel = (type: string) => {
    try {
      return tUsageTypes(type);
    } catch {
      return type;
    }
  };

  const getDisplayName = (item: AccommodationListItem) => {
    let name = item.roomName;
    if (item.groupName) {
      name += `(${item.groupName})`;
    }
    if (item.nickname) {
      name = `${item.groupName ?? ''} ${item.roomName}(${item.nickname})`;
    }
    return name;
  };

  const handleBulkStatusChange = (status: boolean) => {
    onBulkStatusChange(selectedIds, status);
    setSelectedIds([]);
    setIsStatusDropdownOpen(false);
  };

  const handleBulkDelete = () => {
    onBulkDelete?.(selectedIds);
    setSelectedIds([]);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 md:px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[hsl(var(--snug-text-primary))]">
            {t('title')} <span className="text-[hsl(var(--snug-orange))]">{items.length}</span>
          </h2>
          <div className="flex items-center gap-2 md:gap-3">
            <button
              type="button"
              className="p-2 hover:bg-[hsl(var(--snug-light-gray))] rounded-lg transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-[hsl(var(--snug-text-primary))]" />
            </button>
            {/* PC: Show buttons directly */}
            <button
              type="button"
              onClick={onGroupManage}
              className="hidden md:block px-4 py-2 text-sm font-medium text-[hsl(var(--snug-text-primary))] border border-[hsl(var(--snug-border))] rounded-lg hover:bg-[hsl(var(--snug-light-gray))] transition-colors"
            >
              {t('groupManage')}
            </button>
            <button
              type="button"
              onClick={onNewAccommodation}
              className="hidden md:block px-4 py-2 text-sm font-bold text-white bg-[hsl(var(--snug-orange))] rounded-lg hover:opacity-90 transition-opacity"
            >
              {t('newRegistration')}
            </button>
            {/* Mobile: More menu */}
            <div className="relative md:hidden">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 hover:bg-[hsl(var(--snug-light-gray))] rounded-lg transition-colors"
                aria-label="More options"
              >
                <MoreVertical className="w-5 h-5 text-[hsl(var(--snug-text-primary))]" />
              </button>
              {isMobileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsMobileMenuOpen(false)} />
                  <div className="absolute top-full right-0 mt-1 bg-white border border-[hsl(var(--snug-border))] rounded-lg shadow-lg z-20 min-w-[120px]">
                    <button
                      type="button"
                      onClick={() => {
                        onNewAccommodation();
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full px-4 py-3 text-sm text-right hover:bg-[hsl(var(--snug-light-gray))] text-[hsl(var(--snug-text-primary))]"
                    >
                      {t('newRegistration')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onGroupManage();
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full px-4 py-3 text-sm text-right hover:bg-[hsl(var(--snug-light-gray))] text-[hsl(var(--snug-text-primary))]"
                    >
                      {t('groupManage')}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 text-sm rounded-full border transition-colors ${
                  activeFilter === filter.id
                    ? 'border-[hsl(var(--snug-orange))] text-[hsl(var(--snug-orange))]'
                    : 'border-[hsl(var(--snug-border))] text-[hsl(var(--snug-gray))] hover:border-[hsl(var(--snug-gray))]'
                }`}
              >
                {filter.label} {filter.count}
              </button>
            ))}
          </div>

          {/* Bulk Status Change */}
          {selectedIds.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-[hsl(var(--snug-text-primary))] hover:bg-[hsl(var(--snug-light-gray))] rounded-lg transition-colors"
              >
                {t('changeStatus')}
                {isStatusDropdownOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              {isStatusDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsStatusDropdownOpen(false)}
                  />
                  <div className="absolute top-full right-0 mt-1 bg-white border border-[hsl(var(--snug-border))] rounded-lg shadow-lg z-20 min-w-[120px]">
                    <button
                      type="button"
                      onClick={() => handleBulkStatusChange(true)}
                      className="block w-full px-4 py-3 text-sm text-left hover:bg-[hsl(var(--snug-light-gray))] text-[hsl(var(--snug-text-primary))]"
                    >
                      {t('operatingShort')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBulkStatusChange(false)}
                      className="block w-full px-4 py-3 text-sm text-left hover:bg-[hsl(var(--snug-light-gray))] text-[hsl(var(--snug-text-primary))]"
                    >
                      {t('notOperatingShort')}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-white border-b border-[hsl(var(--snug-border))]">
            <tr>
              <th className="w-10 md:w-12 px-2 md:px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredItems.length && filteredItems.length > 0}
                  onChange={toggleSelectAll}
                  className="w-5 h-5 rounded border-[hsl(var(--snug-border))] text-[hsl(var(--snug-orange))] focus:ring-[hsl(var(--snug-orange))]"
                />
              </th>
              {/* Mobile: Show bulk action buttons when selected */}
              {selectedIds.length > 0 ? (
                <>
                  <th className="px-2 py-3 text-left md:hidden">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleBulkStatusChange(true)}
                        className="px-3 py-1.5 text-sm font-medium text-[hsl(var(--snug-text-primary))] bg-[hsl(var(--snug-light-gray))] rounded-lg"
                      >
                        {t('operatingShort')}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBulkStatusChange(false)}
                        className="px-3 py-1.5 text-sm font-medium text-[hsl(var(--snug-text-primary))] bg-[hsl(var(--snug-light-gray))] rounded-lg"
                      >
                        {t('notOperatingShort')}
                      </button>
                    </div>
                  </th>
                  <th className="hidden md:table-cell px-2 md:px-4 py-3 text-left text-sm font-medium text-[hsl(var(--snug-gray))]">
                    {t('table.accommodationInfo')}
                  </th>
                  <th className="hidden md:table-cell px-2 md:px-4 py-3 text-left text-sm font-medium text-[hsl(var(--snug-gray))]">
                    {t('table.accommodationType')}
                  </th>
                  <th className="px-2 md:px-4 py-3 text-right md:text-left text-sm font-medium text-[hsl(var(--snug-gray))]">
                    <span className="hidden md:inline">{t('table.operatingStatus')}</span>
                    <button
                      type="button"
                      onClick={handleBulkDelete}
                      className="md:hidden text-[hsl(var(--snug-gray))]"
                    >
                      {t('delete')}
                    </button>
                  </th>
                </>
              ) : (
                <>
                  <th className="px-2 md:px-4 py-3 text-left text-sm font-medium text-[hsl(var(--snug-gray))]">
                    {t('table.accommodationInfo')}
                  </th>
                  <th className="px-2 md:px-4 py-3 text-left text-sm font-medium text-[hsl(var(--snug-gray))]">
                    {t('table.accommodationType')}
                  </th>
                  <th className="px-2 md:px-4 py-3 text-left text-sm font-medium text-[hsl(var(--snug-gray))]">
                    {t('table.operatingStatus')}
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr
                key={item.id}
                onClick={() => onSelect(item)}
                className={`border-b border-[hsl(var(--snug-border))] cursor-pointer transition-colors ${
                  selectedId === item.id
                    ? 'bg-[hsl(var(--snug-light-gray))]'
                    : 'hover:bg-[hsl(var(--snug-light-gray))]/50'
                }`}
              >
                <td className="w-10 md:w-12 px-2 md:px-4 py-3 md:py-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleSelect(item.id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-5 h-5 rounded border-[hsl(var(--snug-border))] text-[hsl(var(--snug-orange))] focus:ring-[hsl(var(--snug-orange))]"
                  />
                </td>
                <td className="px-2 md:px-4 py-3 md:py-4">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-14 h-10 md:w-16 md:h-12 rounded-lg overflow-hidden flex-shrink-0 bg-[hsl(var(--snug-light-gray))]">
                      {item.thumbnailUrl ? (
                        <Image
                          src={item.thumbnailUrl}
                          alt={item.roomName}
                          width={64}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-50" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-[hsl(var(--snug-text-primary))] line-clamp-2">
                        {getDisplayName(item)}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-2 md:px-4 py-3 md:py-4 whitespace-nowrap">
                  <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                    {getUsageTypeLabel(item.usageType)}
                  </span>
                </td>
                <td className="px-2 md:px-4 py-3 md:py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        item.isOperating
                          ? 'bg-[hsl(var(--snug-orange))]'
                          : 'bg-[hsl(var(--snug-gray))]'
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        item.isOperating
                          ? 'text-[hsl(var(--snug-text-primary))]'
                          : 'text-[hsl(var(--snug-gray))]'
                      }`}
                    >
                      <span className="md:hidden">
                        {item.isOperating ? t('operatingShort') : t('notOperatingShort')}
                      </span>
                      <span className="hidden md:inline">
                        {item.isOperating ? t('operating') : t('notOperating')}
                      </span>
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
