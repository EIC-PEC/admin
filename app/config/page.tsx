'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Megaphone, 
  Calendar, 
  Sparkles, 
  Share2, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { api, ApiError } from '../../lib/api';
import { AnnouncementsTab, PRESET_ANNOUNCEMENTS } from '../../components/config/AnnouncementsTab';
import { DatesVenueTab } from '../../components/config/DatesVenueTab';
import { HeroStatsTab } from '../../components/config/HeroStatsTab';
import { ContactsTab } from '../../components/config/ContactsTab';

type ConfigTab = 'ANNOUNCEMENTS' | 'DATES' | 'HERO' | 'CONTACTS';

export default function SiteConfigPage() {
  const [activeTab, setActiveTab] = useState<ConfigTab>('ANNOUNCEMENTS');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [heroTitle, setHeroTitle] = useState('WHERE IDEAS MEET CAPITAL & BUILD THE FUTURE');
  const [heroSubtitle, setHeroSubtitle] = useState(
    "North India's largest student entrepreneurship summit at Punjab Engineering College. Join 3,000+ founders, investors, and builders for 2 days of keynotes, high-stakes pitches, and hackathons."
  );
  const [summitDates, setSummitDates] = useState('MARCH 15–16, 2026');
  const [summitVenue, setSummitVenue] = useState('Punjab Engineering College, Sector 12, Chandigarh');
  const [heroVideoUrl, setHeroVideoUrl] = useState('');
  
  // Announcement State
  const [announcementEnabled, setAnnouncementEnabled] = useState(true);
  const [announcementText, setAnnouncementText] = useState(
    'Early Bird Student Passes closing at midnight! Limited slots remaining.'
  );
  const [announcementLink, setAnnouncementLink] = useState('/register');
  const [announcementBadge, setAnnouncementBadge] = useState('URGENT');

  // Countdown Target
  const [countdownTarget, setCountdownTarget] = useState('2026-03-15T09:00:00');
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Stats & Contacts
  const [statsAttendees, setStatsAttendees] = useState('3000+');
  const [statsSpeakers, setStatsSpeakers] = useState('40+');
  const [statsPrizePool, setStatsPrizePool] = useState('₹15,00,000+');
  const [statsEditions, setStatsEditions] = useState('7th Edition');

  const [contactEmail, setContactEmail] = useState('eic@pec.edu.in');
  const [contactPhone, setContactPhone] = useState('+91 98765 43210');
  const [socialInstagram, setSocialInstagram] = useState('https://instagram.com/eic_pec');
  const [socialLinkedin, setSocialLinkedin] = useState('https://linkedin.com/company/eic-pec');
  const [socialYoutube, setSocialYoutube] = useState('https://youtube.com/@eicpec');

  // Load config from API
  const loadConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cfg = await api.getSiteConfig();
      if (cfg) {
        if (cfg.heroTitle) setHeroTitle(cfg.heroTitle);
        if (cfg.heroSubtitle) setHeroSubtitle(cfg.heroSubtitle);
        if (cfg.summitDates) setSummitDates(cfg.summitDates);
        if (cfg.summitVenue) setSummitVenue(cfg.summitVenue);
        if (cfg.heroVideoUrl) setHeroVideoUrl(cfg.heroVideoUrl);

        if (cfg.announcementText) {
          setAnnouncementText(cfg.announcementText);
          setAnnouncementEnabled(true);
        } else {
          setAnnouncementEnabled(false);
        }
        if (cfg.announcementLink) setAnnouncementLink(cfg.announcementLink);

        const stats = cfg.stats as Record<string, string> | undefined;
        if (stats) {
          if (stats.attendees) setStatsAttendees(stats.attendees);
          if (stats.speakers) setStatsSpeakers(stats.speakers);
          if (stats.prizePool) setStatsPrizePool(stats.prizePool);
          if (stats.editions) setStatsEditions(stats.editions);
          if (stats.countdownTarget) setCountdownTarget(stats.countdownTarget);
        }

        const contacts = cfg.contacts as Record<string, string> | undefined;
        if (contacts) {
          if (contacts.email) setContactEmail(contacts.email);
          if (contacts.phone) setContactPhone(contacts.phone);
          if (contacts.instagram) setSocialInstagram(contacts.instagram);
          if (contacts.linkedin) setSocialLinkedin(contacts.linkedin);
          if (contacts.youtube) setSocialYoutube(contacts.youtube);
        }
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load site configuration.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Calculate live countdown preview
  useEffect(() => {
    const updateCountdown = () => {
      const target = new Date(countdownTarget).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [countdownTarget]);

  // Save changes to API
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSavedSuccess(false);
    try {
      await api.updateSiteConfig({
        heroTitle,
        heroSubtitle,
        summitDates,
        summitVenue,
        heroVideoUrl: heroVideoUrl || undefined,
        announcementText: announcementEnabled ? announcementText : '',
        announcementLink: announcementEnabled ? announcementLink : '',
        stats: {
          attendees: statsAttendees,
          speakers: statsSpeakers,
          prizePool: statsPrizePool,
          editions: statsEditions,
          countdownTarget,
        },
        contacts: {
          email: contactEmail,
          phone: contactPhone,
          instagram: socialInstagram,
          linkedin: socialLinkedin,
          youtube: socialYoutube,
        },
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update site configuration.');
    } finally {
      setSaving(false);
    }
  };

  const applyPreset = (preset: (typeof PRESET_ANNOUNCEMENTS)[0]) => {
    setAnnouncementText(preset.text);
    setAnnouncementLink(preset.link);
    setAnnouncementBadge(preset.badge);
    setAnnouncementEnabled(true);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-(--border-subtle) pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-(--text-primary)">
              Site Config &amp; Live Alerts
            </h1>
            <p className="text-xs text-(--text-muted) mt-0.5">
              Manage live announcement banners, countdown event dates, hero branding, and contact channels.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadConfig}
              disabled={loading || saving}
              className="px-3 py-1.5 rounded-lg border border-(--border-panel) bg-(--bg-panel-alt) hover:bg-(--bg-panel) text-xs font-semibold text-(--text-primary) flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Reset</span>
            </button>

            <button
              onClick={handleSave}
              disabled={loading || saving}
              className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
            >
              <Save size={13} />
              <span>{saving ? 'Saving...' : 'Publish Changes'}</span>
            </button>
          </div>
        </div>

        {/* Feedback Alerts */}
        {savedSuccess && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 size={14} className="shrink-0" />
            <span>Site configuration updated and published successfully to live cache!</span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-medium flex items-center gap-2">
            <AlertTriangle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tabs Bar */}
        <div className="flex items-center gap-1 border-b border-(--border-subtle) pb-px overflow-x-auto">
          {[
            { id: 'ANNOUNCEMENTS', label: 'Announcement Ticker', icon: Megaphone },
            { id: 'DATES', label: 'Dates & Venue', icon: Calendar },
            { id: 'HERO', label: 'Hero & Counters', icon: Sparkles },
            { id: 'CONTACTS', label: 'Contacts & Socials', icon: Share2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ConfigTab)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'border-emerald-500 text-emerald-500 bg-emerald-500/5'
                    : 'border-transparent text-(--text-muted) hover:text-(--text-primary) hover:border-(--border-subtle)'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Tab Panel */}
        {activeTab === 'ANNOUNCEMENTS' && (
          <AnnouncementsTab
            announcementEnabled={announcementEnabled}
            setAnnouncementEnabled={setAnnouncementEnabled}
            announcementText={announcementText}
            setAnnouncementText={setAnnouncementText}
            announcementLink={announcementLink}
            setAnnouncementLink={setAnnouncementLink}
            announcementBadge={announcementBadge}
            setAnnouncementBadge={setAnnouncementBadge}
            applyPreset={applyPreset}
          />
        )}

        {activeTab === 'DATES' && (
          <DatesVenueTab
            summitDates={summitDates}
            setSummitDates={setSummitDates}
            summitVenue={summitVenue}
            setSummitVenue={setSummitVenue}
            countdownTarget={countdownTarget}
            setCountdownTarget={setCountdownTarget}
            timeLeft={timeLeft}
          />
        )}

        {activeTab === 'HERO' && (
          <HeroStatsTab
            heroTitle={heroTitle}
            setHeroTitle={setHeroTitle}
            heroSubtitle={heroSubtitle}
            setHeroSubtitle={setHeroSubtitle}
            heroVideoUrl={heroVideoUrl}
            setHeroVideoUrl={setHeroVideoUrl}
            statsAttendees={statsAttendees}
            setStatsAttendees={setStatsAttendees}
            statsSpeakers={statsSpeakers}
            setStatsSpeakers={setStatsSpeakers}
            statsPrizePool={statsPrizePool}
            setStatsPrizePool={setStatsPrizePool}
            statsEditions={statsEditions}
            setStatsEditions={setStatsEditions}
          />
        )}

        {activeTab === 'CONTACTS' && (
          <ContactsTab
            contactEmail={contactEmail}
            setContactEmail={setContactEmail}
            contactPhone={contactPhone}
            setContactPhone={setContactPhone}
            socialInstagram={socialInstagram}
            setSocialInstagram={setSocialInstagram}
            socialLinkedin={socialLinkedin}
            setSocialLinkedin={setSocialLinkedin}
            socialYoutube={socialYoutube}
            setSocialYoutube={setSocialYoutube}
          />
        )}
      </div>
    </AppShell>
  );
}
