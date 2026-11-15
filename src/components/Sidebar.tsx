import {
  AlertTriangle,
  ArrowLeft,
  ClipboardCheck,
  FileSpreadsheet,
  FileText,
  LayoutDashboard,
  X,
} from 'lucide-react';
import { useState } from 'react';
import type { WorkspaceTab } from '../types.ts';

interface SidebarProps {
  activeTab: WorkspaceTab;
  onSelectTab: (tab: WorkspaceTab) => void;
  onBackToLanding: () => void;
  counts: {
    pendingApprovals: number;
    invoices: number;
    purchaseOrders: number;
    pendingEmails: number;
  };
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const OWNER_AVATAR_URL = '/src/assets/images/avatar_business_owner_1794763342709.jpg';

export function Sidebar({
  activeTab,
  onSelectTab,
  onBackToLanding,
  counts,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const [imgError, setImgError] = useState(false);

  const navItems: Array<{
    id: WorkspaceTab;
    label: string;
    icon: typeof LayoutDashboard;
    badgeCount?: number;
  }> = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      badgeCount: counts.pendingApprovals > 0 ? counts.pendingApprovals : undefined,
    },
    {
      id: 'invoices',
      label: 'Invoices & Upload',
      icon: FileText,
      badgeCount: counts.invoices,
    },
    {
      id: 'purchase-orders',
      label: 'Purchase Orders',
      icon: FileSpreadsheet,
      badgeCount: counts.purchaseOrders,
    },
    {
      id: 'discrepancies',
      label: 'Discrepancies & Comms',
      icon: AlertTriangle,
      badgeCount: counts.pendingEmails > 0 ? counts.pendingEmails : undefined,
    },
    {
      id: 'reconciliation',
      label: 'Reconciliation Report',
      icon: ClipboardCheck,
    },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white border-r border-slate-200 w-64 shrink-0">
      <div>
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200">
          <button
            type="button"
            onClick={() => {
              onSelectTab('overview');
              onCloseMobile();
            }}
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
          >
            FLOWMIND
          </button>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation"
            className="lg:hidden p-2 text-slate-500 hover:text-slate-900 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav aria-label="Workspace navigation" className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-200' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </span>
                {typeof item.badgeCount === 'number' && (
                  <span
                    className={`font-mono tabular-nums text-xs ml-2 ${
                      isActive ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    {item.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-200 space-y-3">
        <button
          type="button"
          onClick={() => {
            onBackToLanding();
            onCloseMobile();
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Website
        </button>

        <div className="flex items-center gap-3 pt-1">
          {!imgError ? (
            <img
              src={OWNER_AVATAR_URL}
              alt="Elena Vance, Operations Director"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold shrink-0">
              EV
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">Elena Vance</p>
            <p className="text-xs text-slate-500 truncate">Operations Director</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block h-screen sticky top-0 shrink-0">{sidebarContent}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
