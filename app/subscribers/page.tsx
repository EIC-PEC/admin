'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Mail, 
  Download, 
  Search, 
  Trash2, 
  RefreshCw, 
  Users, 
  Calendar, 
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { SubscriberItem } from '../../lib/types';
import { api, ApiError } from '../../lib/api';

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<SubscriberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadSubscribers = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const data = await api.getSubscribers();
      setSubscribers(data || []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load subscribers.');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubscribers();
  }, [loadSubscribers]);

  const filteredSubscribers = useMemo(() => {
    if (!search.trim()) return subscribers;
    const q = search.toLowerCase().trim();
    return subscribers.filter((s) => s.email.toLowerCase().includes(q));
  }, [subscribers, search]);

  const exportToCsv = () => {
    const headers = ['ID', 'Email Address', 'Subscribed At'];
    const rows = filteredSubscribers.map((s) => [
      s.id,
      `"${s.email}"`,
      new Date(s.createdAt).toISOString(),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `pec_summit_subscribers_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to unsubscribe ${email}?`)) return;
    try {
      await api.deleteSubscriber(id);
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to delete subscriber.');
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-(--border-subtle) pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Audience Growth
              </span>
              <span className="text-xs text-(--text-muted) font-mono">
                {subscribers.length.toLocaleString()} total newsletter signups
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-(--text-primary)">
              Email Subscribers Directory
            </h1>
            <p className="text-xs text-(--text-muted) mt-0.5">
              Prospects and community members subscribed for PEC E-Summit 2026 announcements and ticket alerts.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadSubscribers}
              disabled={refreshing}
              className="flex items-center gap-1.5 rounded-xl border border-(--border-panel) bg-(--bg-panel-alt) px-3 py-2 text-xs font-semibold text-(--text-secondary) hover:bg-(--bg-panel-elevated) hover:text-(--text-primary) transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-emerald-500' : ''}`} />
              <span>{refreshing ? 'Syncing...' : 'Sync'}</span>
            </button>

            <button
              onClick={exportToCsv}
              disabled={filteredSubscribers.length === 0}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-xs font-bold text-slate-950 transition-colors shadow-sm disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV ({filteredSubscribers.length})</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-500 font-medium">
            {error}
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center gap-3 bg-(--bg-panel) p-3 rounded-2xl border border-(--border-panel)">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-(--text-muted)" />
            <input
              type="text"
              placeholder="Search subscriber emails..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-(--border-subtle) bg-(--bg-panel-alt) text-xs text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span>Loading subscribers list...</span>
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-(--border-panel) p-12 text-center bg-(--bg-panel)/50">
            <Mail className="h-10 w-10 text-(--text-muted) mb-3 opacity-40" />
            <h3 className="text-sm font-semibold text-(--text-primary)">No Subscribers Found</h3>
            <p className="text-xs text-(--text-muted) mt-1 max-w-sm">
              {search
                ? 'No subscriber email matched your search query.'
                : 'Emails collected via the homepage footer and concierge bot will appear here.'}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-(--border-panel) bg-(--bg-panel) overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-(--border-subtle) bg-(--bg-panel-alt)/60 text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Subscriber Email</th>
                    <th className="py-3 px-4">Subscribed Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--border-subtle) text-xs">
                  {filteredSubscribers.map((sub, idx) => (
                    <tr
                      key={sub.id}
                      className="hover:bg-(--bg-panel-alt)/40 transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-mono text-(--text-muted) text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-(--text-primary)">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span>{sub.email}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-(--text-muted) font-mono text-[11px]">
                        {new Date(sub.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDelete(sub.id, sub.email)}
                          className="p-1.5 rounded-lg text-(--text-muted) hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                          title="Unsubscribe Email"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
