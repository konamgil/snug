'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { HostSidebar } from './host-sidebar';
import { HostHeader } from './host-header';
import { HostMobileDrawer } from './host-mobile-drawer';
import { HostAuthGuard } from './host-auth-guard';
import { BreadcrumbProvider } from './host-breadcrumb-context';

interface HostLayoutProps {
  children: React.ReactNode;
}

export function HostLayout({ children }: HostLayoutProps) {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Intro page uses its own standalone layout (marketing page)
  const isIntroPage = pathname?.includes('/host/intro');

  if (isIntroPage) {
    return <>{children}</>;
  }

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const openDrawer = () => {
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <HostAuthGuard>
      <BreadcrumbProvider>
        <div className="flex h-screen bg-[#f5f5f5]">
          {/* Mobile Drawer */}
          <HostMobileDrawer isOpen={isDrawerOpen} onClose={closeDrawer} />

          {/* Desktop Sidebar */}
          <div className="hidden md:block">
            <HostSidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <HostHeader
              onToggleSidebar={toggleSidebar}
              onOpenDrawer={openDrawer}
              isSidebarCollapsed={isSidebarCollapsed}
            />

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto no-scrollbar">{children}</main>
          </div>
        </div>
      </BreadcrumbProvider>
    </HostAuthGuard>
  );
}
