'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Heart, Calendar, User } from 'lucide-react';
import { cn } from '@/shared/lib';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/rooms', icon: Search, label: 'Search' },
  { href: '/favorites', icon: Heart, label: 'Favorites' },
  { href: '/bookings', icon: Calendar, label: 'Bookings' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden safe-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full',
                'text-muted-foreground hover:text-foreground transition-colors',
                isActive && 'text-primary',
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
