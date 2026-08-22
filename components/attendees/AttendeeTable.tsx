'use client';

import React from 'react';
import { Eye, Mail, Send, Loader2, CheckCircle2, User, Building2, Ticket, IndianRupee } from 'lucide-react';
import { Registration } from '../../lib/types';

interface AttendeeTableProps {
  delegates: Registration[];
  loading: boolean;
  updatingId: string | null;
  resendingId: string | null;
  onViewPass: (reg: Registration) => void;
  onToggleOverride: (reg: Registration) => void;
  onResendPassEmail: (reg: Registration) => void;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  setPage: (p: number) => void;
  setLimit: (l: number) => void;
  fetchDelegates: (p?: number) => void;
}

export const AttendeeTable: React.FC<AttendeeTableProps> = ({
  delegates,
  loading,
  updatingId,
  resendingId,
  onViewPass,
  onToggleOverride,
  onResendPassEmail,
  page,
  limit,
  total,
  totalPages,
  setPage,
  setLimit,
  fetchDelegates,
}) => {
  return (
    <div className="rounded-xl border border-(--border-panel) bg-(--bg-panel) overflow-hidden shadow-sm">
      {/* ─── DESKTOP TABLE VIEW (Visible on md+ screens) ───────────────────────── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs text-(--text-secondary) min-w-[760px]">
          <thead className="border-b border-(--border-subtle) bg-(--bg-panel-alt) text-[11px] uppercase tracking-wider text-(--text-muted) font-semibold">
            <tr>
              <th className="py-3 px-4">Pass ID / Attendee</th>
              <th className="py-3 px-4">College / Institute</th>
              <th className="py-3 px-4">Pass Tier</th>
              <th className="py-3 px-4">Gate Status</th>
              <th className="py-3 px-4">Payment</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--border-subtle)">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-(--text-muted)">
                  Loading attendee records...
                </td>
              </tr>
            ) : delegates.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-(--text-muted)">
                  No matching attendees found.
                </td>
              </tr>
            ) : (
              delegates.map((d) => (
                <tr key={d.id} className="hover:bg-(--bg-panel-alt) transition-colors">
                  {/* Attendee */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-(--bg-panel-alt) border border-(--border-panel) text-(--text-primary) font-bold text-xs">
                        {d.user.name ? d.user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-(--text-primary) truncate">{d.user.name}</div>
                        <div className="text-[10px] text-(--text-muted) truncate">{d.user.email}</div>
                        <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                          {d.passId}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* College */}
                  <td className="py-3 px-4 text-(--text-secondary) max-w-[200px] truncate">
                    {d.user.college || 'Punjab Engineering College'}
                  </td>

                  {/* Pass Tier */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-(--text-secondary) font-medium">
                      {d.passType.replace('_', ' ')}
                    </span>
                  </td>

                  {/* Gate Status */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {d.isCheckedIn ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold flex items-center gap-1 w-fit">
                        <CheckCircle2 size={11} /> Checked In
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-zinc-500/10 border border-zinc-500/20 text-zinc-400 text-[10px] font-medium">
                        Pending Entry
                      </span>
                    )}
                  </td>

                  {/* Payment */}
                  <td className="py-3 px-4 font-mono font-medium whitespace-nowrap">
                    {d.amountPaid === 0 ? 'FREE' : `₹${d.amountPaid}`}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => onViewPass(d)}
                      className="p-1.5 rounded-lg border border-(--border-panel) bg-(--bg-panel-alt) hover:bg-(--bg-panel) text-(--text-secondary) hover:text-(--text-primary) transition-colors cursor-pointer"
                      title="Inspect Pass Badge"
                    >
                      <Eye size={13} />
                    </button>

                    <button
                      onClick={() => onResendPassEmail(d)}
                      disabled={resendingId === d.id}
                      className="p-1.5 rounded-lg border border-(--border-panel) bg-(--bg-panel-alt) hover:bg-(--bg-panel) text-(--text-secondary) hover:text-emerald-500 transition-colors disabled:opacity-50 cursor-pointer"
                      title="Resend Pass Email"
                    >
                      {resendingId === d.id ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                    </button>

                    <button
                      onClick={() => onToggleOverride(d)}
                      disabled={updatingId === d.id}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                        d.isCheckedIn
                          ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                      }`}
                    >
                      {updatingId === d.id ? '...' : d.isCheckedIn ? 'Revoke' : 'Check In'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ─── MOBILE CARDS VIEW (Visible on small screens) ──────────────────────── */}
      <div className="block md:hidden divide-y divide-(--border-subtle)">
        {loading ? (
          <div className="py-12 text-center text-xs text-(--text-muted)">
            Loading attendee records...
          </div>
        ) : delegates.length === 0 ? (
          <div className="py-12 text-center text-xs text-(--text-muted)">
            No matching attendees found.
          </div>
        ) : (
          delegates.map((d) => (
            <div key={d.id} className="p-3.5 space-y-3 bg-(--bg-panel) hover:bg-(--bg-panel-alt) transition-colors">
              {/* Card Header: Avatar, Name, Email, Pass ID */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-(--bg-panel-alt) border border-(--border-panel) text-(--text-primary) font-bold text-xs">
                    {d.user.name ? d.user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-xs text-(--text-primary) truncate">{d.user.name}</h3>
                    <p className="text-[11px] text-(--text-muted) truncate">{d.user.email}</p>
                  </div>
                </div>

                <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded shrink-0">
                  {d.passId}
                </span>
              </div>

              {/* Card Meta: College, Pass Tier, Gate Status, Payment */}
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-(--bg-panel-alt) p-2.5 rounded-lg border border-(--border-subtle)">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-(--text-muted) block">College</span>
                  <span className="text-(--text-secondary) font-medium truncate block">
                    {d.user.college || 'Punjab Engineering College'}
                  </span>
                </div>

                <div>
                  <span className="text-[9px] uppercase tracking-wider text-(--text-muted) block">Pass Tier</span>
                  <span className="text-(--text-secondary) font-medium truncate block">
                    {d.passType.replace('_', ' ')}
                  </span>
                </div>

                <div>
                  <span className="text-[9px] uppercase tracking-wider text-(--text-muted) block">Payment</span>
                  <span className="text-(--text-primary) font-mono font-bold">
                    {d.amountPaid === 0 ? 'FREE ENTRY' : `₹${d.amountPaid}`}
                  </span>
                </div>

                <div>
                  <span className="text-[9px] uppercase tracking-wider text-(--text-muted) block">Gate Status</span>
                  {d.isCheckedIn ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 size={10} /> Checked In
                    </span>
                  ) : (
                    <span className="text-zinc-400 font-medium">Pending Entry</span>
                  )}
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => onViewPass(d)}
                  className="flex-1 py-1.5 px-2 rounded-lg border border-(--border-panel) bg-(--bg-panel-alt) hover:bg-(--bg-panel) text-(--text-secondary) text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  <Eye size={12} />
                  <span>View Pass</span>
                </button>

                <button
                  onClick={() => onResendPassEmail(d)}
                  disabled={resendingId === d.id}
                  className="p-1.5 rounded-lg border border-(--border-panel) bg-(--bg-panel-alt) text-(--text-secondary) hover:text-emerald-500 transition-colors disabled:opacity-50"
                  title="Resend Email"
                >
                  {resendingId === d.id ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                </button>

                <button
                  onClick={() => onToggleOverride(d)}
                  disabled={updatingId === d.id}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                    d.isCheckedIn
                      ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20'
                      : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold'
                  }`}
                >
                  {updatingId === d.id ? '...' : d.isCheckedIn ? 'Revoke' : 'Check In'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ─── PAGINATION CONTROLS ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-(--border-subtle) bg-(--bg-panel) text-xs text-(--text-secondary)">
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-1.5">
            <span className="text-(--text-muted)">Rows:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-md border border-(--border-subtle) bg-(--bg-panel-alt) px-2 py-1 text-xs text-(--text-primary) focus:outline-none cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <span className="text-(--text-muted) text-[11px] sm:text-xs">
            {total === 0 ? 0 : (page - 1) * limit + 1}–{Math.min(total, page * limit)} of {total}
          </span>
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-center sm:justify-end">
          <button
            onClick={() => fetchDelegates(page - 1)}
            disabled={page <= 1 || loading}
            className="rounded-md border border-(--border-subtle) bg-(--bg-panel-alt) px-2.5 py-1 text-xs text-(--text-primary) hover:border-(--border-panel) disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Prev
          </button>
          <span className="px-2 text-(--text-secondary) text-xs">
            Page <strong className="text-(--text-primary)">{page}</strong> of <strong className="text-(--text-primary)">{totalPages}</strong>
          </span>
          <button
            onClick={() => fetchDelegates(page + 1)}
            disabled={page >= totalPages || loading}
            className="rounded-md border border-(--border-subtle) bg-(--bg-panel-alt) px-2.5 py-1 text-xs text-(--text-primary) hover:border-(--border-panel) disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
