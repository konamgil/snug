'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { X, ChevronDown } from 'lucide-react';

type UserStatus = 'active' | 'withdrawn' | 'dormant';
type PermissionType = 'snug_operator' | 'host' | 'guest' | 'co_host' | 'admin' | 'consignment';

interface ScreenPermission {
  id: string;
  name: string;
  canView: boolean;
  canEdit: boolean;
}

export interface UserDetailData {
  id: string;
  name: string;
  status: UserStatus;
  permissionType: PermissionType;
  phone: string;
  email: string;
  nationality: string;
  gender: string;
  screenPermissions: ScreenPermission[];
}

interface UserDetailPanelProps {
  data: UserDetailData | null;
  onClose: () => void;
  onSave: (data: UserDetailData) => void;
}

// Status colors (labels will be translated)
const statusColors: Record<UserStatus, { bgColor: string; textColor: string }> = {
  active: {
    bgColor: 'bg-[#d0e2ff]',
    textColor: 'text-[#0043ce]',
  },
  withdrawn: {
    bgColor: 'bg-[#ffd7d9]',
    textColor: 'text-[#da1e28]',
  },
  dormant: {
    bgColor: 'bg-[#e0e0e0]',
    textColor: 'text-[#525252]',
  },
};

// Status Badge Component
function StatusBadge({ status, label }: { status: UserStatus; label: string }) {
  const colors = statusColors[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors.bgColor} ${colors.textColor}`}
    >
      {label}
    </span>
  );
}

// Permission Checkbox Component
function PermissionCheckbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
        checked ? 'bg-[#161616] border-[#161616]' : 'border-[#161616] bg-white hover:bg-[#f4f4f4]'
      }`}
    >
      {checked && (
        <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
          <path
            d="M10 3L4.5 8.5L2 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}

export function UserDetailPanel({ data, onClose, onSave }: UserDetailPanelProps) {
  const t = useTranslations('host.users.detail');
  const tTable = useTranslations('host.users.table');
  const tPermissions = useTranslations('host.users.permissionTypes');
  const tStatus = useTranslations('host.users.status');

  const [permissions, setPermissions] = useState<ScreenPermission[]>(data?.screenPermissions ?? []);
  const [selectedPermissionType, setSelectedPermissionType] = useState<PermissionType>(
    data?.permissionType ?? 'guest',
  );
  const [showPermissionDropdown, setShowPermissionDropdown] = useState(false);

  const getPermissionLabel = (type: PermissionType): string => tPermissions(type);
  const getStatusLabel = (status: UserStatus): string => tStatus(status);

  if (!data) return null;

  const handlePermissionChange = (id: string, field: 'canView' | 'canEdit') => {
    setPermissions((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: !p[field] } : p)));
  };

  const handleSave = () => {
    onSave({
      ...data,
      permissionType: selectedPermissionType,
      screenPermissions: permissions,
    });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-5 py-6 border-b border-[#f0f0f0]">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-black">{t('title')}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-[#f4f4f4] rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-[#161616]" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-5 py-6">
        <div className="space-y-8">
          {/* User Name and Status */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-black">{data.name}</span>
              <StatusBadge status={data.status} label={getStatusLabel(data.status)} />
            </div>

            {/* Basic Info */}
            <div className="bg-[#f1f1f1] rounded p-5">
              <h3 className="text-xs font-bold text-[#161616] mb-2">{t('basicInfo')}</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#525252]">{tTable('permissionType')}</span>
                  <span className="text-[#161616]">{getPermissionLabel(data.permissionType)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#525252]">{tTable('phone')}</span>
                  <span className="text-[#161616]">{data.phone}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#525252]">{tTable('email')}</span>
                  <span className="text-[#161616]">{data.email}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#525252]">{tTable('nationality')}</span>
                  <span className="text-[#161616]">{data.nationality}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#525252]">{tTable('gender')}</span>
                  <span className="text-[#161616]">{data.gender}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Screen Permissions */}
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-black">{t('screenPermissions')}</h3>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowPermissionDropdown(!showPermissionDropdown)}
                  className="flex items-center gap-2 text-xs text-[#161616]"
                >
                  <span>{getPermissionLabel(selectedPermissionType)}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {showPermissionDropdown && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-[#e0e0e0] rounded shadow-lg z-10 min-w-[120px]">
                    {(
                      [
                        'snug_operator',
                        'host',
                        'guest',
                        'co_host',
                        'admin',
                        'consignment',
                      ] as PermissionType[]
                    ).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setSelectedPermissionType(type);
                          setShowPermissionDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs hover:bg-[#f4f4f4] transition-colors"
                      >
                        {getPermissionLabel(type)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Permission Table */}
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#161616]">{t('screenName')}</span>
                <div className="flex items-center justify-between w-[85px] text-xs text-[#161616]">
                  <span>{t('view')}</span>
                  <span>{t('edit')}</span>
                </div>
              </div>
              <div className="border-t border-[#a8a8a8]" />

              {/* Permission Rows */}
              <div className="space-y-2.5">
                {permissions.map((permission) => (
                  <div key={permission.id} className="flex items-center justify-between">
                    <span className="text-xs text-[#161616]">{permission.name}</span>
                    <div className="flex items-center justify-between w-[85px]">
                      <PermissionCheckbox
                        checked={permission.canView}
                        onChange={() => handlePermissionChange(permission.id, 'canView')}
                      />
                      <PermissionCheckbox
                        checked={permission.canEdit}
                        onChange={() => handlePermissionChange(permission.id, 'canEdit')}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-5 border-t border-[#f0f0f0]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm text-[#161616] bg-[#f3f3f3] rounded hover:bg-[#e8e8e8] transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-[2] px-4 py-2.5 text-sm text-white bg-[hsl(var(--snug-orange))] rounded hover:bg-[hsl(var(--snug-orange))]/90 transition-colors"
          >
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
}
