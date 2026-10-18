export const CMS_INPUT_CLS =
  'w-full rounded-xl border border-(--border-panel) bg-(--bg-panel-alt) p-2.5 text-xs text-(--text-primary) focus:border-emerald-500/50 focus:outline-none transition-colors';

export const KNOWN_VENUES = [
  { venueId: 'main-auditorium', venueName: 'Main Auditorium (CCA)', building: 'CCA Building', lat: 30.765515, lng: 76.784260, tag: 'Main Stage' },
  { venueId: 'senate', venueName: 'PEC Senate Hall', building: 'PEC Senate Hall', lat: 30.7670, lng: 76.7872, tag: 'Senate Hall' },
  { venueId: 'siemens_coe', venueName: 'Siemens Center of Excellence', building: 'Siemens Center of Excellence', lat: 30.7682, lng: 76.7890, tag: 'Hacker Lab' },
  { venueId: 'expo-hall', venueName: 'Expo Hall (SPIC Centre)', building: 'SPIC Centre', lat: 30.765833, lng: 76.785850, tag: 'Expo Grounds' },
  { venueId: 'main-gate', venueName: 'Main Gate (Gate 1)', building: 'Campus Entrance - Gate 1', lat: 30.763153, lng: 76.783675, tag: 'Entry Gate' },
  { venueId: 'student-center', venueName: 'Student Center (PEC Market)', building: 'PEC Market Area', lat: 30.766326, lng: 76.783485, tag: 'Student Center' },
  { venueId: 'oat', venueName: 'PEC Open Air Theatre', building: 'Open Air Theatre', lat: 30.7662, lng: 76.7875, tag: 'OAT Arena' },
] as const;

export const TAG_BADGE_MAP: Record<string, 'mint' | 'blue' | 'coral' | 'gold' | 'muted'> = {
  'Main Stage': 'mint',
  'Hacker Lab': 'blue',
  'Senate Hall': 'coral',
  'Expo Grounds': 'gold',
  'Entry Gate': 'muted',
  'Student Center': 'gold',
  'OAT Arena': 'mint',
};
