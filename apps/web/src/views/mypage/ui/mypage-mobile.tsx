'use client';

import Image from 'next/image';
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
  Bell,
  ClipboardList,
  Building2,
  FileText,
} from 'lucide-react';
import { MobileNav } from '@/widgets/mobile-nav';
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

export function MypageMobile() {
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
      title: t('sidebar.hostInfo'),
      items: [
        {
          label: t('sidebar.businessRegistration'),
          href: '/mypage/business',
          icon: <ClipboardList className="w-5 h-5" strokeWidth={1.5} />,
          showChevron: true,
          disabled: true,
        },
        {
          label: t('sidebar.payoutAccount'),
          href: '/mypage/payout',
          icon: <Building2 className="w-5 h-5" strokeWidth={1.5} />,
          showChevron: true,
          disabled: true,
        },
        {
          label: t('sidebar.registeredListings'),
          href: '/mypage/listings',
          icon: <FileText className="w-5 h-5" strokeWidth={1.5} />,
          showChevron: true,
          disabled: true,
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
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4">
        <Image
          src="/images/logo/logo_hellosnug.svg"
          alt="hello, snug."
          width={140}
          height={32}
          priority
        />
        <button
          type="button"
          className="p-2 hover:bg-[hsl(var(--snug-light-gray))] active:bg-[hsl(var(--snug-light-gray))] active:scale-95 rounded-full transition-all duration-150"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-[hsl(var(--snug-text-primary))]" strokeWidth={1.5} />
        </button>
      </header>

      {/* Content */}
      <main className="px-5">
        {/* Page Title */}
        <h2 className="text-lg font-bold text-[hsl(var(--snug-text-primary))] mb-6">
          {t('sidebar.myPage')}
        </h2>

        {/* Menu Sections */}
        <nav className="space-y-6">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-bold text-[hsl(var(--snug-text-primary))] mb-2">
                {section.title}
              </h3>
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.href}>
                    {item.disabled ? (
                      <div className="flex items-center justify-between px-3 py-3 rounded-lg cursor-not-allowed opacity-50">
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
                        className="w-full flex items-center justify-between px-3 py-3 rounded-lg transition-all duration-150 hover:bg-[hsl(var(--snug-light-gray))] active:bg-[hsl(var(--snug-light-gray))] active:scale-[0.98]"
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
                        className={`flex items-center justify-between px-3 py-3 rounded-lg transition-all duration-150 active:scale-[0.98] ${
                          isActive(item.href)
                            ? 'bg-[hsl(var(--snug-light-gray))]'
                            : 'hover:bg-[hsl(var(--snug-light-gray))] active:bg-[hsl(var(--snug-light-gray))]'
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

        {/* Host Mode Button */}
        <div className="mt-8 mb-4">
          <Link
            href="/host"
            className="block w-full py-2.5 text-center text-[hsl(var(--snug-brown))] font-semibold border border-[hsl(var(--snug-brown))] rounded-full hover:bg-[hsl(var(--snug-brown))]/5 active:bg-[hsl(var(--snug-brown))]/10 active:scale-[0.98] transition-all duration-150"
          >
            {t('sidebar.hostMode')}
          </Link>
        </div>
      </main>

      {/* Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
