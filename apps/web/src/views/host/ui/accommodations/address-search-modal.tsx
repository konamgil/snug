'use client';

import { X } from 'lucide-react';
import DaumPostcodeEmbed, { type Address } from 'react-daum-postcode';

// 구조화된 주소 데이터 타입
export interface StructuredAddressData {
  zonecode: string; // 우편번호
  address: string; // 기본 주소 (표시용)
  addressType: 'R' | 'J'; // R: 도로명, J: 지번
  roadAddress: string; // 도로명 주소
  jibunAddress: string; // 지번 주소
  // 구조화된 주소 (다음 API에서 제공)
  sido: string; // 시/도 (서울특별시)
  sigungu: string; // 시/군/구 (강남구)
  bname: string; // 법정동/리 (역삼동)
  buildingName: string; // 건물명
}

interface AddressSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: StructuredAddressData) => void;
}

export function AddressSearchModal({ isOpen, onClose, onComplete }: AddressSearchModalProps) {
  if (!isOpen) return null;

  const handleComplete = (data: Address) => {
    // 도로명 주소 우선, 없으면 지번 주소
    const address = data.roadAddress || data.jibunAddress;
    const addressType = data.roadAddress ? 'R' : 'J';

    onComplete({
      zonecode: data.zonecode,
      address,
      addressType,
      roadAddress: data.roadAddress,
      jibunAddress: data.jibunAddress,
      // 구조화된 주소 데이터
      sido: data.sido,
      sigungu: data.sigungu,
      bname: data.bname,
      buildingName: data.buildingName,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--snug-border))]">
          <h3 className="text-lg font-bold text-[hsl(var(--snug-text-primary))]">주소 검색</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-[hsl(var(--snug-light-gray))] rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-[hsl(var(--snug-text-primary))]" />
          </button>
        </div>

        {/* Daum Postcode */}
        <div className="h-[450px]">
          <DaumPostcodeEmbed
            onComplete={handleComplete}
            style={{ width: '100%', height: '100%' }}
            autoClose={false}
          />
        </div>
      </div>
    </div>
  );
}
