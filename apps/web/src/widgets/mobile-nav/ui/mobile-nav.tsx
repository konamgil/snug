'use client';

import { useTranslations } from 'next-intl';
import { Search, Map, MessageCircle, User } from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/shared/lib';

type NavItemKey = 'search' | 'map' | 'messages' | 'profile';

interface NavItem {
  href: string;
  icon: typeof Search;
  labelKey: NavItemKey;
  activeOn?: string[];
}

const navItems: NavItem[] = [
  { href: '/', icon: Search, labelKey: 'search', activeOn: ['/', '/rooms', '/search'] },
  { href: '/map', icon: Map, labelKey: 'map' },
  { href: '/chat', icon: MessageCircle, labelKey: 'messages' },
  { href: '/mypage/profile', icon: User, labelKey: 'profile', activeOn: ['/mypage'] },
];

export function MobileNav() {
  const t = useTranslations('nav');
  const pathname = usePathname();

  const isItemActive = (item: NavItem) => {
    if (item.activeOn) {
      return item.activeOn.some((path) => pathname === path || pathname.startsWith(path + '/'));
    }
    return pathname === item.href || pathname.startsWith(item.href + '/');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[hsl(var(--snug-border))] md:hidden safe-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = isItemActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full',
                'text-[hsl(var(--snug-gray))] hover:text-[hsl(var(--snug-brown))] transition-colors',
                isActive && 'text-[hsl(var(--snug-orange))]',
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] mt-1 font-medium">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
