'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface AttendeeFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  handleSearchSubmit: (e: React.FormEvent) => void;
  passFilter: string;
  setPassFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
}

export const AttendeeFilters: React.FC<AttendeeFiltersProps> = ({
  search,
  setSearch,
  handleSearchSubmit,
  passFilter,
  setPassFilter,
  statusFilter,
  setStatusFilter,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center gap-2.5">
      <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-(--text-muted)" />
        <input
          type="text"
          placeholder="Search by attendee name, email, or pass ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-(--border-panel) bg-(--bg-panel-alt) py-2 pl-9 pr-3 text-xs text-(--text-primary) placeholder:text-(--text-muted) focus:border-emerald-500/50 focus:outline-none"
        />
      </form>

      <div className="flex items-center gap-2 w-full md:w-auto">
        {/* Pass Type Filter */}
        <select
          value={passFilter}
          onChange={(e) => setPassFilter(e.target.value)}
          className="rounded-lg border border-(--border-panel) bg-(--bg-panel-alt) py-2 px-3 text-xs text-(--text-primary) focus:border-emerald-500/50 focus:outline-none cursor-pointer"
        >
          <option value="ALL">All Pass Tiers</option>
          <option value="STUDENT_GENERAL">Student General</option>
          <option value="FOUNDER_PITCH">Founder Pitch</option>
          <option value="HACKATHON_BUILDER">Hackathon Builder</option>
          <option value="CAMPUS_AMBASSADOR">Campus Ambassador</option>
        </select>

        {/* Check-In Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-(--border-panel) bg-(--bg-panel-alt) py-2 px-3 text-xs text-(--text-primary) focus:border-emerald-500/50 focus:outline-none cursor-pointer"
        >
          <option value="ALL">All Gate Statuses</option>
          <option value="CHECKED_IN">Checked In</option>
          <option value="NOT_CHECKED_IN">Pending Entry</option>
        </select>
      </div>
    </div>
  );
};
