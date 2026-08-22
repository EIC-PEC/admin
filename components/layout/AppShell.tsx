'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Search, X } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { Registration } from '../../lib/types';
import { Badge } from '../ui/Badge';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Registration[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const data = await api.getDelegates({ search: q, limit: 5 });
    setSearchResults(data.items);
    setSearching(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-(--bg-void) flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <span className="text-xs text-neutral-400 font-mono">Authenticating Console Access...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-(--bg-void) text-(--text-primary) transition-colors duration-200">
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-200 ${
          collapsed ? 'lg:pl-16' : 'lg:pl-60'
        }`}
      >
        <Header
          onSearchOpen={() => setSearchOpen(true)}
          onMobileNavToggle={() => setMobileOpen((prev) => !prev)}
        />

        <main className="flex-1 p-3.5 sm:p-4 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>

      {/* Quick Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-[4px] border border-(--border-panel) bg-(--bg-panel) p-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-(--border-subtle) pb-3">
              <div className="flex items-center gap-3 flex-1">
                <Search className="h-5 w-5 text-emerald-400" />
                <input
                  type="text"
                  placeholder="Search attendee by name, email, or pass ID..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  autoFocus
                  className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
                />
              </div>
              <button
                onClick={() => setSearchOpen(false)}
                className="rounded-none p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Results list */}
            <div className="mt-3 max-h-96 overflow-y-auto space-y-2">
              {searching ? (
                <p className="py-6 text-center text-xs text-zinc-400">
                  Querying delegate registry...
                </p>
              ) : searchResults.length > 0 ? (
                searchResults.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between p-3 rounded-none border border-white/10 bg-[#141C24] hover:border-white/20 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">
                          {d.user.name}
                        </span>
                        <Badge
                          size="sm"
                          variant={
                            d.passType === 'FOUNDER_PITCH'
                              ? 'coral'
                              : d.passType === 'HACKATHON_BUILDER'
                              ? 'blue'
                              : 'mint'
                          }
                        >
                          {d.passType.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-emerald-400 font-medium">
                          {d.passId}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-zinc-400">
                        <span>{d.user.email}</span>
                        {d.user.college && <span>• {d.user.college}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        size="sm"
                        variant={d.isCheckedIn ? 'mint' : 'muted'}
                        dot={d.isCheckedIn}
                      >
                        {d.isCheckedIn ? 'CHECKED IN' : 'NOT ARRIVED'}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : searchQuery ? (
                <p className="py-6 text-center text-xs text-zinc-400">
                  No attendees found matching &quot;{searchQuery}&quot;
                </p>
              ) : (
                <p className="py-6 text-center text-xs text-zinc-500">
                  Type a name, email, or pass number to quickly check attendee status.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
