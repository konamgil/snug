'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ContractsList, type ContractListItem } from './contracts-list';
import { ContractsChat } from './contracts-chat';
import { ContractDetailPanel, type ContractPanelData } from './contract-detail-panel';

// Convert list item to panel data
function getContractPanelData(item: ContractListItem): ContractPanelData {
  return {
    id: item.id,
    status: 'inquiry',
    statusLabel: '문의 03.01',
    guestName: item.guestName,
    guestGender: '여',
    checkInDate: item.dateRange.split(' - ')[0] ?? '',
    checkOutDate: item.dateRange.split(' - ')[1] ?? '',
    propertyName: `${item.propertyName} (강남빌라)`,
    roomNumber: item.roomNumber,
    thumbnailUrl: item.thumbnailUrl,
    guestCount: 1,
    nights: 30,
    basePrice: 650000,
    detailRequest:
      '입주 전에 입주 청소를 하고싶습니다.\n룸 메이트는 깔끔한 사람이었으면 좋겠습니다.',
    contact: '010-1234-5678',
    email: 'snuguest@gmail.com',
    passportNumber: 'M12345678',
    residentNumber: '000320-2******',
    purpose: '공부 (교환 학생)',
    payer: '김여사 (모)',
    bankAccount: '우리은행 1002-1234-5678',
    paymentDate: '매월 1일 결제',
    cleaningFee: 50000,
    managementFee: 150000,
    totalPrice: 850000,
    memo: '깔끔한 성격, 저녁에 늦게 들어옴',
  };
}

export function ContractsPage() {
  const [selectedContract, setSelectedContract] = useState<ContractListItem | null>(null);
  const [panelData, setPanelData] = useState<ContractPanelData | null>(null);

  const handleSelectContract = (item: ContractListItem) => {
    setSelectedContract(item);
    setPanelData(getContractPanelData(item));
  };

  const handleClosePanel = () => {
    setSelectedContract(null);
    setPanelData(null);
  };

  // Action handlers - TODO: Implement actual API calls
  const handleConfirmReservation = () => {
    // TODO: Implement reservation confirmation
  };

  const handlePaymentRequest = () => {
    // TODO: Implement payment request
  };

  const handleOtherProposal = () => {
    // TODO: Implement proposal flow
  };

  const handleChat = () => {
    // TODO: Navigate to chat
  };

  const handleViewContract = () => {
    // TODO: Navigate to contract detail
  };

  return (
    <div className="h-full flex">
      {/* Left Panel - Contract List */}
      <div
        className={`${
          selectedContract ? 'hidden md:block md:w-[280px] lg:w-[320px]' : 'w-full'
        } h-full border-r border-[hsl(var(--snug-border))] flex-shrink-0`}
      >
        <ContractsList
          selectedId={selectedContract?.id}
          onSelect={handleSelectContract}
          compact={!!selectedContract}
        />
      </div>

      {/* Middle Panel - Chat (only when contract selected) */}
      {selectedContract && (
        <div className="hidden md:flex flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <ContractsChat
              guestName="Evelyn"
              isFavorite={selectedContract.isFavorite}
              onToggleFavorite={() => {}}
            />
          </div>

          {/* Right Panel - Contract Detail */}
          <div className="w-[350px] lg:w-[380px] flex-shrink-0 border-l border-[hsl(var(--snug-border))]">
            <ContractDetailPanel
              data={panelData}
              onClose={handleClosePanel}
              onConfirmReservation={handleConfirmReservation}
              onPaymentRequest={handlePaymentRequest}
              onOtherProposal={handleOtherProposal}
              onChat={handleChat}
              onViewContract={handleViewContract}
            />
          </div>
        </div>
      )}

      {/* Mobile View - Full Screen Panels */}
      {selectedContract && (
        <div className="md:hidden fixed inset-0 z-50 bg-white">
          {/* Mobile: Show chat with back button */}
          <div className="h-full flex flex-col">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[hsl(var(--snug-border))]">
              <button
                type="button"
                onClick={handleClosePanel}
                className="p-2 hover:bg-[hsl(var(--snug-light-gray))] rounded-lg transition-colors"
              >
                ←
              </button>
              <span className="font-bold">{selectedContract.guestName}</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <ContractsChat
                guestName={selectedContract.guestName}
                isFavorite={selectedContract.isFavorite}
                onToggleFavorite={() => {}}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Empty state page
export function ContractsEmptyPage() {
  const t = useTranslations('host.contracts.empty');

  return (
    <div className="h-full flex items-center justify-center bg-white">
      <div className="text-center">
        <p className="text-sm text-[hsl(var(--snug-gray))]">{t('noContracts')}</p>
        <p className="text-sm text-[hsl(var(--snug-gray))]">{t('contractsAppearHere')}</p>
      </div>
    </div>
  );
}
