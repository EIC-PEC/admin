'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Download, RefreshCw, CheckCircle2 } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { api, ApiError } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { Registration } from '../../lib/types';
import { AttendeeFilters } from '../../components/attendees/AttendeeFilters';
import { AttendeeTable } from '../../components/attendees/AttendeeTable';
import { AttendeeDetailModal } from '../../components/attendees/AttendeeDetailModal';

export default function AttendeesPage() {
  const { isAuthenticated } = useAuth();
  const [delegates, setDelegates] = useState<Registration[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(25);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState('');
  const [passFilter, setPassFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedDelegate, setSelectedDelegate] = useState<Registration | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const fetchDelegates = useCallback(async (targetPage = page) => {
    if (!isAuthenticated) return;
    setLoading(true);
    const params: {
      page?: number;
      limit?: number;
      search?: string;
      passType?: string;
      isCheckedIn?: boolean;
    } = {
      page: targetPage,
      limit,
    };

    if (search.trim()) params.search = search.trim();
    if (passFilter !== 'ALL') params.passType = passFilter;
    if (statusFilter === 'CHECKED_IN') params.isCheckedIn = true;
    if (statusFilter === 'NOT_CHECKED_IN') params.isCheckedIn = false;

    try {
      const res = await api.getDelegates(params);
      setDelegates(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
      setPage(targetPage);
    } catch {
      // Backend offline or error
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, passFilter, statusFilter, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchDelegates(1);
  }, [passFilter, statusFilter, fetchDelegates, isAuthenticated]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDelegates(1);
  };

  const handleToggleOverride = async (reg: Registration) => {
    setUpdatingId(reg.id);
    try {
      const updated = await api.toggleCheckInOverride(reg.id);
      setDelegates((prev) =>
        prev.map((d) => (d.id === reg.id ? { ...d, isCheckedIn: updated.isCheckedIn } : d))
      );
      if (selectedDelegate?.id === reg.id) {
        setSelectedDelegate({ ...selectedDelegate, isCheckedIn: updated.isCheckedIn });
      }
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to update check-in status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleResendPassEmail = async (reg: Registration) => {
    setResendingId(reg.id);
    setActionFeedback(null);
    try {
      await api.resendPassEmail(reg.id);
      setActionFeedback(`Pass confirmation email sent to ${reg.user.email}`);
      setTimeout(() => setActionFeedback(null), 5000);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to resend pass email.');
    } finally {
      setResendingId(null);
    }
  };

  const exportToCsv = async () => {
    setExporting(true);
    try {
      const allDelegates = await api.exportAllDelegates();
      const headers = ['Pass ID', 'Name', 'Email', 'Phone', 'College', 'Pass Type', 'Amount Paid (INR)', 'Checked In', 'Registered At'];
      const rows = allDelegates.map((d) => [
        d.passId,
        `"${d.name}"`,
        d.email,
        d.phone || 'N/A',
        `"${d.college || 'N/A'}"`,
        d.passType,
        d.amountPaid,
        d.isCheckedIn ? 'YES' : 'NO',
        new Date(d.createdAt).toISOString(),
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `pec_summit_all_attendees_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      alert('Could not export full database list.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-5">
        {/* Top Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-(--border-subtle) pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Live Roster
              </span>
              <span className="text-xs text-(--text-muted) font-mono">
                {total.toLocaleString()} total attendees
              </span>
            </div>
            <h1 className="text-2xl font-bold text-(--text-primary) tracking-tight">
              Attendees &amp; Pass Manager
            </h1>
            <p className="text-xs text-(--text-muted) mt-0.5">
              Verify registrations, inspect digital passes, and record gate check-ins.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={exportToCsv}
              disabled={exporting}
              className="flex items-center gap-1.5 rounded-lg border border-(--border-panel) bg-(--bg-panel-alt) px-3 py-1.5 text-xs font-semibold text-(--text-secondary) hover:text-(--text-primary) hover:border-(--border-panel-elevated) transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Download className={`h-3.5 w-3.5 ${exporting ? 'animate-bounce text-emerald-500' : ''}`} />
              <span>{exporting ? 'Exporting All...' : 'Export Full CSV'}</span>
            </button>
            <button
              onClick={() => fetchDelegates()}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow-sm transition-all uppercase tracking-wider cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync</span>
            </button>
          </div>
        </div>

        {actionFeedback && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* Filter & Search Bar */}
        <AttendeeFilters
          search={search}
          setSearch={setSearch}
          handleSearchSubmit={handleSearchSubmit}
          passFilter={passFilter}
          setPassFilter={setPassFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        {/* Datatable */}
        <AttendeeTable
          delegates={delegates}
          loading={loading}
          updatingId={updatingId}
          resendingId={resendingId}
          onViewPass={(d) => setSelectedDelegate(d)}
          onToggleOverride={handleToggleOverride}
          onResendPassEmail={handleResendPassEmail}
          page={page}
          limit={limit}
          total={total}
          totalPages={totalPages}
          setPage={setPage}
          setLimit={setLimit}
          fetchDelegates={fetchDelegates}
        />

        {/* Interactive E-Badge Modal */}
        <AttendeeDetailModal
          delegate={selectedDelegate}
          onClose={() => setSelectedDelegate(null)}
          onToggleOverride={handleToggleOverride}
        />
      </div>
    </AppShell>
  );
}
