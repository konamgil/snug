'use client';

import { useTranslations } from 'next-intl';
// TODO: 오픈 후 MessageCircle 복원 필요
import { Search, Map, /* MessageCircle, */ User } from 'lucide-react';
import { usePathname } from '@/i18n/navigation';
import { Link } from 'next-view-transitions';
import { useLocale } from 'next-intl';
import { cn } from '@/shared/lib';
import { useAuthStore } from '@/shared/stores';

type NavItemKey = 'search' | 'map' | 'messages' | 'profile';

interface NavItem {
  href: string;
  icon: typeof Search;
  labelKey: NavItemKey;
  activeOn?: string[];
  badge?: number;
}

// TODO: 오픈 후 채팅 복원 필요
const navItems: NavItem[] = [
  { href: '/', icon: Search, labelKey: 'search', activeOn: ['/', '/rooms', '/search'] },
  { href: '/map', icon: Map, labelKey: 'map' },
  // { href: '/chat', icon: MessageCircle, labelKey: 'messages', badge: 10 },
  { href: '/mypage', icon: User, labelKey: 'profile', activeOn: ['/mypage'] },
];

export function MobileNav() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const locale = useLocale();
  const user = useAuthStore((state) => state.user);

  const isItemActive = (item: NavItem) => {
    if (item.activeOn) {
      return item.activeOn.some((path) => pathname === path || pathname.startsWith(path + '/'));
    }
    return pathname === item.href || pathname.startsWith(item.href + '/');
  };

  const getLocalizedHref = (href: string) => {
    return `/${locale}${href === '/' ? '' : href}`;
  };

  const getNavLabel = (item: NavItem) => {
    // 프로필 탭: 로그인 상태에 따라 다른 라벨 표시
    if (item.labelKey === 'profile') {
      return user ? t('profile') : t('login');
    }
    return t(item.labelKey);
  };

  const getNavHref = (item: NavItem) => {
    // 프로필 탭: 로그인 안 했으면 로그인 페이지로
    if (item.labelKey === 'profile' && !user) {
      return getLocalizedHref('/login');
    }
    return getLocalizedHref(item.href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[hsl(var(--snug-border))] md:hidden safe-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = isItemActive(item);
          return (
            <Link
              key={item.href}
              href={getNavHref(item)}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full relative',
                'text-[hsl(var(--snug-gray))] hover:text-[hsl(var(--snug-brown))] transition-colors',
                isActive && 'text-[hsl(var(--snug-orange))]',
              )}
            >
              <div className="relative">
                <item.icon className="h-5 w-5" />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-[hsl(var(--snug-orange))] rounded-full">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 font-medium">{getNavLabel(item)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
