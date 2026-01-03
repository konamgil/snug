'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams, useRouter } from 'next/navigation';
// TODO: 오픈 후 MessageCircle 복원 필요
import { Search, Map, /* MessageCircle, */ User } from 'lucide-react';
import { usePathname } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { cn } from '@/shared/lib';
import { useAuthStore } from '@/shared/stores';
import { useState, useTransition } from 'react';

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
  { href: '/search', icon: Search, labelKey: 'search', activeOn: ['/', '/rooms', '/search'] },
  { href: '/search?view=map', icon: Map, labelKey: 'map' },
  // { href: '/chat', icon: MessageCircle, labelKey: 'messages', badge: 10 },
  { href: '/mypage', icon: User, labelKey: 'profile', activeOn: ['/mypage'] },
];

// 검색/지도 간 전환 시 유지할 파라미터 목록
const PRESERVED_PARAMS = [
  'location',
  'checkIn',
  'checkOut',
  'guests',
  'adults',
  'children',
  'infants',
  'roomType',
  'sortBy',
  'minPrice',
  'maxPrice',
  'accommodationType',
  'buildingType',
  'genderRules',
];

export function MobileNav() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [isPending, startTransition] = useTransition();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  // 현재 검색 페이지인지 확인
  const isOnSearch = pathname === '/search';
  const currentView = searchParams.get('view') || 'list';
  const isOnSearchOrMap = isOnSearch; // 통합된 검색/지도 페이지

  const isItemActive = (item: NavItem) => {
    // Map 탭: /search에서 view=map일 때 active
    if (item.labelKey === 'map') {
      return isOnSearch && currentView === 'map';
    }
    // Search 탭: /search에서 view=list이거나 view가 없을 때 active
    if (item.labelKey === 'search') {
      return isOnSearch && currentView !== 'map';
    }
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

    // 검색/지도 페이지에서 검색/지도로 이동 시 파라미터 유지
    if (isOnSearchOrMap && (item.labelKey === 'search' || item.labelKey === 'map')) {
      const params = new URLSearchParams();
      PRESERVED_PARAMS.forEach((key) => {
        const values = searchParams.getAll(key);
        values.forEach((value) => params.append(key, value));
      });
      // 지도 뷰일 경우 view=map 추가, 리스트 뷰는 view 파라미터 제거
      if (item.labelKey === 'map') {
        params.set('view', 'map');
      } else {
        params.delete('view');
      }
      const queryString = params.toString();
      return getLocalizedHref(`/search${queryString ? `?${queryString}` : ''}`);
    }

    return getLocalizedHref(item.href);
  };

  const handleNavClick = (href: string) => {
    setPendingHref(href);
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[hsl(var(--snug-border))] md:hidden safe-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const href = getNavHref(item);
          const isActive = isItemActive(item);
          const isNavigating = isPending && pendingHref === href;

          return (
            <button
              key={item.href}
              type="button"
              onClick={() => handleNavClick(href)}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full relative',
                'transition-colors duration-100 active:scale-95 rounded-lg mx-1',
                isActive || isNavigating
                  ? 'text-[hsl(var(--snug-orange))]'
                  : 'text-[hsl(var(--snug-gray))] active:text-[hsl(var(--snug-orange))]',
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
            </button>
          );
        })}
      </div>
    </nav>
  );
}
