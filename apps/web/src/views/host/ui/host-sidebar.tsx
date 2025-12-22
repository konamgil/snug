'use client';

import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import {
  LayoutDashboard,
  FileText,
  Home,
  Wallet,
  MessageSquare,
  Settings,
  Users,
  ChevronLeft,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: '대시보드',
    href: '/host',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: '계약 관리',
    href: '/host/contracts',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    label: '숙소 관리',
    href: '/host/properties',
    icon: <Home className="w-5 h-5" />,
  },
  {
    label: '정산 관리',
    href: '/host/settlements',
    icon: <Wallet className="w-5 h-5" />,
  },
  {
    label: '채팅',
    href: '/host/chat',
    icon: <MessageSquare className="w-5 h-5" />,
  },
  {
    label: '하우스 운영 관리',
    href: '/host/operations',
    icon: <Settings className="w-5 h-5" />,
  },
  {
    label: '사용자 관리',
    href: '/host/users',
    icon: <Users className="w-5 h-5" />,
  },
];

interface HostSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function HostSidebar({ isCollapsed, onToggle }: HostSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    // Exact match for dashboard, startsWith for others
    if (href === '/host') {
      return pathname.endsWith('/host') || pathname.endsWith('/host/');
    }
    return pathname.includes(href);
  };

  return (
    <aside
      className={`bg-[#1e1e1e] h-full flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-[140px]'
      }`}
    >
      {/* Logo */}
      <div className="px-4 py-5">
        <Link href="/host" className="block">
          {isCollapsed ? (
            <span className="text-lg font-bold text-white">S</span>
          ) : (
            <span className="text-lg font-bold">
              <span className="text-white">hello.</span>
              <span className="text-[hsl(var(--snug-orange))]">snug.</span>
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-[hsl(var(--snug-orange))] text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                {item.icon}
                {!isCollapsed && <span className="text-sm">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      {onToggle && (
        <div className="p-2">
          <button
            type="button"
            onClick={onToggle}
            className="w-full flex items-center justify-center p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft
              className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      )}
    </aside>
  );
}
