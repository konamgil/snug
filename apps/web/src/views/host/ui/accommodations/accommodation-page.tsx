'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AccommodationForm } from './accommodation-form';
import { AccommodationPreviewPanel } from './accommodation-preview-panel';
import type { AccommodationFormData } from './types';
import { DEFAULT_FORM_DATA } from './types';

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
}

function AccommodationPageFooter({
  onDelete,
  onCancel,
  onSaveDraft,
  onSave,
  showDelete = false,
}: AccommodationPageFooterProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-[hsl(var(--snug-border))]">
      <div>
        {showDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="px-6 py-3 text-sm font-medium text-[hsl(var(--snug-text-primary))] border border-[hsl(var(--snug-border))] rounded-lg hover:bg-[hsl(var(--snug-light-gray))] transition-colors"
          >
            삭제
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 text-sm font-medium text-[hsl(var(--snug-text-primary))] border border-[hsl(var(--snug-border))] rounded-lg hover:bg-[hsl(var(--snug-light-gray))] transition-colors"
        >
          취소
        </button>
        <button
          type="button"
          onClick={onSaveDraft}
          className="px-6 py-3 text-sm font-medium text-[hsl(var(--snug-text-primary))] border border-[hsl(var(--snug-border))] rounded-lg hover:bg-[hsl(var(--snug-light-gray))] transition-colors"
        >
          임시저장
        </button>
        <button
          type="button"
          onClick={onSave}
          className="px-6 py-3 text-sm font-bold text-white bg-[hsl(var(--snug-orange))] rounded-lg hover:opacity-90 transition-opacity"
        >
          저장
        </button>
      </div>
    </div>
  );
}

// New Accommodation Page
export function AccommodationNewPage() {
  const [formData, setFormData] = useState<AccommodationFormData>(DEFAULT_FORM_DATA);

  const handleSave = () => {
    console.log('Save accommodation:', formData);
  };

  const handleSaveDraft = () => {
    console.log('Save draft:', formData);
  };

  const handleCancel = () => {
    console.log('Cancel');
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
          <AccommodationForm initialData={formData} onChange={setFormData} />
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
      />
    </div>
  );
}

// Edit Accommodation Page
interface AccommodationEditPageProps {
  accommodationId: string;
}

export function AccommodationEditPage({ accommodationId }: AccommodationEditPageProps) {
  // In real app, fetch data based on accommodationId
  const [formData, setFormData] = useState<AccommodationFormData>({
    ...DEFAULT_FORM_DATA,
    openDate: '2025.01.01',
    lastModifiedBy: '2025.05.30 김러그',
    isOperating: false,
  });

  const handleSave = () => {
    console.log('Save accommodation:', formData);
  };

  const handleSaveDraft = () => {
    console.log('Save draft:', formData);
  };

  const handleCancel = () => {
    console.log('Cancel');
  };

  const handleDelete = () => {
    console.log('Delete accommodation:', accommodationId);
  };

  return (
    <div className="h-full flex flex-col bg-[hsl(var(--snug-light-gray))]">
      {/* Header */}
      <AccommodationPageHeader
        breadcrumb={['숙소 관리', '신규등록']}
        openDate={formData.openDate}
        lastModifiedBy={formData.lastModifiedBy}
        isOperating={formData.isOperating}
        onToggleOperating={(value) => setFormData((prev) => ({ ...prev, isOperating: value }))}
      />

      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Form Section */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6">
          <AccommodationForm initialData={formData} onChange={setFormData} />
        </div>

        {/* Preview Panel - Desktop Only */}
        <div className="hidden lg:block w-[380px] flex-shrink-0 overflow-y-auto no-scrollbar p-6 border-l border-[hsl(var(--snug-border))] bg-[hsl(var(--snug-light-gray))]">
          <AccommodationPreviewPanel data={formData} />
        </div>
      </div>

      {/* Footer */}
      <AccommodationPageFooter
        onDelete={handleDelete}
        onCancel={handleCancel}
        onSaveDraft={handleSaveDraft}
        onSave={handleSave}
        showDelete={true}
      />
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
