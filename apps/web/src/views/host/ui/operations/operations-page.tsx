'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import { InquiryDetailPanel, type InquiryDetailData } from './inquiry-detail-panel';
import { InquiryChatView } from './inquiry-chat-view';
import { ComingSoonOverlay } from '../coming-soon-overlay';

type InquiryType = 'cleaning' | 'repair' | 'bedding';
type InquiryStatus = 'received' | 'in_progress' | 'completed';
type FilterTab = 'all' | 'received' | 'in_progress' | 'completed';

interface Inquiry {
  id: string;
  receivedDate: string;
  questioner: string;
  content: string;
  type: InquiryType;
  processedDate: string;
  status: InquiryStatus;
}

// Inquiry type colors (labels will be translated)
const inquiryTypeColors: Record<InquiryType, { bgColor: string; textColor: string }> = {
  cleaning: {
    bgColor: 'bg-[#d0e2ff]',
    textColor: 'text-[#0043ce]',
  },
  repair: {
    bgColor: 'bg-[#ffd7d9]',
    textColor: 'text-[#a2191f]',
  },
  bedding: {
    bgColor: 'bg-[#9ef0f0]',
    textColor: 'text-[#005d5d]',
  },
};

// Mock data
const mockInquiries: Inquiry[] = [
  {
    id: '1',
    receivedDate: '25.09.12',
    questioner: 'Evelyn',
    content: 'I just arrived safely. Could I have an extra blanket?',
    type: 'bedding',
    processedDate: '-',
    status: 'received',
  },
  {
    id: '2',
    receivedDate: '25.09.01',
    questioner: 'Michael',
    content:
      'Could you please arrange for a general cleaning during my stay? It would be great if the living room and kitchen could be refreshed.',
    type: 'cleaning',
    processedDate: '25.09.01',
    status: 'completed',
  },
  {
    id: '3',
    receivedDate: '25.08.26',
    questioner: 'Lee',
    content: 'Would it be possible to request a cleaning service for the entire apartment?',
    type: 'cleaning',
    processedDate: '25.08.26',
    status: 'completed',
  },
  {
    id: '4',
    receivedDate: '25.08.25',
    questioner: 'Daniel',
    content:
      'The bathroom sink seems to be leaking. Would it be possible to have someone take a look at it soon?',
    type: 'repair',
    processedDate: '25.08.25',
    status: 'in_progress',
  },
  {
    id: '5',
    receivedDate: '25.08.22',
    questioner: 'Noah',
    content:
      'Could I please request an extra set of bed linens? It would be helpful to have a spare sheet and pillowcase.',
    type: 'bedding',
    processedDate: '25.08.22',
    status: 'completed',
  },
  {
    id: '6',
    receivedDate: '25.08.20',
    questioner: 'Liam',
    content:
      'Hello, the door lock is a bit difficult to open and close. Could you please send someone to check and fix it?',
    type: 'repair',
    processedDate: '25.08.20',
    status: 'in_progress',
  },
  {
    id: '7',
    receivedDate: '25.08.16',
    questioner: 'Noah',
    content:
      'Hi, I noticed that the air conditioner is not working properly. Could you please arrange for it to be repaired during my stay?',
    type: 'repair',
    processedDate: '25.08.16',
    status: 'received',
  },
  {
    id: '8',
    receivedDate: '25.08.13',
    questioner: 'Olivia',
    content:
      'Can I schedule a cleaning at a convenient time for you? Ideally sometime tomorrow afternoon if that works.',
    type: 'cleaning',
    processedDate: '25.08.13',
    status: 'completed',
  },
  {
    id: '9',
    receivedDate: '25.07.21',
    questioner: 'Grace',
    content:
      'Is it possible to have the bathroom cleaned more thoroughly? The shower area especially could use some attention.',
    type: 'cleaning',
    processedDate: '25.07.21',
    status: 'completed',
  },
];

// Inquiry Type Badge Component
function InquiryTypeBadge({ type, label }: { type: InquiryType; label: string }) {
  const colors = inquiryTypeColors[type];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-normal ${colors.bgColor} ${colors.textColor}`}
    >
      {label}
    </span>
  );
}

// Filter Tab Component
function FilterTabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-1 rounded-full text-xs font-medium border transition-colors ${
        active
          ? 'border-[hsl(var(--snug-orange))] text-[hsl(var(--snug-orange))] bg-white'
          : 'border-[#bababa] text-black bg-white hover:bg-[#f4f4f4]'
      }`}
    >
      {label}
    </button>
  );
}

export function OperationsPage() {
  const t = useTranslations('host.operations');
  const tTypes = useTranslations('host.operations.inquiryTypes');
  const tFilters = useTranslations('host.operations.filters');
  const tTable = useTranslations('host.operations.table');
  const tRequestTypes = useTranslations('host.operations.requestTypes');

  const [selectedFilter, setSelectedFilter] = useState<FilterTab>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [showChatView, setShowChatView] = useState(false);

  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: tFilters('all') },
    { key: 'received', label: tFilters('received') },
    { key: 'in_progress', label: tFilters('inProgress') },
    { key: 'completed', label: tFilters('completed') },
  ];

  const getInquiryTypeLabel = (type: InquiryType): string => {
    return tTypes(type);
  };

  // Filter inquiries based on selected tab
  const filteredInquiries = mockInquiries.filter((inquiry) => {
    if (selectedFilter === 'all') return true;
    return inquiry.status === selectedFilter;
  });

  // Convert Inquiry to InquiryDetailData
  const getDetailData = (inquiry: Inquiry): InquiryDetailData => ({
    id: inquiry.id,
    guestName: inquiry.questioner,
    inquiryDateTime: `${inquiry.receivedDate} 06:30`,
    requestType:
      inquiry.type === 'bedding'
        ? tRequestTypes('beddingRequest')
        : inquiry.type === 'cleaning'
          ? tRequestTypes('cleaningRequest')
          : tRequestTypes('repairRequest'),
    requestDetails: inquiry.type === 'bedding' ? ['베개, 이불 추가 요청'] : [inquiry.content],
    desiredDate: '25.09.12 10:00',
    location: 'Seoul Dwell 201호',
    keywords: [getInquiryTypeLabel(inquiry.type)],
    managerVisitDate: '25.09.12',
    managerVisitTime: '10:00',
    managerStatus: 'pending',
  });

  const handleRowClick = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setShowChatView(false);
  };

  const handleClosePanel = () => {
    setSelectedInquiry(null);
    setShowChatView(false);
  };

  const handleOpenChat = () => {
    setShowChatView(true);
  };

  const handleCloseChat = () => {
    setShowChatView(false);
  };

  return (
    <ComingSoonOverlay>
      <div className="flex h-full">
        {/* Main Content */}
        <div
          className={`flex-1 bg-white overflow-auto transition-all ${selectedInquiry ? 'mr-[354px]' : ''}`}
        >
          {showChatView && selectedInquiry ? (
            <InquiryChatView guestName={selectedInquiry.questioner} onClose={handleCloseChat} />
          ) : (
            <div className="p-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-1">
                  <h2 className="text-lg font-bold text-black">{t('customerInquiry')}</h2>
                  <span className="text-lg font-bold text-[hsl(var(--snug-orange))]">
                    {filteredInquiries.length}
                  </span>
                </div>
                <button
                  type="button"
                  className="p-2 hover:bg-[#f4f4f4] rounded-lg transition-colors"
                >
                  <Search className="w-4 h-4 text-[#161616]" />
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-3.5 mb-6">
                {filterTabs.map((tab) => (
                  <FilterTabButton
                    key={tab.key}
                    active={selectedFilter === tab.key}
                    label={tab.label}
                    onClick={() => setSelectedFilter(tab.key)}
                  />
                ))}
              </div>

              {/* Table Header */}
              <div className="flex items-center text-xs font-bold text-black mb-2 px-0.5">
                <div className="w-[60px]">{tTable('receivedDate')}</div>
                <div className="w-[70px]">{tTable('questioner')}</div>
                <div className="flex-1">{tTable('inquiryContent')}</div>
                <div className="w-[70px] text-center">{tTable('inquiryType')}</div>
                <div className="w-[60px] text-center">{tTable('processedDate')}</div>
              </div>
              <div className="border-t border-[#a8a8a8] mb-2" />

              {/* Table Body */}
              <div className="space-y-0">
                {filteredInquiries.map((inquiry) => (
                  <div
                    key={inquiry.id}
                    onClick={() => handleRowClick(inquiry)}
                    className={`flex items-center py-3 px-0.5 border-b border-[#f0f0f0] cursor-pointer hover:bg-[#f4f4f4] transition-colors ${
                      selectedInquiry?.id === inquiry.id ? 'bg-[#f4f4f4]' : ''
                    }`}
                  >
                    <div className="w-[60px] text-xs text-black">{inquiry.receivedDate}</div>
                    <div className="w-[70px] text-xs text-black">{inquiry.questioner}</div>
                    <div className="flex-1 text-xs text-black pr-4 line-clamp-2">
                      {inquiry.content}
                    </div>
                    <div className="w-[70px] flex justify-center">
                      <InquiryTypeBadge
                        type={inquiry.type}
                        label={getInquiryTypeLabel(inquiry.type)}
                      />
                    </div>
                    <div className="w-[60px] text-xs text-black text-center">
                      {inquiry.processedDate}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedInquiry && (
          <div className="fixed right-0 top-12 bottom-0 w-[354px] border-l border-[#e0e0e0] bg-white z-10">
            <InquiryDetailPanel
              data={getDetailData(selectedInquiry)}
              onClose={handleClosePanel}
              onChat={handleOpenChat}
            />
          </div>
        )}
      </div>
    </ComingSoonOverlay>
  );
}
