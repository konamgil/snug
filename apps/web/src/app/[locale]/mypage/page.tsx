'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { MypageMobile } from '@/views/mypage';

export default function MypagePage() {
  const router = useRouter();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Check if desktop (lg breakpoint = 1024px)
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkDesktop();

    // If desktop, redirect to profile page
    if (window.innerWidth >= 1024) {
      router.replace('/mypage/profile');
    }
  }, [router]);

  // Desktop: redirect happens, show nothing while redirecting
  if (isDesktop) {
    return null;
  }

  // Mobile: show mobile mypage
  return <MypageMobile />;
}
