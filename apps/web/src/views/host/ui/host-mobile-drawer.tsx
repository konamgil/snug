'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { X, User } from 'lucide-react';
import {
  LayoutDashboard,
  FileText,
  Home,
  Wallet,
  MessageSquare,
  Settings,
  Users,
} from 'lucide-react';

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

interface HostMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HostMobileDrawer({ isOpen, onClose }: HostMobileDrawerProps) {
  const pathname = usePathname();
  const t = useTranslations('host.sidebar');

  const isActive = (href: string) => {
    if (href === '/host') {
      return pathname.endsWith('/host') || pathname.endsWith('/host/');
    }
    return pathname.includes(href);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-[280px] bg-[#1e1e1e] z-50 transform transition-transform duration-300 ease-out md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <Link href="/host" onClick={onClose}>
            <Image
              src="/images/logo/logo-hellosnug-host.svg"
              alt="hello, snug."
              width={140}
              height={32}
              className="h-8 w-auto"
            />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 mt-2">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-[hsl(var(--snug-orange))] text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span className="text-sm font-medium">{t(item.labelKey)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 px-5 py-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <User className="w-5 h-5 text-white/70" />
            </div>
            <span className="text-sm font-medium text-white">SNUG님</span>
          </div>
        </div>
      </aside>
    </>
  );
}
