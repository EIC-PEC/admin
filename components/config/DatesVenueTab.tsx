'use client';

import React from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';

interface DatesVenueTabProps {
  summitDates: string;
  setSummitDates: (val: string) => void;
  summitVenue: string;
  setSummitVenue: (val: string) => void;
  countdownTarget: string;
  setCountdownTarget: (val: string) => void;
  timeLeft: { days: number; hours: number; minutes: number; seconds: number };
}

export function generateTwoDayDisplayString(startDateIso: string): string {
  if (!startDateIso) return '';
  const d1 = new Date(startDateIso);
  if (isNaN(d1.getTime())) return '';

  const d2 = new Date(d1.getTime() + 24 * 60 * 60 * 1000);

  const m1 = d1.toLocaleString('en-US', { month: 'long' }).toUpperCase();
  const day1 = d1.getDate();
  const y1 = d1.getFullYear();

  const m2 = d2.toLocaleString('en-US', { month: 'long' }).toUpperCase();
  const day2 = d2.getDate();
  const y2 = d2.getFullYear();

  if (y1 !== y2) {
    return `${m1} ${day1}, ${y1} – ${m2} ${day2}, ${y2}`;
  }
  if (m1 !== m2) {
    return `${m1} ${day1} – ${m2} ${day2}, ${y1}`;
  }
  return `${m1} ${day1}–${day2}, ${y1}`;
}

export const DatesVenueTab: React.FC<DatesVenueTabProps> = ({
  summitDates,
  setSummitDates,
  summitVenue,
  setSummitVenue,
  countdownTarget,
  setCountdownTarget,
  timeLeft,
}) => {
  return (
    <div className="space-y-6">
      {/* Live Countdown Preview */}
      <div className="rounded-xl border border-(--border-panel) bg-(--bg-panel) p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-(--text-muted) uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Clock size={13} className="text-emerald-500" />
            Live Countdown Timer Preview
          </span>
          <span className="text-xs text-emerald-500 font-mono font-semibold">
            T-MINUS
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'DAYS', val: timeLeft.days },
            { label: 'HOURS', val: timeLeft.hours },
            { label: 'MINUTES', val: timeLeft.minutes },
            { label: 'SECONDS', val: timeLeft.seconds },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-lg bg-(--bg-panel-alt) border border-(--border-panel) p-3.5 text-center space-y-1"
            >
              <span className="text-2xl sm:text-3xl font-black text-(--text-primary) font-mono block">
                {String(item.val).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-(--text-muted) uppercase tracking-wider font-mono block">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Date & Venue Settings */}
      <div className="rounded-xl border border-(--border-panel) bg-(--bg-panel) p-5 space-y-4">
        <div className="border-b border-(--border-subtle) pb-3">
          <h2 className="text-sm font-bold text-(--text-primary)">
            Event Schedule &amp; Campus Location
          </h2>
          <p className="text-xs text-(--text-muted)">
            Controls the main date badge, campus address, and timer deadline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-(--text-primary)">
                Countdown Target DateTime
              </label>
              <span className="text-[10px] text-zinc-500 font-mono">ISO Format</span>
            </div>
            <input
              type="datetime-local"
              value={countdownTarget.slice(0, 16)}
              onChange={(e) => {
                setCountdownTarget(e.target.value);
                const generated = generateTwoDayDisplayString(e.target.value);
                if (generated) setSummitDates(generated);
              }}
              className="w-full px-3 py-2 text-xs rounded-lg bg-(--bg-panel-alt) border border-(--border-panel) text-(--text-primary) focus:border-emerald-500 outline-none font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-(--text-primary)">
              Display Date String (Badge)
            </label>
            <input
              type="text"
              value={summitDates}
              onChange={(e) => setSummitDates(e.target.value)}
              placeholder="e.g. MARCH 15–16, 2026"
              className="w-full px-3 py-2 text-xs rounded-lg bg-(--bg-panel-alt) border border-(--border-panel) text-(--text-primary) focus:border-emerald-500 outline-none font-mono"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-(--text-primary)">
              Summit Venue &amp; Campus Address
            </label>
            <input
              type="text"
              value={summitVenue}
              onChange={(e) => setSummitVenue(e.target.value)}
              placeholder="Punjab Engineering College, Sector 12, Chandigarh"
              className="w-full px-3 py-2 text-xs rounded-lg bg-(--bg-panel-alt) border border-(--border-panel) text-(--text-primary) focus:border-emerald-500 outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
