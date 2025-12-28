'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface HeaderActions {
  openDate?: string;
  lastModifiedBy?: string;
  isOperating?: boolean;
  onToggleOperating?: (value: boolean) => void;
}

interface BreadcrumbContextType {
  breadcrumb: string[];
  setBreadcrumb: (items: string[]) => void;
  headerActions: HeaderActions;
  setHeaderActions: (actions: HeaderActions) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [breadcrumb, setBreadcrumb] = useState<string[]>([]);
  const [headerActions, setHeaderActions] = useState<HeaderActions>({});

  return (
    <BreadcrumbContext.Provider
      value={{ breadcrumb, setBreadcrumb, headerActions, setHeaderActions }}
    >
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumb() {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error('useBreadcrumb must be used within a BreadcrumbProvider');
  }
  return context;
}
