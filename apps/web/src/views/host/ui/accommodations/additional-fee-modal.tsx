'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface AdditionalFeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, amount: number) => void;
}

export function AdditionalFeeModal({ isOpen, onClose, onSave }: AdditionalFeeModalProps) {
  const t = useTranslations('host.accommodation.form');
  const tCommon = useTranslations('common');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number | ''>('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (name.trim() && amount) {
      onSave(name.trim(), Number(amount));
      setName('');
      setAmount('');
      onClose();
    }
  };

  const handleClose = () => {
    setName('');
    setAmount('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} aria-hidden="true" />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-[374px] mx-4 flex flex-col rounded-lg overflow-hidden">
        {/* Header */}
        <div className="px-5 py-6 border-b border-[hsl(var(--snug-border))]">
          <h2 className="text-lg font-bold text-[hsl(var(--snug-text-primary))]">
            {t('additionalFeeModalTitle')}
          </h2>
        </div>

        {/* Content */}
        <div className="px-5 py-6 space-y-6">
          {/* 추가 요금명 */}
          <div>
            <label className="block text-xs text-[hsl(var(--snug-gray))] mb-2">
              {t('additionalFeeName')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('additionalFeeNamePlaceholder')}
              className="w-full px-4 py-2 bg-[#f4f4f4] border-b border-[hsl(var(--snug-gray))] text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
            />
          </div>

          {/* 추가 요금 */}
          <div>
            <label className="block text-xs text-[hsl(var(--snug-gray))] mb-2">
              {t('additionalFeeAmount')}
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value ? parseInt(e.target.value) : '')}
              placeholder={t('amountPlaceholder')}
              className="w-full px-4 py-2 bg-[#f4f4f4] border-b border-[hsl(var(--snug-gray))] text-sm focus:outline-none focus:border-[hsl(var(--snug-orange))]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 pb-6">
          <button
            type="button"
            onClick={handleClose}
            className="w-[120px] h-10 bg-[#f4f4f4] text-sm font-medium text-[hsl(var(--snug-text-primary))] rounded-lg hover:bg-[#e8e8e8] transition-colors"
          >
            {tCommon('cancel')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim() || !amount}
            className="flex-1 h-10 bg-[hsl(var(--snug-orange))] text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {tCommon('save')}
          </button>
        </div>
      </div>
    </div>
  );
}
