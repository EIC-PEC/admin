'use client';

import React from 'react';
import { Mail, Phone, Share2, Globe, MessageSquare } from 'lucide-react';

interface ContactsTabProps {
  contactEmail: string;
  setContactEmail: (val: string) => void;
  contactPhone: string;
  setContactPhone: (val: string) => void;
  socialInstagram: string;
  setSocialInstagram: (val: string) => void;
  socialLinkedin: string;
  setSocialLinkedin: (val: string) => void;
  socialYoutube: string;
  setSocialYoutube: (val: string) => void;
}

export const ContactsTab: React.FC<ContactsTabProps> = ({
  contactEmail,
  setContactEmail,
  contactPhone,
  setContactPhone,
  socialInstagram,
  setSocialInstagram,
  socialLinkedin,
  setSocialLinkedin,
  socialYoutube,
  setSocialYoutube,
}) => {
  return (
    <div className="space-y-6">
      {/* Official Communication Desk */}
      <div className="rounded-xl border border-(--border-panel) bg-(--bg-panel) p-5 space-y-4">
        <div className="border-b border-(--border-subtle) pb-3">
          <h2 className="text-sm font-bold text-(--text-primary)">
            Official Communication Desk
          </h2>
          <p className="text-xs text-(--text-muted)">
            Helpdesk email and emergency coordinator numbers displayed in footer and passes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-(--text-primary) flex items-center gap-1.5">
              <Mail size={12} className="text-emerald-500" />
              General Helpdesk Email
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="eic@pec.edu.in"
              className="w-full px-3 py-2 text-xs rounded-lg bg-(--bg-panel-alt) border border-(--border-panel) text-(--text-primary) focus:border-emerald-500 outline-none font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-(--text-primary) flex items-center gap-1.5">
              <Phone size={12} className="text-emerald-500" />
              Convener Contact Phone
            </label>
            <input
              type="text"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-3 py-2 text-xs rounded-lg bg-(--bg-panel-alt) border border-(--border-panel) text-(--text-primary) focus:border-emerald-500 outline-none font-mono"
            />
          </div>
        </div>
      </div>

      {/* Social Media Channels */}
      <div className="rounded-xl border border-(--border-panel) bg-(--bg-panel) p-5 space-y-4">
        <div className="border-b border-(--border-subtle) pb-3">
          <h2 className="text-sm font-bold text-(--text-primary)">
            Social &amp; Community Channels
          </h2>
          <p className="text-xs text-(--text-muted)">
            Official handles linked across website footer and sharing cards.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-(--text-primary) flex items-center gap-1.5">
              <Globe size={12} className="text-pink-500" />
              Instagram Profile URL
            </label>
            <input
              type="url"
              value={socialInstagram}
              onChange={(e) => setSocialInstagram(e.target.value)}
              placeholder="https://instagram.com/eic_pec"
              className="w-full px-3 py-2 text-xs rounded-lg bg-(--bg-panel-alt) border border-(--border-panel) text-(--text-primary) focus:border-emerald-500 outline-none font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-(--text-primary) flex items-center gap-1.5">
              <Share2 size={12} className="text-blue-500" />
              LinkedIn Company URL
            </label>
            <input
              type="url"
              value={socialLinkedin}
              onChange={(e) => setSocialLinkedin(e.target.value)}
              placeholder="https://linkedin.com/company/eic-pec"
              className="w-full px-3 py-2 text-xs rounded-lg bg-(--bg-panel-alt) border border-(--border-panel) text-(--text-primary) focus:border-emerald-500 outline-none font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-(--text-primary) flex items-center gap-1.5">
              <MessageSquare size={12} className="text-red-500" />
              YouTube Channel URL
            </label>
            <input
              type="url"
              value={socialYoutube}
              onChange={(e) => setSocialYoutube(e.target.value)}
              placeholder="https://youtube.com/@eicpec"
              className="w-full px-3 py-2 text-xs rounded-lg bg-(--bg-panel-alt) border border-(--border-panel) text-(--text-primary) focus:border-emerald-500 outline-none font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
