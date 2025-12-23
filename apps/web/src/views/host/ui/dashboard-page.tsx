'use client';

import { useState } from 'react';
import {
  ContractSection,
  SettlementSection,
  OperationSection,
  ChatSection,
  OperationDetailDrawer,
  type OperationDetailData,
} from './dashboard';

export function DashboardPage() {
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<OperationDetailData | null>(null);

  const handleOperationItemClick = (data: OperationDetailData) => {
    setSelectedOperation(data);
    setIsDetailDrawerOpen(true);
  };

  const handleCloseDetailDrawer = () => {
    setIsDetailDrawerOpen(false);
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Contract Management Section */}
      <ContractSection />

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

      {/* Operation Detail Drawer */}
      <OperationDetailDrawer
        isOpen={isDetailDrawerOpen}
        onClose={handleCloseDetailDrawer}
        data={selectedOperation}
      />
    </div>
  );
}

export function DashboardEmptyPage() {
  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Contract Management Section - Empty */}
      <section className="bg-white rounded-xl p-4 md:p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[hsl(var(--snug-text-primary))]">입주/계약 관리</h2>
          <span className="text-sm text-[hsl(var(--snug-orange))]">모든 계약목록 보기</span>
        </div>

        <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            className="flex-shrink-0 px-3 py-1.5 text-sm rounded-full border border-[hsl(var(--snug-orange))] text-[hsl(var(--snug-orange))]"
          >
            전체 0
          </button>
          {[
            '계약 신청',
            '체크인 예정',
            '체크아웃 예정',
            '입주 예정',
            '입주 중',
            '퇴실 완료',
            '거절',
            '취소/환불',
          ].map((label) => (
            <button
              key={label}
              type="button"
              className="flex-shrink-0 px-3 py-1.5 text-sm rounded-full border border-[hsl(var(--snug-border))] text-[hsl(var(--snug-gray))]"
            >
              {label} 0
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center justify-center h-[180px] text-center">
          <p className="text-sm text-[hsl(var(--snug-gray))]">아직 계약 내역이 없습니다.</p>
          <p className="text-sm text-[hsl(var(--snug-gray))]">
            계약이 완료되면 이곳에서 확인할 수 있습니다.
          </p>
        </div>
      </section>

      {/* Settlement & Operations Row - Empty */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Settlement Empty */}
        <section className="bg-white rounded-xl p-4 md:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[hsl(var(--snug-text-primary))]">정산</h2>
            <span className="text-sm text-[hsl(var(--snug-orange))]">모든 정산목록 보기</span>
          </div>
          <div className="flex flex-col items-center justify-center h-[200px] text-center">
            <p className="text-sm text-[hsl(var(--snug-gray))]">아직 정산 내역이 없습니다.</p>
            <p className="text-sm text-[hsl(var(--snug-gray))]">
              새로운 정산이 발생하면 이곳에서 확인할 수 있습니다.
            </p>
          </div>
        </section>

        {/* Operations Empty */}
        <section className="bg-white rounded-xl p-4 md:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[hsl(var(--snug-text-primary))]">
              하우스 운영 관리
            </h2>
            <span className="text-sm text-[hsl(var(--snug-orange))]">모든 관리목록 보기</span>
          </div>

          <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
            <button
              type="button"
              className="flex-shrink-0 px-3 py-1.5 text-sm rounded-full border border-[hsl(var(--snug-orange))] text-[hsl(var(--snug-orange))]"
            >
              전체
            </button>
            {['요청 접수', '요청 진행중', '요청 완료'].map((label) => (
              <button
                key={label}
                type="button"
                className="flex-shrink-0 px-3 py-1.5 text-sm rounded-full border border-[hsl(var(--snug-border))] text-[hsl(var(--snug-gray))]"
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-col items-center justify-center h-[160px] text-center">
            <p className="text-sm text-[hsl(var(--snug-gray))]">
              현재 게스트 문의 내역이 없습니다.
            </p>
            <p className="text-sm text-[hsl(var(--snug-gray))]">
              게스트가 숙소 관련 문의를 남기면 이곳에서 확인할 수 있습니다.
            </p>
          </div>
        </section>
      </div>

      {/* Recent Chats Section - Empty */}
      <section className="bg-white rounded-xl p-4 md:p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[hsl(var(--snug-text-primary))]">최신 채팅</h2>
          <span className="text-sm text-[hsl(var(--snug-orange))]">모든 채팅목록 보기</span>
        </div>

        <div className="mb-4">
          <button
            type="button"
            className="flex items-center gap-1 text-sm text-[hsl(var(--snug-text-primary))]"
          >
            전체
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
          <p className="text-sm text-[hsl(var(--snug-gray))]">최근 채팅이 없습니다.</p>
          <p className="text-sm text-[hsl(var(--snug-gray))]">
            숙소 문의나 게스트 메시지가 도착하면 이곳에서 확인할 수 있습니다.
          </p>
        </div>
      </section>
    </div>
  );
}
