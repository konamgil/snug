'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Search, ChevronDown, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { UserDetailPanel, type UserDetailData } from './user-detail-panel';
import { ComingSoonOverlay } from '../coming-soon-overlay';

// Types
type UserStatus = 'active' | 'withdrawn' | 'dormant';
type PermissionType = 'snug_operator' | 'host' | 'guest' | 'co_host' | 'admin' | 'consignment';

interface UserData {
  id: string;
  name: string;
  phone: string;
  email: string;
  nationality: string;
  gender: string;
  permissionType: PermissionType;
  status: UserStatus;
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

// Mock data
const mockUsers: UserData[] = [
  {
    id: '1',
    name: 'NAMENAMENAMENAME',
    phone: '010-1234-5678',
    email: 'abcde123@gmail.com',
    nationality: '대한민국',
    gender: '여자',
    permissionType: 'snug_operator',
    status: 'active',
  },
  {
    id: '2',
    name: 'NAMENAMENAMENAME',
    phone: '010-1234-5678',
    email: 'abcde123@gmail.com',
    nationality: '대한민국',
    gender: '여자',
    permissionType: 'host',
    status: 'active',
  },
  {
    id: '3',
    name: 'NAMENAMENAMENAME',
    phone: '010-1234-5678',
    email: 'abcde123@gmail.com',
    nationality: '대한민국',
    gender: '여자',
    permissionType: 'guest',
    status: 'withdrawn',
  },
  {
    id: '4',
    name: '김러그',
    phone: '010-1234-5678',
    email: 'abcde123@gmail.com',
    nationality: '대한민국',
    gender: '여자',
    permissionType: 'guest',
    status: 'dormant',
  },
  {
    id: '5',
    name: 'NAMENAMENAMENAME',
    phone: '010-1234-5678',
    email: 'abcde123@gmail.com',
    nationality: '대한민국',
    gender: '여자',
    permissionType: 'co_host',
    status: 'active',
  },
  {
    id: '6',
    name: 'NAMENAMENAMENAME',
    phone: '010-1234-5678',
    email: 'abcde123@gmail.com',
    nationality: '대한민국',
    gender: '여자',
    permissionType: 'guest',
    status: 'active',
  },
  {
    id: '7',
    name: 'NAMENAMENAMENAME',
    phone: '010-1234-5678',
    email: 'abcde123@gmail.com',
    nationality: '대한민국',
    gender: '여자',
    permissionType: 'admin',
    status: 'active',
  },
  {
    id: '8',
    name: 'NAMENAMENAMENAME',
    phone: '010-1234-5678',
    email: 'abcde123@gmail.com',
    nationality: '대한민국',
    gender: '여자',
    permissionType: 'consignment',
    status: 'active',
  },
];

// Convert user data to detail panel data - moved inside component to access translations

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

// User Avatar Component
function UserAvatar() {
  return (
    <div className="w-9 h-9 rounded-full bg-[#f4f4f4] flex items-center justify-center flex-shrink-0">
      <User className="w-5 h-5 text-[#8d8d8d]" />
    </div>
  );
}

// Checkbox Component
function Checkbox({
  checked,
  onChange,
  indeterminate,
}: {
  checked: boolean;
  onChange: (e: React.MouseEvent) => void;
  indeterminate?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
        checked || indeterminate
          ? 'bg-[hsl(var(--snug-orange))] border-[hsl(var(--snug-orange))]'
          : 'border-[#d8d8d8] bg-white hover:border-[#a8a8a8]'
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
      {indeterminate && !checked && <div className="w-2 h-0.5 bg-white rounded" />}
    </button>
  );
}

// Pagination Component
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const getVisiblePages = () => {
    const pages: (number | 'ellipsis')[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded hover:bg-[#f4f4f4] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {getVisiblePages().map((page, index) =>
        page === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="px-2 text-sm text-[#525252]">
            ...
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`min-w-[32px] h-8 px-2 text-sm rounded transition-colors ${
              currentPage === page
                ? 'text-[hsl(var(--snug-orange))] font-semibold border-b-2 border-[hsl(var(--snug-orange))]'
                : 'text-[#525252] hover:bg-[#f4f4f4]'
            }`}
          >
            {page}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded hover:bg-[#f4f4f4] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export function UsersPage() {
  const t = useTranslations('host.users');
  const tPermissions = useTranslations('host.users.permissionTypes');
  const tStatus = useTranslations('host.users.status');
  const tTable = useTranslations('host.users.table');
  const tScreens = useTranslations('host.users.screens');

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [detailData, setDetailData] = useState<UserDetailData | null>(null);
  const totalPages = 30;

  const getPermissionLabel = (type: PermissionType): string => tPermissions(type);
  const getStatusLabel = (status: UserStatus): string => tStatus(status);
  const getScreenLabel = (screenId: string): string => {
    const key = screenId as
      | 'dashboard'
      | 'contracts'
      | 'properties'
      | 'settlements'
      | 'chat'
      | 'operations'
      | 'users';
    return tScreens(key);
  };

  const getUserDetailData = (user: UserData): UserDetailData => ({
    id: user.id,
    name: user.name,
    status: user.status,
    permissionType: user.permissionType,
    phone: user.phone,
    email: user.email,
    nationality: user.nationality,
    gender: user.gender,
    screenPermissions: [
      { id: 'dashboard', name: getScreenLabel('dashboard'), canView: true, canEdit: false },
      { id: 'contracts', name: getScreenLabel('contracts'), canView: true, canEdit: false },
      { id: 'properties', name: getScreenLabel('properties'), canView: false, canEdit: true },
      { id: 'settlements', name: getScreenLabel('settlements'), canView: false, canEdit: true },
      { id: 'chat', name: getScreenLabel('chat'), canView: true, canEdit: false },
      { id: 'operations', name: getScreenLabel('operations'), canView: true, canEdit: false },
      { id: 'users', name: getScreenLabel('users'), canView: true, canEdit: false },
    ],
  });

  const handleSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIds.size === mockUsers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(mockUsers.map((u) => u.id)));
    }
  };

  const handleSelectUser = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleRowClick = (user: UserData) => {
    setSelectedUser(user);
    setDetailData(getUserDetailData(user));
  };

  const handleClosePanel = () => {
    setSelectedUser(null);
    setDetailData(null);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSaveUser = (data: UserDetailData) => {
    // TODO: Implement user save API call
    handleClosePanel();
  };

  const isAllSelected = selectedIds.size === mockUsers.length && mockUsers.length > 0;
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < mockUsers.length;

  return (
    <ComingSoonOverlay>
      <div className="h-full flex bg-white">
        {/* Main Content - User List */}
        <div className={`flex-1 flex flex-col min-w-0 ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
          {/* Title and Actions */}
          <div className="px-5 py-4 border-b border-[#f0f0f0]">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-[#161616]">{t('title')}</h1>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="p-2 hover:bg-[#f4f4f4] rounded-lg transition-colors"
                >
                  <Search className="w-5 h-5 text-[#525252]" />
                </button>
                <button
                  type="button"
                  disabled={selectedIds.size === 0}
                  className="px-4 py-2 text-sm border border-[#d8d8d8] rounded-lg hover:bg-[#f4f4f4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {t('deleteCount', { count: selectedIds.size })}
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-sm text-white bg-[hsl(var(--snug-orange))] rounded-lg hover:bg-[hsl(var(--snug-orange))]/90 transition-colors"
                >
                  {t('addNew')}
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-white sticky top-0 z-10">
                <tr className="border-b border-[#f0f0f0]">
                  <th className="w-12 px-5 py-3 text-left">
                    <Checkbox
                      checked={isAllSelected}
                      indeterminate={isSomeSelected}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-[#525252]">
                    {tTable('guest')}
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-[#525252]">
                    {tTable('phone')}
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-[#525252]">
                    {tTable('email')}
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-[#525252]">
                    {tTable('nationality')}
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-[#525252]">
                    {tTable('gender')}
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-[#525252]">
                    <span className="inline-flex items-center gap-1">
                      {tTable('permissionType')}
                      <ChevronDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-[#525252]">
                    <span className="inline-flex items-center gap-1">
                      {tTable('status')}
                      <ChevronDown className="w-3 h-3" />
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockUsers.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => handleRowClick(user)}
                    className={`border-b border-[#f0f0f0] hover:bg-[#f9f9f9] transition-colors cursor-pointer ${
                      selectedIds.has(user.id) ? 'bg-[#fff7f0]' : ''
                    } ${selectedUser?.id === user.id ? 'bg-[#f5f5f5]' : ''}`}
                  >
                    <td className="px-5 py-3">
                      <Checkbox
                        checked={selectedIds.has(user.id)}
                        onChange={(e) => handleSelectUser(e, user.id)}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        <UserAvatar />
                        <span className="text-sm text-[#161616]">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-[#161616]">{user.phone}</td>
                    <td className="px-3 py-3 text-sm text-[#161616]">{user.email}</td>
                    <td className="px-3 py-3 text-sm text-[#161616]">{user.nationality}</td>
                    <td className="px-3 py-3 text-sm text-[#161616]">{user.gender}</td>
                    <td className="px-3 py-3 text-sm text-[#161616]">
                      {getPermissionLabel(user.permissionType)}
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge status={user.status} label={getStatusLabel(user.status)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-5 py-4 border-t border-[#f0f0f0]">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>

        {/* Detail Panel */}
        {selectedUser && (
          <div className="w-full md:w-[354px] flex-shrink-0 border-l border-[#f0f0f0]">
            <UserDetailPanel data={detailData} onClose={handleClosePanel} onSave={handleSaveUser} />
          </div>
        )}

        {/* Mobile Full Screen Panel */}
        {selectedUser && (
          <div className="md:hidden fixed inset-0 z-50 bg-white">
            <UserDetailPanel data={detailData} onClose={handleClosePanel} onSave={handleSaveUser} />
          </div>
        )}
      </div>
    </ComingSoonOverlay>
  );
}
