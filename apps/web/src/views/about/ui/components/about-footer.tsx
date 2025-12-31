'use client';

import { Link } from '@/i18n/navigation';
import Image from 'next/image';

export function AboutFooter() {
  return (
    <footer className="bg-[#1A1A1A] text-white py-12 md:py-16">
      <div className="max-w-[1312px] mx-auto px-4 md:px-8 lg:px-16">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Logo & Copyright */}
          <div>
            <Image
              src="/images/logo/snug-logo-white.svg"
              alt="snug"
              width={100}
              height={32}
              className="h-8 w-auto mb-4"
            />
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} SNUG. All rights reserved.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-8">
            <div className="flex flex-col gap-2">
              <h4 className="font-bold text-sm mb-2">Company</h4>
              <Link
                href="/about"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                About Snug
              </Link>
              <Link
                href="/host"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Become a Host
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="font-bold text-sm mb-2">Legal</h4>
              <Link
                href="/terms"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="font-bold text-sm mb-2">Support</h4>
              <Link
                href="/help"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Help Center
              </Link>
              <a
                href="mailto:support@findsnug.com"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
