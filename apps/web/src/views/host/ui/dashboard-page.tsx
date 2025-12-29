'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  ContractSection,
  SettlementSection,
  OperationSection,
  ChatSection,
  OperationDetailDrawer,
  WorkRequestModal,
  ContractDetailDrawer,
  type OperationDetailData,
  type WorkRequestData,
  type ContractDetailData,
} from './dashboard';

export function DashboardPage() {
  const t = useTranslations('host.dashboard');
  // Operation drawer state
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<OperationDetailData | null>(null);
  const [isWorkRequestModalOpen, setIsWorkRequestModalOpen] = useState(false);
  const [workRequestData, setWorkRequestData] = useState<WorkRequestData | null>(null);

  // Contract drawer state
  const [isContractDrawerOpen, setIsContractDrawerOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<ContractDetailData | null>(null);

  const handleOperationItemClick = (data: OperationDetailData) => {
    setSelectedOperation(data);
    setIsDetailDrawerOpen(true);
  };

  const handleCloseDetailDrawer = () => {
    setIsDetailDrawerOpen(false);
  };

  const handleWorkRequest = () => {
    if (!selectedOperation) return;

    // Convert operation data to work request data
    const requestData: WorkRequestData = {
      id: selectedOperation.id,
      customerName: selectedOperation.customerName,
      inquiryDate: selectedOperation.inquiryDate,
      title: selectedOperation.title,
      details: selectedOperation.details,
      preferredDate: selectedOperation.preferredDate,
      preferredTime: selectedOperation.preferredTime,
      location: selectedOperation.location,
      additionalRequest:
        '새로 입주하는 분입니다. 베개 얼룩이랑 이불 침구 깨끗하게 청소해주세요. 방문 손잡이는 저번에도 수리했는데, 다시 고장난 것 같아서 다시 한번 확인 부탁드립니다.',
      scheduledDate: '5월 12일',
      daysAgo: '1일 전',
    };

    setWorkRequestData(requestData);
    setIsWorkRequestModalOpen(true);
  };

  const handleCloseWorkRequestModal = () => {
    setIsWorkRequestModalOpen(false);
  };

  const handleScheduleChange = () => {
    // Handle schedule change request
    setIsWorkRequestModalOpen(false);
  };

  const handleServiceComplete = () => {
    // Handle service completion
    setIsWorkRequestModalOpen(false);
    setIsDetailDrawerOpen(false);
  };

  // Contract drawer handlers
  const handleContractItemClick = (data: ContractDetailData) => {
    setSelectedContract(data);
    setIsContractDrawerOpen(true);
  };

  const handleCloseContractDrawer = () => {
    setIsContractDrawerOpen(false);
  };

  const handlePaymentRequest = () => {
    // TODO: Handle payment request
  };

  const handleOtherProposal = () => {
    // TODO: Handle other proposal
  };

  const handleContractChat = () => {
    // TODO: Handle chat
  };

  return (
    <div className="relative min-h-[calc(100vh-120px)]">
      {/* Dashboard content - blurred and disabled */}
      <div className="p-4 md:p-6 space-y-4 md:space-y-6 blur-sm pointer-events-none select-none">
        {/* Contract Management Section */}
        <ContractSection onItemClick={handleContractItemClick} />

        {/* Settlement Section - Full width on mobile */}
        <div className="md:hidden">
          <SettlementSection />
        </div>

        {/* Settlement & Operations Row - Desktop only */}
        <div className="hidden md:grid md:grid-cols-2 gap-6">
          <SettlementSection />
          <OperationSection onItemClick={handleOperationItemClick} />
        </div>

        {/* Operations Section - Mobile */}
        <div className="md:hidden">
          <OperationSection onItemClick={handleOperationItemClick} />
        </div>

        {/* Recent Chats Section */}
        <ChatSection />
      </div>

      {/* Coming soon overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
        <div className="text-center px-4">
          <div className="bg-white rounded-2xl shadow-lg px-8 py-6 border border-gray-100">
            <p className="text-lg font-medium text-gray-700">{t('comingSoonOverlay')}</p>
          </div>
        </div>
      </div>

      {/* Operation Detail Drawer */}
      <OperationDetailDrawer
        isOpen={isDetailDrawerOpen}
        onClose={handleCloseDetailDrawer}
        data={selectedOperation}
        onWorkRequest={handleWorkRequest}
      />

      {/* Work Request Modal */}
      <WorkRequestModal
        isOpen={isWorkRequestModalOpen}
        onClose={handleCloseWorkRequestModal}
        data={workRequestData}
        isServiceDay={false}
        onScheduleChange={handleScheduleChange}
        onServiceComplete={handleServiceComplete}
      />

      {/* Contract Detail Drawer */}
      <ContractDetailDrawer
        isOpen={isContractDrawerOpen}
        onClose={handleCloseContractDrawer}
        data={selectedContract}
        onPaymentRequest={handlePaymentRequest}
        onOtherProposal={handleOtherProposal}
        onChat={handleContractChat}
      />
    </div>
  );
}

export function DashboardEmptyPage() {
  const t = useTranslations('host.dashboard');
  const tContracts = useTranslations('host.contracts');

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Contract Management Section - Empty */}
      <section className="bg-white rounded-xl p-4 md:p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[hsl(var(--snug-text-primary))]">
            {t('contractManagement')}
          </h2>
          <span className="text-sm text-[hsl(var(--snug-orange))]">{t('viewAllContracts')}</span>
        </div>

        <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            className="flex-shrink-0 px-3 py-1.5 text-sm rounded-full border border-[hsl(var(--snug-orange))] text-[hsl(var(--snug-orange))]"
          >
            {t('all')} 0
          </button>
          {[
            { key: 'pending', label: tContracts('status.pending') },
            { key: 'checkInScheduled', label: tContracts('status.checkInScheduled') },
            { key: 'checkOutScheduled', label: tContracts('status.checkOutScheduled') },
            { key: 'moveInScheduled', label: tContracts('status.moveInScheduled') },
            { key: 'inProgress', label: tContracts('status.inProgress') },
            { key: 'completed', label: tContracts('status.completed') },
            { key: 'rejected', label: tContracts('status.rejected') },
            { key: 'cancelledRefunded', label: tContracts('status.cancelledRefunded') },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              className="flex-shrink-0 px-3 py-1.5 text-sm rounded-full border border-[hsl(var(--snug-border))] text-[hsl(var(--snug-gray))]"
            >
              {item.label} 0
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center justify-center h-[180px] text-center">
          <p className="text-sm text-[hsl(var(--snug-gray))]">{t('noContractsYet')}</p>
          <p className="text-sm text-[hsl(var(--snug-gray))]">{t('contractsAppearHere')}</p>
        </div>
      </section>

      {/* Settlement & Operations Row - Empty */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Settlement Empty */}
        <section className="bg-white rounded-xl p-4 md:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[hsl(var(--snug-text-primary))]">
              {t('settlement')}
            </h2>
            <span className="text-sm text-[hsl(var(--snug-orange))]">
              {t('viewAllSettlements')}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center h-[200px] text-center">
            <p className="text-sm text-[hsl(var(--snug-gray))]">{t('noSettlementsYet')}</p>
            <p className="text-sm text-[hsl(var(--snug-gray))]">{t('settlementsAppearHere')}</p>
          </div>
        </section>

        {/* Operations Empty */}
        <section className="bg-white rounded-xl p-4 md:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[hsl(var(--snug-text-primary))]">
              {t('houseOperations')}
            </h2>
            <span className="text-sm text-[hsl(var(--snug-orange))]">{t('viewAllOperations')}</span>
          </div>

          <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
            <button
              type="button"
              className="flex-shrink-0 px-3 py-1.5 text-sm rounded-full border border-[hsl(var(--snug-orange))] text-[hsl(var(--snug-orange))]"
            >
              {t('all')}
            </button>
            {[
              { key: 'received', label: t('operationStatus.received') },
              { key: 'inProgress', label: t('operationStatus.inProgress') },
              { key: 'completed', label: t('operationStatus.completed') },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                className="flex-shrink-0 px-3 py-1.5 text-sm rounded-full border border-[hsl(var(--snug-border))] text-[hsl(var(--snug-gray))]"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col items-center justify-center h-[160px] text-center">
            <p className="text-sm text-[hsl(var(--snug-gray))]">{t('noInquiriesYet')}</p>
            <p className="text-sm text-[hsl(var(--snug-gray))]">{t('inquiriesAppearHere')}</p>
          </div>
        </section>
      </div>

      {/* Recent Chats Section - Empty */}
      <section className="bg-white rounded-xl p-4 md:p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[hsl(var(--snug-text-primary))]">
            {t('recentChats')}
          </h2>
          <span className="text-sm text-[hsl(var(--snug-orange))]">{t('viewAllChats')}</span>
        </div>

        <div className="mb-4">
          <button
            type="button"
            className="flex items-center gap-1 text-sm text-[hsl(var(--snug-text-primary))]"
          >
            {t('all')}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        <div className="flex flex-col items-center justify-center h-[120px] text-center">
          <p className="text-sm text-[hsl(var(--snug-gray))]">{t('noRecentChats')}</p>
          <p className="text-sm text-[hsl(var(--snug-gray))]">{t('chatsAppearHere')}</p>
        </div>
      </section>
    </div>
  );
}
