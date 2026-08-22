'use client';

import React from 'react';
import { Megaphone, Flame, ExternalLink, Ticket } from 'lucide-react';

interface PresetAnnouncement {
  label: string;
  badge: string;
  text: string;
  link: string;
}

export const PRESET_ANNOUNCEMENTS: PresetAnnouncement[] = [
  {
    label: 'Closing Tonight',
    badge: 'URGENT',
    text: 'Early Bird Student Passes closing at midnight! Limited slots remaining.',
    link: '/register',
  },
  {
    label: 'Price Hike Notice',
    badge: 'PRICE HIKE',
    text: 'Pass prices will increase by ₹100 starting tomorrow. Grab your tickets now!',
    link: '/register',
  },
  {
    label: 'Speakers Announcement',
    badge: 'LINEUP',
    text: 'Distinguished unicorn founders & startup investors joining PEC E-Summit 2026!',
    link: '/#speakers',
  },
  {
    label: 'Hackathon Registration',
    badge: 'BUILDERS',
    text: '24-Hour Hackathon registrations are now open. Prize pool worth ₹5,00,000.',
    link: '/register',
  },
];

interface AnnouncementsTabProps {
  announcementEnabled: boolean;
  setAnnouncementEnabled: (val: boolean) => void;
  announcementText: string;
  setAnnouncementText: (val: string) => void;
  announcementLink: string;
  setAnnouncementLink: (val: string) => void;
  announcementBadge: string;
  setAnnouncementBadge: (val: string) => void;
  applyPreset: (preset: PresetAnnouncement) => void;
}

export const AnnouncementsTab: React.FC<AnnouncementsTabProps> = ({
  announcementEnabled,
  setAnnouncementEnabled,
  announcementText,
  setAnnouncementText,
  announcementLink,
  setAnnouncementLink,
  announcementBadge,
  setAnnouncementBadge,
  applyPreset,
}) => {
  return (
    <div className="space-y-6">
      {/* Live Preview Card */}
      <div className="rounded-xl border border-(--border-panel) bg-(--bg-panel) p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-(--text-muted) uppercase tracking-wider font-mono">
            Live Preview (How it appears on website)
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded font-mono font-medium ${
              announcementEnabled
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
            }`}
          >
            {announcementEnabled ? 'BANNER ACTIVE' : 'BANNER DISABLED'}
          </span>
        </div>

        {announcementEnabled ? (
          <div className="rounded-lg bg-(--bg-panel-alt) border border-emerald-500/30 p-3 flex items-center justify-between gap-3 overflow-hidden">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="shrink-0 px-2 py-0.5 rounded bg-emerald-500 text-(--bg-panel) text-[10px] font-bold uppercase tracking-wider font-mono">
                {announcementBadge || 'ALERT'}
              </span>
              <p className="text-xs font-medium text-(--text-primary) truncate">
                {announcementText || 'Your announcement message goes here...'}
              </p>
            </div>
            {announcementLink && (
              <span className="shrink-0 text-xs font-semibold text-emerald-500 flex items-center gap-1 hover:underline">
                Explore <ExternalLink size={11} />
              </span>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-(--border-subtle) p-4 text-center text-xs text-(--text-muted)">
            Announcement banner is currently turned off on the public website.
          </div>
        )}
      </div>

      {/* Settings Form */}
      <div className="rounded-xl border border-(--border-panel) bg-(--bg-panel) p-5 space-y-5">
        <div className="flex items-center justify-between border-b border-(--border-subtle) pb-3">
          <div>
            <h2 className="text-sm font-bold text-(--text-primary)">
              Announcement Banner Controls
            </h2>
            <p className="text-xs text-(--text-muted)">
              Configure top marquee ticker broadcasted to all visitors.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={announcementEnabled}
              onChange={(e) => setAnnouncementEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {/* Quick Presets */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-(--text-muted) flex items-center gap-1.5 font-mono uppercase">
            <Flame size={12} className="text-amber-500" />
            Quick One-Click Alert Presets
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {PRESET_ANNOUNCEMENTS.map((preset) => (
              <button
                type="button"
                key={preset.label}
                onClick={() => applyPreset(preset)}
                className="text-left p-2.5 rounded-lg border border-(--border-panel) bg-(--bg-panel-alt) hover:border-emerald-500/40 hover:bg-(--bg-panel) transition-all space-y-1 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-(--text-primary) group-hover:text-emerald-500 transition-colors">
                    {preset.label}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 font-mono font-semibold">
                    {preset.badge}
                  </span>
                </div>
                <p className="text-[11px] text-(--text-muted) line-clamp-2 leading-tight">
                  {preset.text}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-(--text-primary)">
              Alert Badge Label
            </label>
            <input
              type="text"
              value={announcementBadge}
              onChange={(e) => setAnnouncementBadge(e.target.value)}
              placeholder="URGENT, NOTICE, NEW"
              className="w-full px-3 py-2 text-xs rounded-lg bg-(--bg-panel-alt) border border-(--border-panel) text-(--text-primary) focus:border-emerald-500 outline-none font-mono"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-(--text-primary)">
              Announcement Message
            </label>
            <input
              type="text"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              placeholder="e.g. Student Delegate Registrations closing tonight..."
              className="w-full px-3 py-2 text-xs rounded-lg bg-(--bg-panel-alt) border border-(--border-panel) text-(--text-primary) focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="space-y-1.5 md:col-span-3">
            <label className="text-xs font-semibold text-(--text-primary)">
              Destination Link (Optional CTA)
            </label>
            <input
              type="text"
              value={announcementLink}
              onChange={(e) => setAnnouncementLink(e.target.value)}
              placeholder="/register or https://..."
              className="w-full px-3 py-2 text-xs rounded-lg bg-(--bg-panel-alt) border border-(--border-panel) text-(--text-primary) focus:border-emerald-500 outline-none font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
