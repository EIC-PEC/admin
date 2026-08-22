'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  RefreshCw, 
  Clock, 
  Globe, 
  User, 
  Activity,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { AuditLogItem } from '../../lib/types';
import { api, ApiError } from '../../lib/api';

const ACTION_BADGES: Record<string, { bg: string; text: string }> = {
  CREATE: { bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400', text: 'CREATE' },
  UPDATE: { bg: 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400', text: 'UPDATE' },
  DELETE: { bg: 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400', text: 'DELETE' },
  PATCH: { bg: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400', text: 'PATCH' },
};

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [error, setError] = useState<string | null>(null);

  const loadLogs = useCallback(async (targetPage = page) => {
    setRefreshing(true);
    setError(null);
    try {
      const res = await api.getAuditLogs({
        page: targetPage,
        limit: 25,
        search: search.trim() || undefined,
        action: actionFilter,
        entity: entityFilter,
      });
      setLogs(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages || 1);
      setPage(targetPage);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load security audit logs.');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [page, search, actionFilter, entityFilter]);

  useEffect(() => {
    loadLogs(1);
  }, [actionFilter, entityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadLogs(1);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-(--border-subtle) pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Security &amp; Compliance
              </span>
              <span className="text-xs text-(--text-muted) font-mono">
                {total.toLocaleString()} recorded mutations
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-(--text-primary)">
              Admin Activity &amp; Audit Logs
            </h1>
            <p className="text-xs text-(--text-muted) mt-0.5">
              Immutable audit trail recording all CMS modifications, gate overrides, and infrastructure events.
            </p>
          </div>

          <button
            onClick={() => loadLogs(page)}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-xl border border-(--border-panel) bg-(--bg-panel-alt) px-3.5 py-2 text-xs font-semibold text-(--text-secondary) hover:bg-(--bg-panel-elevated) hover:text-(--text-primary) transition-colors disabled:opacity-50 self-start sm:self-auto"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-emerald-500' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Sync Logs'}</span>
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-500 font-medium">
            {error}
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-(--bg-panel) p-3 rounded-2xl border border-(--border-panel)">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-(--text-muted)" />
            <input
              type="text"
              placeholder="Filter by admin email, API path, or IP address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-(--border-subtle) bg-(--bg-panel-alt) text-xs text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none focus:border-emerald-500/50"
            />
          </form>

          <div className="flex items-center gap-2 overflow-x-auto py-0.5">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-(--border-subtle) bg-(--bg-panel-alt) text-xs text-(--text-primary) font-medium focus:outline-none"
            >
              <option value="ALL">All Actions</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
            </select>

            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-(--border-subtle) bg-(--bg-panel-alt) text-xs text-(--text-primary) font-medium focus:outline-none"
            >
              <option value="ALL">All Entities</option>
              <option value="Speaker">Speakers</option>
              <option value="Event">Events</option>
              <option value="ScheduleItem">Timeline Schedule</option>
              <option value="Sponsor">Sponsors</option>
              <option value="Alumni">Alumni</option>
              <option value="Faq">FAQs</option>
              <option value="Registration">Registrations</option>
              <option value="SiteConfig">Site Config</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span>Loading audit activity feed...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-(--border-panel) p-12 text-center bg-(--bg-panel)/50">
            <ShieldCheck className="h-10 w-10 text-(--text-muted) mb-3 opacity-40" />
            <h3 className="text-sm font-semibold text-(--text-primary)">No Audit Logs Found</h3>
            <p className="text-xs text-(--text-muted) mt-1 max-w-sm">
              No mutation logs matched your filter criteria.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border border-(--border-panel) bg-(--bg-panel) overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-(--border-subtle) bg-(--bg-panel-alt)/60 text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider">
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Entity</th>
                      <th className="py-3 px-4">Admin User</th>
                      <th className="py-3 px-4">API Route / Method</th>
                      <th className="py-3 px-4">IP Address</th>
                      <th className="py-3 px-4 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-(--border-subtle) text-xs">
                    {logs.map((log) => {
                      const badge = ACTION_BADGES[log.action] || {
                        bg: 'bg-neutral-500/10 border-neutral-500/20 text-neutral-400',
                        text: log.action,
                      };
                      return (
                        <tr
                          key={log.id}
                          className="hover:bg-(--bg-panel-alt)/40 transition-colors"
                        >
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border ${badge.bg}`}
                            >
                              {badge.text}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-(--text-primary)">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-emerald-600 dark:text-emerald-400">
                                {log.entity}
                              </span>
                              {log.entityId && (
                                <span className="text-[10px] font-mono text-(--text-muted) truncate max-w-[80px]">
                                  #{log.entityId.slice(-6)}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-(--text-secondary)">
                            <div className="flex items-center gap-1.5">
                              <User className="h-3 w-3 text-(--text-muted)" />
                              <span className="truncate max-w-[180px]">
                                {log.userEmail || 'System / Anonymous'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-(--text-muted)">
                            <span className="text-emerald-500 font-bold mr-1.5">
                              {log.method}
                            </span>
                            <span className="truncate max-w-[200px] inline-block align-bottom">
                              {log.path}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-(--text-muted)">
                            <div className="flex items-center gap-1">
                              <Globe className="h-3 w-3 opacity-60" />
                              <span>{log.ipAddress || '127.0.0.1'}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-[11px] text-(--text-muted) whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1" title={new Date(log.createdAt).toLocaleString()}>
                              <Clock className="h-3 w-3 opacity-60" />
                              <span>{formatRelativeTime(log.createdAt)}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-2 pt-1 text-xs">
                <span className="text-(--text-muted)">
                  Page {page} of {totalPages} ({total} events)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={page <= 1}
                    onClick={() => loadLogs(page - 1)}
                    className="p-1.5 rounded-lg border border-(--border-panel) bg-(--bg-panel) text-(--text-secondary) hover:text-(--text-primary) disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => loadLogs(page + 1)}
                    className="p-1.5 rounded-lg border border-(--border-panel) bg-(--bg-panel) text-(--text-secondary) hover:text-(--text-primary) disabled:opacity-40 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
