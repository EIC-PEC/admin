'use client';

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Pencil, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Tag, 
  Sparkles 
} from 'lucide-react';
import { CmsModal } from './CmsModal';
import { FaqItem, FaqInput } from '../../lib/types';
import { api, ApiError } from '../../lib/api';

const INPUT_CLS =
  'w-full rounded-xl border border-(--border-panel) bg-(--bg-panel-alt) p-2.5 text-xs text-(--text-primary) focus:border-emerald-500/50 focus:outline-none transition-colors';

const PRESET_CATEGORIES = [
  'General',
  'Passes & Registration',
  'Hackathon & Builders',
  'Founder Pitch',
  'Competitions',
  'Accommodation & Travel',
];

interface Props {
  faqs: FaqItem[];
  onFaqsChange: (faqs: FaqItem[]) => void;
}

export function FaqsManager({ faqs, onFaqsChange }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<FaqInput>({
    question: '',
    answer: '',
    category: 'General',
    order: 0,
  });

  const categories = useMemo(() => {
    const set = new Set<string>();
    PRESET_CATEGORIES.forEach((c) => set.add(c));
    faqs.forEach((f) => {
      if (f.category) set.add(f.category);
    });
    return ['All', ...Array.from(set)];
  }, [faqs]);

  const filteredFaqs = useMemo(() => {
    return faqs
      .filter((f) => {
        if (selectedCategory !== 'All' && f.category !== selectedCategory) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            f.question.toLowerCase().includes(q) ||
            f.answer.toLowerCase().includes(q) ||
            f.category.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [faqs, selectedCategory, searchQuery]);

  const openCreateModal = () => {
    setEditingFaq(null);
    setForm({
      question: '',
      answer: '',
      category: selectedCategory !== 'All' ? selectedCategory : 'General',
      order: faqs.length + 1,
    });
    setModalOpen(true);
  };

  const openEditModal = (faq: FaqItem) => {
    setEditingFaq(faq);
    setForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || 'General',
      order: faq.order ?? 0,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) {
      alert('Please fill out both the question and answer.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingFaq) {
        const updated = await api.updateFaq(editingFaq.id, {
          question: form.question.trim(),
          answer: form.answer.trim(),
          category: form.category?.trim() || 'General',
          order: Number(form.order) || 0,
        });
        onFaqsChange(faqs.map((f) => (f.id === editingFaq.id ? updated : f)));
      } else {
        const created = await api.createFaq({
          question: form.question.trim(),
          answer: form.answer.trim(),
          category: form.category?.trim() || 'General',
          order: Number(form.order) || faqs.length + 1,
        });
        onFaqsChange([...faqs, created]);
      }
      setModalOpen(false);
      setEditingFaq(null);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to save FAQ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      await api.deleteFaq(id);
      onFaqsChange(faqs.filter((f) => f.id !== id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to delete FAQ.');
    }
  };

  const toggleAccordion = (id: string) => {
    setExpandedFaqId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-4">
      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-(--bg-panel) p-3 rounded-2xl border border-(--border-panel)">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-(--text-muted)" />
            <input
              type="text"
              placeholder="Search questions or answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-(--border-subtle) bg-(--bg-panel-alt) text-xs text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-full py-1">
            {categories.slice(0, 5).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-(--text-secondary) hover:text-(--text-primary) bg-(--bg-panel-alt) border border-(--border-subtle)'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-xs font-bold text-slate-950 transition-colors shadow-sm shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add Question</span>
        </button>
      </div>

      {/* FAQs List */}
      {filteredFaqs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-(--border-panel) p-12 text-center bg-(--bg-panel)/50">
          <HelpCircle className="h-10 w-10 text-(--text-muted) mb-3 opacity-40" />
          <h3 className="text-sm font-semibold text-(--text-primary)">No FAQs Found</h3>
          <p className="text-xs text-(--text-muted) mt-1 max-w-sm">
            {searchQuery
              ? 'No questions matched your search query. Try clearing your filters.'
              : 'Add frequently asked questions to help attendees understand passes, schedule, rules, and logistics.'}
          </p>
          <button
            onClick={openCreateModal}
            className="mt-4 flex items-center gap-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3.5 py-1.5 text-xs font-semibold transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create First FAQ</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredFaqs.map((faq, index) => {
            const isExpanded = expandedFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className="group rounded-2xl border border-(--border-panel) bg-(--bg-panel) hover:border-(--border-panel-elevated) transition-all overflow-hidden shadow-xs"
              >
                {/* FAQ Header Row */}
                <div
                  onClick={() => toggleAccordion(faq.id)}
                  className="flex items-center justify-between p-4 cursor-pointer select-none gap-3 hover:bg-(--bg-panel-alt)/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="shrink-0 flex items-center justify-center h-6 w-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold border border-emerald-500/20">
                      {faq.order || index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-semibold font-mono tracking-wider px-2 py-0.5 rounded-md bg-(--bg-panel-alt) border border-(--border-subtle) text-emerald-600 dark:text-emerald-400">
                          {faq.category || 'General'}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-(--text-primary) truncate">
                        {faq.question}
                      </h4>
                    </div>
                  </div>

                  {/* Actions & Chevron */}
                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openEditModal(faq)}
                      className="p-1.5 rounded-lg text-(--text-secondary) hover:text-emerald-500 hover:bg-(--bg-panel-alt) transition-colors"
                      title="Edit Question"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(faq.id)}
                      className="p-1.5 rounded-lg text-(--text-secondary) hover:text-rose-500 hover:bg-(--bg-panel-alt) transition-colors"
                      title="Delete Question"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => toggleAccordion(faq.id)}
                      className="p-1.5 rounded-lg text-(--text-muted) hover:text-(--text-primary) transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Answer Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-(--border-subtle) bg-(--bg-panel-alt)/30">
                    <p className="text-xs text-(--text-secondary) whitespace-pre-line leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <CmsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingFaq ? 'Edit Frequently Asked Question' : 'Add New FAQ'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-(--text-secondary) uppercase tracking-wider mb-1.5">
              Category
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PRESET_CATEGORIES.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setForm({ ...form, category: preset })}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-all ${
                    form.category === preset
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-(--bg-panel-alt) text-(--text-muted) border border-(--border-subtle) hover:text-(--text-primary)'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="e.g. General, Passes, Hackathon..."
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className={INPUT_CLS}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-(--text-secondary) uppercase tracking-wider mb-1.5">
              Question Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Can students from other colleges participate in the Hackathon?"
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              className={INPUT_CLS}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-(--text-secondary) uppercase tracking-wider mb-1.5">
              Answer Content *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Provide a clear, helpful explanation for attendees..."
              value={form.answer}
              onChange={(e) => setForm({ ...form, answer: e.target.value })}
              className={INPUT_CLS}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-(--text-secondary) uppercase tracking-wider mb-1.5">
              Display Order / Position
            </label>
            <input
              type="number"
              min={1}
              value={form.order}
              onChange={(e) => setForm({ ...form, order: parseInt(e.target.value, 10) || 1 })}
              className={INPUT_CLS}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-(--border-subtle)">
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
              {isSubmitting ? 'Saving...' : editingFaq ? 'Save Changes' : 'Create FAQ'}
            </button>
          </div>
        </form>
      </CmsModal>
    </div>
  );
}
