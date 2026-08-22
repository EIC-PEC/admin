'use client';

import React from 'react';
import { X, QrCode, CheckCircle2, Printer } from 'lucide-react';
import { Registration } from '../../lib/types';

interface AttendeeDetailModalProps {
  delegate: Registration | null;
  onClose: () => void;
  onToggleOverride: (reg: Registration) => void;
}

export const AttendeeDetailModal: React.FC<AttendeeDetailModalProps> = ({
  delegate,
  onClose,
  onToggleOverride,
}) => {
  if (!delegate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-sm rounded-2xl border border-(--border-panel) bg-(--bg-panel) p-5 shadow-2xl space-y-4">
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3.5 rounded-lg p-1 text-(--text-muted) hover:bg-(--bg-panel-alt) hover:text-(--text-primary) transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="text-center space-y-1">
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            Official Summit Pass
          </span>
          <h3 className="text-base font-bold text-(--text-primary) mt-1">
            PEC E-Summit 2026
          </h3>
          <p className="text-[11px] text-(--text-muted)">
            March 15-16, 2026 • PEC Chandigarh
          </p>
        </div>

        {/* Pass Card Preview */}
        <div className="rounded-xl border border-(--border-subtle) bg-(--bg-panel-alt) p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[9px] uppercase text-(--text-muted) font-semibold block">
                Attendee Name
              </span>
              <h4 className="text-sm font-bold text-(--text-primary)">
                {delegate.user.name}
              </h4>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">
                {delegate.user.email}
              </p>
              <p className="text-[11px] text-(--text-muted) mt-0.5">
                {delegate.user.college || 'Punjab Engineering College'}
              </p>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-neutral-300">
              {delegate.passType.replace('_', ' ')}
            </span>
          </div>

          {/* QR Code Box */}
          <div className="flex flex-col items-center justify-center p-3 bg-white rounded-lg border border-(--border-subtle) shadow-sm">
            <div className="h-28 w-28 p-1 flex items-center justify-center">
              <QrCode className="w-full h-full text-black" />
            </div>
            <span className="mt-1 text-[11px] font-bold tracking-wider text-slate-900 font-mono">
              {delegate.passId}
            </span>
          </div>

          <div className="flex justify-between items-center text-[10px] text-(--text-muted) border-t border-(--border-subtle) pt-2">
            <span>SECURE GATE PASS</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {delegate.isCheckedIn ? 'CHECKED IN' : 'VALID'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleOverride(delegate)}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer ${
              delegate.isCheckedIn
                ? 'bg-rose-500/15 border border-rose-500/30 text-rose-500 hover:bg-rose-500/25'
                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>
              {delegate.isCheckedIn ? 'Revoke Check-In' : 'Authorize Gate Entry'}
            </span>
          </button>

          <button
            onClick={() => window.print()}
            className="rounded-lg border border-(--border-panel) bg-(--bg-panel-alt) p-2 text-(--text-secondary) hover:text-(--text-primary) cursor-pointer"
            title="Print Pass"
          >
            <Printer className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
