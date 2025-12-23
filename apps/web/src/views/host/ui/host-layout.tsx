'use client';

import { useState } from 'react';
import { HostSidebar } from './host-sidebar';
import { HostHeader } from './host-header';
import { HostMobileDrawer } from './host-mobile-drawer';

interface HostLayoutProps {
  children: React.ReactNode;
}

export function HostLayout({ children }: HostLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
        <HostHeader onToggleSidebar={toggleSidebar} onOpenDrawer={openDrawer} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto no-scrollbar">{children}</main>
      </div>
    </div>
  );
}
