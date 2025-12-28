'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  FileText,
  Home,
  Wallet,
  MessageSquare,
  Settings,
  Users,
} from 'lucide-react';
import { CollapseIcon } from '@/shared/ui/icons';

interface NavItem {
  labelKey: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    labelKey: 'dashboard',
    href: '/host',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    labelKey: 'contracts',
    href: '/host/contracts',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    labelKey: 'accommodations',
    href: '/host/properties',
    icon: <Home className="w-5 h-5" />,
  },
  {
    labelKey: 'settlements',
    href: '/host/settlements',
    icon: <Wallet className="w-5 h-5" />,
  },
  {
    labelKey: 'chat',
    href: '/host/chat',
    icon: <MessageSquare className="w-5 h-5" />,
  },
  {
    labelKey: 'operations',
    href: '/host/operations',
    icon: <Settings className="w-5 h-5" />,
  },
  {
    labelKey: 'users',
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
  const t = useTranslations('host.sidebar');

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
        isCollapsed ? 'w-16' : 'w-[180px]'
      }`}
    >
      {/* Logo */}
      <div className="px-4 py-5">
        <Link href="/" className="block">
          {isCollapsed ? (
            <Image
              src="/images/logo/favicon.svg"
              alt="snug"
              width={24}
              height={24}
              className="w-6 h-6"
            />
          ) : (
            <Image
              src="/images/logo/logo-hellosnug-host.svg"
              alt="hello.snug."
              width={120}
              height={24}
              className="h-6 w-auto"
            />
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
                title={isCollapsed ? t(item.labelKey) : undefined}
              >
                {item.icon}
                {!isCollapsed && <span className="text-sm">{t(item.labelKey)}</span>}
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
            <CollapseIcon
              className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      )}
    </aside>
  );
}
