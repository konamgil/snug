'use client';

import Link from 'next/link';
import { Menu, Globe } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-top">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="text-xl font-bold text-primary">Snug</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link
            href="/rooms"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Find Rooms
          </Link>
          <Link
            href="/host"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Become a Host
          </Link>
        </nav>

        <div className="flex-1" />

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <button type="button" className="p-2 hover:bg-accent rounded-full transition-colors">
            <Globe className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium hover:bg-accent rounded-lg transition-colors"
          >
            Login
          </button>
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            Sign Up
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="md:hidden p-2 hover:bg-accent rounded-lg transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
