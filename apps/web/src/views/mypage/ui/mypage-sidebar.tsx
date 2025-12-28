'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Link, useRouter } from '@/i18n/navigation';
import {
  User,
  Shield,
  CreditCard,
  Calendar,
  Heart,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/shared/stores';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  showChevron?: boolean;
  disabled?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function MypageSidebar() {
  const t = useTranslations('mypage');
  const pathname = usePathname();
  const router = useRouter();
  const signOut = useAuthStore((state) => state.signOut);

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const sections: NavSection[] = [
    {
      title: t('sidebar.personalInfo'),
      items: [
        {
          label: t('sidebar.profile'),
          href: '/mypage/profile',
          icon: <User className="w-5 h-5" strokeWidth={1.5} />,
          showChevron: true,
        },
        {
          label: t('sidebar.loginSecurity'),
          href: '/mypage/security',
          icon: <Shield className="w-5 h-5" strokeWidth={1.5} />,
          showChevron: true,
        },
        {
          label: t('sidebar.paymentInfo'),
          href: '/mypage/payment',
          icon: <CreditCard className="w-5 h-5" strokeWidth={1.5} />,
          showChevron: true,
          disabled: true,
        },
      ],
    },
    {
      title: t('sidebar.stay'),
      items: [
        {
          label: t('sidebar.reservations'),
          href: '/mypage/reservations',
          icon: <Calendar className="w-5 h-5" strokeWidth={1.5} />,
          showChevron: true,
          disabled: true,
        },
        {
          label: t('sidebar.favorites'),
          href: '/mypage/favorites',
          icon: <Heart className="w-5 h-5" strokeWidth={1.5} />,
          showChevron: true,
        },
      ],
    },
    {
      title: t('sidebar.preferences'),
      items: [
        {
          label: t('sidebar.settings'),
          href: '/mypage/settings',
          icon: <Settings className="w-5 h-5" strokeWidth={1.5} />,
          showChevron: true,
        },
        {
          label: t('sidebar.logout'),
          href: '/logout',
          icon: <LogOut className="w-5 h-5" strokeWidth={1.5} />,
          showChevron: false,
        },
      ],
    },
  ];

  const isActive = (href: string) => {
    return pathname.includes(href);
  };

  return (
    <aside className="flex-shrink-0">
      {/* My page Title */}
      <h2 className="text-lg font-bold text-[hsl(var(--snug-text-primary))] mb-5">
        {t('sidebar.myPage')}
      </h2>

      <nav className="space-y-5">
        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="text-sm font-semibold text-[hsl(var(--snug-text-primary))] mb-1.5 px-3">
              {section.title}
            </h3>
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.href}>
                  {item.disabled ? (
                    <div className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-not-allowed opacity-50">
                      <div className="flex items-center gap-3">
                        <span className="text-[hsl(var(--snug-gray))]">{item.icon}</span>
                        <span className="text-sm text-[hsl(var(--snug-gray))]">{item.label}</span>
                      </div>
                      {item.showChevron && (
                        <ChevronRight className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
                      )}
                    </div>
                  ) : item.href === '/logout' ? (
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors hover:bg-[hsl(var(--snug-light-gray))]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[hsl(var(--snug-gray))]">{item.icon}</span>
                        <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                          {item.label}
                        </span>
                      </div>
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                        isActive(item.href)
                          ? 'bg-[hsl(var(--snug-light-gray))]'
                          : 'hover:bg-[hsl(var(--snug-light-gray))]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[hsl(var(--snug-gray))]">{item.icon}</span>
                        <span className="text-sm text-[hsl(var(--snug-text-primary))]">
                          {item.label}
                        </span>
                      </div>
                      {item.showChevron && (
                        <ChevronRight className="w-4 h-4 text-[hsl(var(--snug-gray))]" />
                      )}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
