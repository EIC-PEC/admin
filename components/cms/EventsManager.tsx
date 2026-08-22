'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Pencil, 
  Calendar, 
  Trophy, 
  ExternalLink, 
  Tag, 
  Users, 
  Layers,
  Sparkles,
  MapPin
} from 'lucide-react';
import { ImageDropzone } from '../ui/ImageDropzone';
import { CmsModal } from './CmsModal';
import { EventItem, EventInput } from '../../lib/types';
import { api, ApiError } from '../../lib/api';

const INPUT_CLS =
  'w-full rounded-xl border border-(--border-panel) bg-(--bg-panel-alt) p-2.5 text-xs text-(--text-primary) focus:border-emerald-500/50 focus:outline-none transition-colors';

interface Props {
  events: EventItem[];
  onEventsChange: (events: EventItem[]) => void;
}

export function EventsManager({ events, onEventsChange }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  const [form, setForm] = useState<EventInput>({
    number: '01',
    title: '',
    category: 'Industry Workshop',
    eyebrow: '',
    image: '',
    purpose: '',
    delivery: '',
    expectedParticipation: '',
    tags: [],
    partner: '',
    registrationUrl: '',
    type: 'competition',
    track: '',
    day: 1,
    startTime: '09:00',
    endTime: '17:00',
    venue: '',
  });

  const openCreateModal = () => {
    setEditingEvent(null);
    setForm({
      number: `0${events.length + 1}`.slice(-2),
      title: '',
      category: 'Innovation Challenge',
      eyebrow: '',
      image: '',
      purpose: '',
      delivery: 'On-Campus Stage, Offline',
      expectedParticipation: '500+ Participants',
      tags: ['Cash Prizes', 'Certificate'],
      partner: '',
      registrationUrl: '',
      type: 'competition',
      track: '',
      day: 1,
      startTime: '09:00',
      endTime: '17:00',
      venue: 'Main Auditorium',
    });
    setNewTagInput('');
    setModalOpen(true);
  };

  const openEditModal = (evt: EventItem) => {
    setEditingEvent(evt);
    setForm({
      number: evt.number || '01',
      title: evt.title,
      category: evt.category || 'General',
      eyebrow: evt.eyebrow || '',
      image: evt.image || '',
      purpose: evt.purpose || '',
      delivery: evt.delivery || '',
      expectedParticipation: evt.expectedParticipation || '',
      tags: evt.tags || [],
      partner: evt.partner || '',
      registrationUrl: evt.registrationUrl || '',
      type: evt.type || 'competition',
      track: evt.track || '',
      day: evt.day || 1,
      startTime: evt.startTime || '09:00',
      endTime: evt.endTime || '17:00',
      venue: evt.venue || '',
    });
    setNewTagInput('');
    setModalOpen(true);
  };

  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    const clean = newTagInput.trim();
    if (!form.tags?.includes(clean)) {
      setForm({ ...form, tags: [...(form.tags || []), clean] });
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setForm({
      ...form,
      tags: form.tags?.filter((t) => t !== tagToRemove) || [],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert('Please enter an event title.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingEvent) {
        const updated = await api.updateEvent(editingEvent.id, form);
        onEventsChange(events.map((e) => (e.id === editingEvent.id ? updated : e)));
      } else {
        const created = await api.createEvent(form);
        onEventsChange([...events, created]);
      }
      setModalOpen(false);
      setEditingEvent(null);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to save event details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this flagship event?')) return;
    try {
      await api.deleteEvent(id);
      onEventsChange(events.filter((e) => e.id !== id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to delete event.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-(--bg-panel) p-4 rounded-2xl border border-(--border-panel)">
        <div>
          <h2 className="text-sm font-bold text-(--text-primary)">
            Flagship Summit Activities &amp; Competitions
          </h2>
          <p className="text-xs text-(--text-muted) mt-0.5">
            Configure full event rules, prize pool tags, external registration links, and showcase posters.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-xs font-bold text-slate-950 transition-colors shadow-sm shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add Flagship Event</span>
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((evt) => (
          <div
            key={evt.id}
            className="group relative rounded-2xl border border-(--border-panel) bg-(--bg-panel) overflow-hidden flex flex-col justify-between hover:border-(--border-panel-elevated) transition-all shadow-xs"
          >
            {/* Header Poster Banner */}
            <div className="relative aspect-video w-full overflow-hidden bg-black/40 border-b border-(--border-subtle)">
              {evt.image ? (
                <img
                  src={evt.image}
                  alt={evt.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-neutral-500 text-xs">
                  No Cover Poster
                </div>
              )}
              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono font-bold text-white border border-white/10">
                #{evt.number || '00'}
              </span>

              {/* Action Buttons */}
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditModal(evt)}
                  className="rounded-lg bg-black/70 backdrop-blur-md p-1.5 text-neutral-300 hover:text-emerald-400 border border-white/10 transition-colors"
                  title="Edit Event Details"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(evt.id)}
                  className="rounded-lg bg-black/70 backdrop-blur-md p-1.5 text-neutral-300 hover:text-rose-500 border border-white/10 transition-colors"
                  title="Delete Event"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Event Info Content */}
            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-mono">
                    {evt.category || 'Challenge'}
                  </span>
                  {evt.eyebrow && (
                    <span className="text-[9px] text-(--text-muted) px-1.5 py-0.2 rounded bg-(--bg-panel-alt) border border-(--border-subtle) uppercase truncate max-w-[120px]">
                      {evt.eyebrow}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-sm text-(--text-primary) leading-snug line-clamp-1">
                  {evt.title}
                </h3>

                {evt.purpose && (
                  <p className="text-xs text-(--text-muted) line-clamp-2 mt-1.5 leading-relaxed">
                    {evt.purpose}
                  </p>
                )}
              </div>

              {/* Tags & External Link */}
              <div className="pt-2 border-t border-(--border-subtle) space-y-2">
                <div className="flex flex-wrap gap-1">
                  {(evt.tags || []).slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {evt.registrationUrl && (
                  <a
                    href={evt.registrationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span className="truncate">Registration Portal</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Create Event Modal */}
      <CmsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingEvent ? `Edit Event #${form.number}: ${form.title}` : 'Add Flagship Event'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-(--text-secondary) uppercase tracking-wider mb-1">
                Number (e.g. 01)
              </label>
              <input
                type="text"
                value={form.number}
                onChange={(e) => setForm({ ...form, number: e.target.value })}
                className={INPUT_CLS}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-(--text-secondary) uppercase tracking-wider mb-1">
                Category
              </label>
              <input
                type="text"
                placeholder="e.g. Strategy Competition, Hackathon"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={INPUT_CLS}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-(--text-secondary) uppercase tracking-wider mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. IPL AUCTION STRATEGY CHALLENGE"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={INPUT_CLS}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-(--text-secondary) uppercase tracking-wider mb-1">
              Eyebrow Subtitle (Banner Tag)
            </label>
            <input
              type="text"
              placeholder="e.g. HIGH-STAKES BIDDING & PORTFOLIO SIMULATION"
              value={form.eyebrow}
              onChange={(e) => setForm({ ...form, eyebrow: e.target.value })}
              className={INPUT_CLS}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-(--text-secondary) uppercase tracking-wider mb-1">
              Purpose &amp; Rules Description
            </label>
            <textarea
              rows={3}
              placeholder="Explain the challenge, evaluation criteria, and target audience..."
              value={form.purpose}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              className={INPUT_CLS}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-(--text-secondary) uppercase tracking-wider mb-1">
                Format / Delivery
              </label>
              <input
                type="text"
                placeholder="e.g. 2 Rounds, Offline Campus"
                value={form.delivery}
                onChange={(e) => setForm({ ...form, delivery: e.target.value })}
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-(--text-secondary) uppercase tracking-wider mb-1">
                Expected Participation
              </label>
              <input
                type="text"
                placeholder="e.g. 150+ Teams (450+ Delegates)"
                value={form.expectedParticipation}
                onChange={(e) => setForm({ ...form, expectedParticipation: e.target.value })}
                className={INPUT_CLS}
              />
            </div>
          </div>

          {/* Tags / Prize Pool */}
          <div>
            <label className="block text-[11px] font-semibold text-(--text-secondary) uppercase tracking-wider mb-1">
              Tags &amp; Cash Prize Badges
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {(form.tags || []).map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. ₹50,000 Cash Pool, Certificates"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className={INPUT_CLS}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 rounded-xl bg-(--bg-panel-alt) border border-(--border-panel) text-xs font-semibold hover:text-emerald-500 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-(--text-secondary) uppercase tracking-wider mb-1">
              External Registration Link (Unstop / Form)
            </label>
            <input
              type="url"
              placeholder="https://unstop.com/competitions/..."
              value={form.registrationUrl || ''}
              onChange={(e) => setForm({ ...form, registrationUrl: e.target.value })}
              className={INPUT_CLS}
            />
          </div>

          {/* Cover Poster */}
          <div>
            <label className="block text-[11px] font-semibold text-(--text-secondary) uppercase tracking-wider mb-1.5">
              Event Cover Poster Image
            </label>
            <ImageDropzone
              value={form.image || ''}
              onChange={(url) => setForm({ ...form, image: url })}
              folder="events"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-(--border-subtle)">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-(--text-secondary) hover:bg-(--bg-panel-alt) transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-2 text-xs font-bold text-slate-950 transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : editingEvent ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </form>
      </CmsModal>
    </div>
  );
}
