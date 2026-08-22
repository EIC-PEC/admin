'use client';

import React from 'react';
import { Eye, Mail, Send, Loader2, CheckCircle2 } from 'lucide-react';
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
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-(--text-secondary)">
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
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-(--bg-panel-alt) border border-(--border-panel) text-(--text-primary) font-bold text-xs">
                        {d.user.name ? d.user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div className="font-semibold text-(--text-primary)">{d.user.name}</div>
                        <div className="text-[10px] text-(--text-muted)">{d.user.email}</div>
                        <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                          {d.passId}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* College */}
                  <td className="py-3 px-4 text-(--text-secondary)">
                    {d.user.college || 'Punjab Engineering College'}
                  </td>

                  {/* Pass Tier */}
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-(--text-secondary) font-medium">
                      {d.passType.replace('_', ' ')}
                    </span>
                  </td>

                  {/* Gate Status */}
                  <td className="py-3 px-4">
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
                  <td className="py-3 px-4 font-mono font-medium">
                    {d.amountPaid === 0 ? 'FREE' : `₹${d.amountPaid}`}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right space-x-1.5">
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

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-(--border-subtle) bg-(--bg-panel) text-xs text-(--text-secondary)">
        <div className="flex items-center gap-2">
          <span className="text-(--text-muted)">Rows per page:</span>
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
          <span className="text-(--text-muted) ml-2">
            Showing {total === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(total, page * limit)} of {total} attendees
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => fetchDelegates(page - 1)}
            disabled={page <= 1 || loading}
            className="rounded-md border border-(--border-subtle) bg-(--bg-panel-alt) px-2.5 py-1 text-xs text-(--text-primary) hover:border-(--border-panel) disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Previous
          </button>
          <span className="px-2 text-(--text-secondary)">
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
