'use client';

import { useState } from 'react';
import { X, ChevronDown, Calendar, Clock } from 'lucide-react';

type ManagerStatus = 'pending' | 'not_started' | 'in_progress' | 'completed';

export interface InquiryDetailData {
  id: string;
  guestName: string;
  inquiryDateTime: string;
  requestType: string;
  requestDetails: string[];
  desiredDate: string;
  location: string;
  keywords: string[];
  managerVisitDate: string;
  managerVisitTime: string;
  managerStatus: ManagerStatus;
}

interface InquiryDetailPanelProps {
  data: InquiryDetailData;
  onClose: () => void;
  onChat: () => void;
}

// Manager status options
const managerStatusOptions: { value: ManagerStatus; label: string }[] = [
  { value: 'pending', label: '확인 예정' },
  { value: 'not_started', label: '미진행' },
  { value: 'in_progress', label: '진행 예정' },
  { value: 'completed', label: '처리 완료' },
];

// Keyword Badge Component
function KeywordBadge({ label }: { label: string }) {
  // Determine color based on label
  const getColors = () => {
    switch (label) {
      case '청소':
        return 'bg-[#d0e2ff] text-[#0043ce]';
      case '수리':
        return 'bg-[#ffd7d9] text-[#a2191f]';
      case '침구':
        return 'bg-[#9ef0f0] text-[#005d5d]';
      default:
        return 'bg-[#e0e0e0] text-[#525252]';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${getColors()}`}>
      {label}
    </span>
  );
}

export function InquiryDetailPanel({ data, onClose, onChat }: InquiryDetailPanelProps) {
  const [managerStatus, setManagerStatus] = useState<ManagerStatus>(data.managerStatus);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [visitDate, setVisitDate] = useState(data.managerVisitDate);
  const [visitTime, setVisitTime] = useState(data.managerVisitTime);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#f0f0f0]">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-black">고객 문의 내용 상세</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-[#f4f4f4] rounded transition-colors"
          >
            <X className="w-4 h-4 text-[#161616]" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-5 py-4">
        <div className="space-y-5">
          {/* Guest Info */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-black">{data.guestName}</h3>
              <p className="text-xs text-[#525252]">문의일시 {data.inquiryDateTime}</p>
            </div>
            <button
              type="button"
              className="text-xs text-[hsl(var(--snug-orange))] hover:underline"
            >
              문의내용 보기
            </button>
          </div>

          {/* Request Info Box */}
          <div className="bg-[#f4f4f4] rounded-lg p-4">
            <h4 className="text-xs font-bold text-[#161616] mb-2">{data.requestType}</h4>
            <ul className="space-y-1">
              {data.requestDetails.map((detail, index) => (
                <li key={index} className="text-xs text-[#525252] flex items-start gap-1">
                  <span className="mt-1">•</span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 space-y-1">
              <p className="text-xs text-[#161616]">
                <span className="text-[#525252]">희망일자 </span>
                <span className="font-medium">{data.desiredDate}</span>
              </p>
              <p className="text-xs text-[#161616]">
                <span className="text-[#525252]">숙소위치 </span>
                <span className="font-medium">{data.location}</span>
              </p>
            </div>
          </div>

          {/* Edit Inquiry Button */}
          <button
            type="button"
            className="w-full py-2.5 border border-[#161616] rounded text-xs font-medium text-[#161616] hover:bg-[#f4f4f4] transition-colors"
          >
            고객 문의 수정
          </button>

          {/* Keywords */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#161616]">키워드</h4>
            <div className="flex flex-wrap gap-2">
              {data.keywords.map((keyword, index) => (
                <KeywordBadge key={index} label={keyword} />
              ))}
            </div>
          </div>

          {/* Manager Visit Schedule */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-[#525252]">관리자 방문 예정일</label>
                <div className="relative">
                  <input
                    type="text"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full px-3 py-2 border border-[#e0e0e0] rounded text-xs text-[#161616] pr-8"
                  />
                  <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#525252]" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-[#525252]">관리자 방문 예정 시간</label>
                <div className="relative">
                  <input
                    type="text"
                    value={visitTime}
                    onChange={(e) => setVisitTime(e.target.value)}
                    className="w-full px-3 py-2 border border-[#e0e0e0] rounded text-xs text-[#161616] pr-8"
                  />
                  <Clock className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#525252]" />
                </div>
              </div>
            </div>
          </div>

          {/* Manager Status */}
          <div className="space-y-1.5">
            <label className="text-xs text-[#525252]">관리자 확인상태</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="w-full flex items-center justify-between px-3 py-2.5 border border-[#e0e0e0] rounded text-xs text-[#161616]"
              >
                <span>
                  {managerStatusOptions.find((opt) => opt.value === managerStatus)?.label}
                </span>
                <ChevronDown className="w-4 h-4 text-[#525252]" />
              </button>
              {showStatusDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e0e0e0] rounded shadow-lg z-10">
                  {managerStatusOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setManagerStatus(option.value);
                        setShowStatusDropdown(false);
                      }}
                      className={`w-full px-3 py-2.5 text-left text-xs hover:bg-[#f4f4f4] transition-colors ${
                        managerStatus === option.value ? 'bg-[#f4f4f4]' : ''
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Manager Name (shown when status is in_progress or completed) */}
          {(managerStatus === 'in_progress' || managerStatus === 'completed') && (
            <div className="space-y-1.5">
              <label className="text-xs text-[#525252]">관리자명</label>
              <input
                type="text"
                placeholder="관리자 이름 입력"
                className="w-full px-3 py-2 border border-[#e0e0e0] rounded text-xs text-[#161616]"
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-[#f0f0f0] space-y-2.5">
        <button
          type="button"
          className="w-full py-3 bg-[hsl(var(--snug-orange))] text-white text-sm font-medium rounded hover:bg-[hsl(var(--snug-orange))]/90 transition-colors"
        >
          작업 요청
        </button>
        <button
          type="button"
          onClick={onChat}
          className="w-full py-3 border border-[#e0e0e0] text-[#161616] text-sm font-medium rounded hover:bg-[#f4f4f4] transition-colors"
        >
          1:1 채팅
        </button>
      </div>
    </div>
  );
}
