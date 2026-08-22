'use client';

import React from 'react';
import { Sparkles, Trophy, Users, Award, Mic } from 'lucide-react';

interface HeroStatsTabProps {
  heroTitle: string;
  setHeroTitle: (val: string) => void;
  heroSubtitle: string;
  setHeroSubtitle: (val: string) => void;
  heroVideoUrl: string;
  setHeroVideoUrl: (val: string) => void;
  statsAttendees: string;
  setStatsAttendees: (val: string) => void;
  statsSpeakers: string;
  setStatsSpeakers: (val: string) => void;
  statsPrizePool: string;
  setStatsPrizePool: (val: string) => void;
  statsEditions: string;
  setStatsEditions: (val: string) => void;
}

export const HeroStatsTab: React.FC<HeroStatsTabProps> = ({
  heroTitle,
  setHeroTitle,
  heroSubtitle,
  setHeroSubtitle,
  heroVideoUrl,
  setHeroVideoUrl,
  statsAttendees,
  setStatsAttendees,
  statsSpeakers,
  setStatsSpeakers,
  statsPrizePool,
  setStatsPrizePool,
  statsEditions,
  setStatsEditions,
}) => {
  return (
    <div className="space-y-6">
      {/* Hero Content Form */}
      <div className="rounded-xl border border-(--border-panel) bg-(--bg-panel) p-5 space-y-4">
        <div className="border-b border-(--border-subtle) pb-3">
          <h2 className="text-sm font-bold text-(--text-primary)">
            Hero Header &amp; Value Proposition
          </h2>
          <p className="text-xs text-(--text-muted)">
            Primary headline and supporting paragraph shown above the fold on the homepage.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-(--text-primary)">
              Main Hero Heading
            </label>
            <input
              type="text"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              placeholder="WHERE IDEAS MEET CAPITAL & BUILD THE FUTURE"
              className="w-full px-3 py-2 text-xs rounded-lg bg-(--bg-panel-alt) border border-(--border-panel) text-(--text-primary) focus:border-emerald-500 outline-none uppercase font-bold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-(--text-primary)">
              Hero Subtitle / Description
            </label>
            <textarea
              rows={3}
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              placeholder="North India's largest student entrepreneurship summit at Punjab Engineering College..."
              className="w-full px-3 py-2 text-xs rounded-lg bg-(--bg-panel-alt) border border-(--border-panel) text-(--text-primary) focus:border-emerald-500 outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-(--text-primary)">
              Hero Background Video / Reel Stream URL (Optional)
            </label>
            <input
              type="url"
              value={heroVideoUrl}
              onChange={(e) => setHeroVideoUrl(e.target.value)}
              placeholder="https://.../video.mp4"
              className="w-full px-3 py-2 text-xs rounded-lg bg-(--bg-panel-alt) border border-(--border-panel) text-(--text-primary) focus:border-emerald-500 outline-none font-mono"
            />
          </div>
        </div>
      </div>

      {/* Key Metric Counters */}
      <div className="rounded-xl border border-(--border-panel) bg-(--bg-panel) p-5 space-y-4">
        <div className="border-b border-(--border-subtle) pb-3">
          <h2 className="text-sm font-bold text-(--text-primary)">
            Key Metric Stat Counters
          </h2>
          <p className="text-xs text-(--text-muted)">
            Headline statistics displayed across the landing page and marquee tickers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-(--text-primary) flex items-center gap-1.5">
              <Users size={12} className="text-emerald-500" />
              Attendees Count
            </label>
            <input
              type="text"
              value={statsAttendees}
              onChange={(e) => setStatsAttendees(e.target.value)}
              placeholder="3000+"
              className="w-full px-3 py-2 text-xs rounded-lg bg-(--bg-panel-alt) border border-(--border-panel) text-(--text-primary) focus:border-emerald-500 outline-none font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-(--text-primary) flex items-center gap-1.5">
              <Mic size={12} className="text-emerald-500" />
              Speakers Count
            </label>
            <input
              type="text"
              value={statsSpeakers}
              onChange={(e) => setStatsSpeakers(e.target.value)}
              placeholder="40+"
              className="w-full px-3 py-2 text-xs rounded-lg bg-(--bg-panel-alt) border border-(--border-panel) text-(--text-primary) focus:border-emerald-500 outline-none font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-(--text-primary) flex items-center gap-1.5">
              <Trophy size={12} className="text-amber-500" />
              Prize Pool
            </label>
            <input
              type="text"
              value={statsPrizePool}
              onChange={(e) => setStatsPrizePool(e.target.value)}
              placeholder="₹15,00,000+"
              className="w-full px-3 py-2 text-xs rounded-lg bg-(--bg-panel-alt) border border-(--border-panel) text-(--text-primary) focus:border-emerald-500 outline-none font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-(--text-primary) flex items-center gap-1.5">
              <Award size={12} className="text-emerald-500" />
              Editions Legacy
            </label>
            <input
              type="text"
              value={statsEditions}
              onChange={(e) => setStatsEditions(e.target.value)}
              placeholder="7th Edition"
              className="w-full px-3 py-2 text-xs rounded-lg bg-(--bg-panel-alt) border border-(--border-panel) text-(--text-primary) focus:border-emerald-500 outline-none font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
