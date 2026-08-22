'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { 
  Search, 
  Sun, 
  Moon, 
  Menu 
} from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { Role } from '../../lib/types';
import { api } from '../../lib/api';

interface HeaderProps {
  onSearchOpen?: () => void;
  onMobileNavToggle?: () => void;
}

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Overview Dashboard',
  '/attendees': 'Attendees & Passes',
  '/config': 'Site Config & Live Alerts',
  '/media': 'Media & Brand Assets',
  '/alumni': 'Alumni Directory',
  '/cms': 'Summit Content & Schedule CMS',
  '/subscribers': 'Subscribers Directory',
  '/audit': 'Security & Audit Logs',
};

const ROLE_LABELS: Record<Role, { label: string; className: string }> = {
  ADMIN: { label: 'Admin', className: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25 font-semibold' },
  SUPER_ADMIN: { label: 'Admin', className: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25 font-semibold' },
  ORGANIZER: { label: 'Admin', className: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25 font-semibold' },
  GATE: { label: 'Gate', className: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/25 font-semibold' },
  VOLUNTEER_CHECKIN: { label: 'Gate', className: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/25 font-semibold' },
  INVESTOR: { label: 'Admin', className: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25 font-semibold' },
  USER: { label: 'User', className: 'text-(--text-muted) bg-(--bg-panel-alt) border-(--border-subtle)' },
  DELEGATE: { label: 'User', className: 'text-(--text-muted) bg-(--bg-panel-alt) border-(--border-subtle)' },
};

let globalApiHealthy = true;
let lastHealthCheckTime = 0;

export const Header: React.FC<HeaderProps> = ({ onSearchOpen, onMobileNavToggle }) => {
  const pathname = usePathname();
  const { role } = useAuth();
  const roleBadge = role ? ROLE_LABELS[role] : null;
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean>(globalApiHealthy);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const currentTitle = ROUTE_TITLES[pathname] || 'Control Console';

  useEffect(() => {
    const saved = localStorage.getItem('esummit_admin_theme') as 'dark' | 'light' | null;
    const initial = saved || 'dark';
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(initial);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('esummit_admin_theme', next);
    }
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(next);
    }
  };

  useEffect(() => {
    let mounted = true;
    let timer: NodeJS.Timeout;

    const checkHealth = async () => {
      // Throttle: don't re-check if checked within last 25 seconds
      if (Date.now() - lastHealthCheckTime < 25000) {
        if (mounted) setIsBackendHealthy(globalApiHealthy);
        timer = setTimeout(checkHealth, 25000);
        return;
      }

      try {
        const h = await api.getHealth();
        lastHealthCheckTime = Date.now();
        globalApiHealthy = h.status === 'ok';
        if (mounted) {
          setIsBackendHealthy(globalApiHealthy);
          timer = setTimeout(checkHealth, 30000);
        }
      } catch {
        lastHealthCheckTime = Date.now();
        globalApiHealthy = false;
        if (mounted) {
          setIsBackendHealthy(false);
          timer = setTimeout(checkHealth, 10000);
        }
      }
    };

    checkHealth();
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-(--border-panel) bg-(--bg-panel) px-3 sm:px-6 lg:px-8 transition-colors gap-2">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {onMobileNavToggle && (
          <button
            type="button"
            onClick={onMobileNavToggle}
            className="lg:hidden p-1.5 sm:p-2 rounded-lg border border-(--border-subtle) bg-(--bg-panel-alt) text-(--text-muted) hover:text-(--text-primary) transition-colors shrink-0"
            title="Open Menu"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}

        <div className="flex items-center gap-1.5 text-xs min-w-0">
          <span className="text-(--text-muted) font-medium hidden sm:inline">Console</span>
          <span className="text-(--text-muted) hidden sm:inline">/</span>
          <span className="text-(--text-primary) font-semibold truncate max-w-[130px] xs:max-w-[180px] sm:max-w-none">{currentTitle}</span>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      {onSearchOpen && (
        <button
          onClick={onSearchOpen}
          className="hidden md:flex items-center gap-2.5 rounded-lg border border-(--border-panel) bg-(--bg-panel-alt) px-3.5 py-1.5 text-xs text-(--text-muted) hover:border-emerald-500/50 hover:text-(--text-primary) transition-all font-medium w-52 lg:w-80 justify-between"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="h-3.5 w-3.5 text-(--text-muted) shrink-0" />
            <span className="truncate">Search attendees, passes...</span>
          </div>
          <kbd className="rounded bg-(--bg-panel-elevated) px-1.5 py-0.5 text-[10px] text-(--text-muted) font-mono border border-(--border-subtle) shrink-0">
            ⌘K
          </kbd>
        </button>
      )}

      {/* Right: API Status & Theme Switcher */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Backend status dot */}
        <div className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 rounded-full bg-(--bg-panel-alt) border border-(--border-subtle) text-[11px] font-medium shrink-0">
          <span 
            className={`h-1.5 w-1.5 rounded-full shrink-0 ${
              isBackendHealthy === true 
                ? 'bg-emerald-500' 
                : isBackendHealthy === false 
                ? 'bg-rose-500' 
                : 'bg-amber-500'
            }`} 
          />
          <span className="text-(--text-muted) hidden md:inline">API:</span>
          <span className={`text-[10px] sm:text-xs font-semibold ${isBackendHealthy ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
            <span className="hidden xs:inline">{isBackendHealthy ? 'Connected' : isBackendHealthy === false ? 'Offline' : 'Connecting'}</span>
            <span className="xs:hidden">{isBackendHealthy ? 'Live' : 'Off'}</span>
          </span>
        </div>

        {/* Dark / Light Mode */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-1.5 rounded-lg border border-(--border-subtle) bg-(--bg-panel-alt) text-(--text-secondary) hover:text-emerald-500 hover:border-emerald-500/40 transition-all shrink-0"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-sky-600" />
          )}
        </button>

        {/* User Role Badge */}
        {roleBadge && (
          <span className={`text-[10px] sm:text-[11px] font-bold rounded-md px-2 py-0.5 border shrink-0 hidden xs:inline-block ${roleBadge.className}`}>
            {roleBadge.label}
          </span>
        )}
      </div>
    </header>
  );
};
