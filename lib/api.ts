import {
  AnalyticsData,
  CampusAmbassador,
  CheckInConflictInfo,
  CheckInLog,
  CheckInSuccessResult,
  CompetitionType,
  EventInput,
  EventItem,
  HealthStatus,
  ManualLookupMatch,
  Registration,
  SpeakerInput,
  SpeakerItem,
  SponsorInput,
  SponsorItem,
  Team,
  SiteConfig,
  SiteConfigInput,
} from './types';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api/v1';

export class ApiError extends Error {
  status?: number;
  body?: unknown;

  constructor(message: string, status?: number, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

export type VerifyQrResponse =
  | { outcome: 'SUCCESS'; result: CheckInSuccessResult }
  | { outcome: 'DUPLICATE'; conflict: CheckInConflictInfo }
  | { outcome: 'INVALID'; message: string };

export type ManualLookupResponse =
  | { outcome: 'CHECKED_IN'; result: Registration }
  | { outcome: 'ALREADY_CHECKED_IN'; message: string }
  | { outcome: 'MATCHES'; matches: ManualLookupMatch[] }
  | { outcome: 'NOT_FOUND'; message: string };

async function parseBody(res: Response): Promise<unknown> {
  return res.json().catch(() => null);
}

function extractMessage(body: unknown, fallback: string): string {
  if (!body) return fallback;
  if (typeof body === 'string') return body;
  if (typeof body === 'object') {
    const rec = body as Record<string, unknown>;
    if (typeof rec.message === 'string') return rec.message;
    if (Array.isArray(rec.message) && rec.message.length > 0) {
      return rec.message.map((m) => String(m)).join(', ');
    }
    if (typeof rec.error === 'string') return rec.error;
  }
  return fallback;
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

class ApiClient {
  private token: string | null = null;
  private isRefreshing = false;
  private memoryCache = new Map<string, CacheItem<unknown>>();

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = sessionStorage.getItem('esummit_admin_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        sessionStorage.setItem('esummit_admin_token', token);
      } else {
        sessionStorage.removeItem('esummit_admin_token');
      }
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = sessionStorage.getItem('esummit_admin_token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    this.invalidateCache();
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('esummit_admin_token');
    }
  }

  /** Invalidate in-memory cached responses matching a prefix or all */
  invalidateCache(prefix?: string) {
    if (!prefix) {
      this.memoryCache.clear();
      return;
    }
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(prefix)) {
        this.memoryCache.delete(key);
      }
    }
  }

  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  /** Low-level fetch wrapper: throws ApiError on network failure or non-2xx. */
  private async request<T>(
    path: string,
    init?: RequestInit,
    isRetry = false,
  ): Promise<T> {
    let res: Response;
    try {
      res = await fetch(`${API_BASE}${path}`, {
        credentials: 'include',
        ...init,
        headers: { ...this.getHeaders(), ...(init?.headers || {}) },
      });
    } catch {
      throw new ApiError(
        'Could not reach the E-Summit backend. Check that the API server is running.',
      );
    }

    if (res.status === 401 && !isRetry && !path.startsWith('/auth/')) {
      const refreshed = await this.refreshSession();
      if (refreshed) {
        return this.request<T>(path, init, true);
      }
    }

    if (!res.ok) {
      const body = await parseBody(res);
      throw new ApiError(
        extractMessage(body, `Request failed with HTTP ${res.status}`),
        res.status,
        body,
      );
    }

    if (res.status === 204) {
      return undefined as T;
    }

    return (await res.json()) as T;
  }

  /** Cached GET helper with in-memory TTL to avoid duplicate database calls on rapid navigation */
  private async cachedGet<T>(path: string, ttlMs = 20000): Promise<T> {
    const cached = this.memoryCache.get(path) as CacheItem<T> | undefined;
    const now = Date.now();

    if (cached && now - cached.timestamp < cached.ttlMs) {
      return cached.data;
    }

    const freshData = await this.request<T>(path);
    this.memoryCache.set(path, { data: freshData, timestamp: now, ttlMs });
    return freshData;
  }

  // ── Auth ──
  async login(
    email: string,
    password: string,
  ): Promise<{ user: import('./types').User; accessToken: string }> {
    const res = await this.request<{ user: import('./types').User; accessToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(res.accessToken);
    this.invalidateCache();
    return res;
  }

  async refreshSession(): Promise<boolean> {
    if (this.isRefreshing) return false;
    this.isRefreshing = true;
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.accessToken) {
          this.setToken(data.accessToken);
          return true;
        }
      }
    } catch {
      // Refresh failed
    } finally {
      this.isRefreshing = false;
    }
    return false;
  }

  async logout(): Promise<void> {
    try {
      await this.request<void>('/auth/logout', { method: 'POST' });
    } finally {
      this.clearToken();
    }
  }

  async getMe(): Promise<{ user: import('./types').User; passes?: Registration[] }> {
    return this.request<{ user: import('./types').User; passes?: Registration[] }>('/auth/me');
  }

  // ── Health ──
  async getHealth(): Promise<HealthStatus> {
    return this.request<HealthStatus>('/health');
  }

  // ── Analytics ──
  async getAnalytics(): Promise<AnalyticsData> {
    return this.cachedGet<AnalyticsData>('/admin/analytics', 15000);
  }

  // ── Delegates ──
  async getDelegates(params?: {
    page?: number;
    limit?: number;
    search?: string;
    passType?: string;
    isCheckedIn?: boolean;
  }): Promise<{ items: Registration[]; total: number; totalPages: number }> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.search) query.set('search', params.search);
    if (params?.passType) query.set('passType', params.passType);
    if (params?.isCheckedIn !== undefined)
      query.set('isCheckedIn', params.isCheckedIn.toString());

    return this.request(`/admin/delegates?${query.toString()}`);
  }

  async toggleCheckInOverride(
    registrationId: string,
  ): Promise<{ success: boolean; isCheckedIn: boolean }> {
    const data = await this.request<{ isCheckedIn: boolean }>(
      `/admin/delegates/${registrationId}/override`,
      { method: 'PATCH' },
    );
    this.invalidateCache('/admin/analytics');
    return { success: true, isCheckedIn: data.isCheckedIn };
  }

  async exportAllDelegates(): Promise<Array<{
    id: string;
    passId: string;
    passType: string;
    amountPaid: number;
    isCheckedIn: boolean;
    name: string;
    email: string;
    phone: string;
    college: string;
    paymentStatus: string;
    createdAt: string;
  }>> {
    return this.request('/admin/delegates/export');
  }

  async resendPassEmail(registrationId: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(
      `/admin/delegates/${registrationId}/resend-pass`,
      { method: 'POST' },
    );
  }

  // ── Audit & Security Logs ──
  async getAuditLogs(params?: {
    page?: number;
    limit?: number;
    search?: string;
    action?: string;
    entity?: string;
  }): Promise<{ items: import('./types').AuditLogItem[]; total: number; totalPages: number }> {
    try {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', params.page.toString());
      if (params?.limit) query.set('limit', params.limit.toString());
      if (params?.search) query.set('search', params.search);
      if (params?.action && params.action !== 'ALL') query.set('action', params.action);
      if (params?.entity && params.entity !== 'ALL') query.set('entity', params.entity);
      const qs = query.toString();
      return await this.request<{ items: import('./types').AuditLogItem[]; total: number; totalPages: number }>(
        `/admin/audit-logs${qs ? `?${qs}` : ''}`
      );
    } catch (err: any) {
      if (err?.status === 404) {
        return { items: [], total: 0, totalPages: 1 };
      }
      throw err;
    }
  }

  // ── QR Scanner & Manual Lookup ──
  async verifyQr(qrToken: string, gateName = 'MAIN_GATE'): Promise<VerifyQrResponse> {
    try {
      const result = await this.request<CheckInSuccessResult>('/checkin/verify-qr', {
        method: 'POST',
        body: JSON.stringify({ qrToken, gateName }),
      });
      this.invalidateCache('/admin/analytics');
      return { outcome: 'SUCCESS', result };
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        return { outcome: 'DUPLICATE', conflict: err.body as CheckInConflictInfo };
      }
      const message = err instanceof ApiError ? err.message : 'Verification failed.';
      return { outcome: 'INVALID', message };
    }
  }

  async manualLookupSearch(query: string, gateName = 'MAIN_GATE'): Promise<ManualLookupResponse> {
    try {
      const data = await this.request<{ count: number; results: ManualLookupMatch[] }>(
        '/checkin/manual-lookup',
        { method: 'POST', body: JSON.stringify({ query, gateName, performCheckIn: false }) },
      );
      return { outcome: 'MATCHES', matches: data.results };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Lookup failed.';
      return { outcome: 'NOT_FOUND', message };
    }
  }

  async manualCheckIn(passId: string, gateName = 'MAIN_GATE'): Promise<ManualLookupResponse> {
    try {
      const data = await this.request<{ status: string; attendee: Registration }>(
        '/checkin/manual-lookup',
        { method: 'POST', body: JSON.stringify({ query: passId, gateName, performCheckIn: true }) },
      );
      this.invalidateCache('/admin/analytics');
      return { outcome: 'CHECKED_IN', result: data.attendee };
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        return { outcome: 'ALREADY_CHECKED_IN', message: err.message };
      }
      const message = err instanceof ApiError ? err.message : 'Check-in failed.';
      return { outcome: 'NOT_FOUND', message };
    }
  }

  async manualLookup(query: string, gateName = 'MAIN_GATE', performCheckIn = false): Promise<ManualLookupResponse> {
    if (performCheckIn) {
      return this.manualCheckIn(query, gateName);
    }
    return this.manualLookupSearch(query, gateName);
  }

  async getCheckInStats(): Promise<import('./types').CheckInStatsResponse> {
    return this.request<import('./types').CheckInStatsResponse>('/checkin/stats');
  }

  // ── CA Leaderboard ──
  async getCaLeaderboard(): Promise<CampusAmbassador[]> {
    return this.cachedGet<CampusAmbassador[]>('/admin/ca-leaderboard', 30000);
  }

  // ── Teams & Jury Scoring ──
  async getTeams(type?: CompetitionType): Promise<Team[]> {
    return this.cachedGet<Team[]>(
      `/teams/leaderboard/${type || 'PITCH_COMPETITION'}`,
      20000,
    );
  }

  async getTeamById(teamId: string): Promise<Team> {
    return this.request<Team>(`/teams/${teamId}`);
  }

  async scoreTeam(
    teamId: string,
    scores: {
      innovation: number;
      execution: number;
      marketSize: number;
      presentation: number;
      comments?: string;
    },
  ): Promise<{ success: boolean; team?: Team }> {
    const team = await this.request<Team>(`/teams/${teamId}/score`, {
      method: 'POST',
      body: JSON.stringify(scores),
    });
    this.invalidateCache('/teams/leaderboard');
    return { success: true, team };
  }

  // ── CMS: Events ──
  async getEvents(params?: {
    day?: 1 | 2;
    track?: string;
    type?: string;
  }): Promise<EventItem[]> {
    const query = new URLSearchParams();
    if (params?.day) query.set('day', params.day.toString());
    if (params?.track) query.set('track', params.track);
    if (params?.type) query.set('type', params.type);
    const qs = query.toString();
    return this.cachedGet<EventItem[]>(`/events${qs ? `?${qs}` : ''}`, 30000);
  }

  async createEvent(input: EventInput): Promise<EventItem> {
    const res = await this.request<EventItem>('/events', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    this.invalidateCache('/events');
    this.invalidateCache('/cms/bundle');
    return res;
  }

  async updateEvent(id: string, input: Partial<EventInput>): Promise<EventItem> {
    const res = await this.request<EventItem>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
    this.invalidateCache('/events');
    this.invalidateCache('/cms/bundle');
    return res;
  }

  async deleteEvent(id: string): Promise<void> {
    await this.request<void>(`/events/${id}`, { method: 'DELETE' });
    this.invalidateCache('/events');
    this.invalidateCache('/cms/bundle');
  }

  // ── CMS: Speakers ──
  async getSpeakers(): Promise<SpeakerItem[]> {
    return this.cachedGet<SpeakerItem[]>('/speakers', 30000);
  }

  async createSpeaker(input: SpeakerInput): Promise<SpeakerItem> {
    const res = await this.request<SpeakerItem>('/speakers', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    this.invalidateCache('/speakers');
    this.invalidateCache('/cms/bundle');
    return res;
  }

  async updateSpeaker(
    id: string,
    input: Partial<SpeakerInput>,
  ): Promise<SpeakerItem> {
    const res = await this.request<SpeakerItem>(`/speakers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
    this.invalidateCache('/speakers');
    this.invalidateCache('/cms/bundle');
    return res;
  }

  async deleteSpeaker(id: string): Promise<void> {
    await this.request<void>(`/speakers/${id}`, { method: 'DELETE' });
    this.invalidateCache('/speakers');
    this.invalidateCache('/cms/bundle');
  }

  // ── CMS: Sponsors ──
  async getSponsors(): Promise<SponsorItem[]> {
    return this.cachedGet<SponsorItem[]>('/sponsors', 30000);
  }

  async createSponsor(input: SponsorInput): Promise<SponsorItem> {
    const res = await this.request<SponsorItem>('/sponsors', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    this.invalidateCache('/sponsors');
    this.invalidateCache('/cms/bundle');
    return res;
  }

  async updateSponsor(id: string, input: Partial<SponsorInput>): Promise<SponsorItem> {
    const res = await this.request<SponsorItem>(`/sponsors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
    this.invalidateCache('/sponsors');
    this.invalidateCache('/cms/bundle');
    return res;
  }

  async deleteSponsor(id: string): Promise<void> {
    await this.request<void>(`/sponsors/${id}`, { method: 'DELETE' });
    this.invalidateCache('/sponsors');
    this.invalidateCache('/cms/bundle');
  }

  // ── CMS: Subscribers ──
  async getSubscribers(): Promise<import('./types').SubscriberItem[]> {
    try {
      return await this.cachedGet<import('./types').SubscriberItem[]>('/subscribers', 30000);
    } catch (err: any) {
      if (err?.status === 404) {
        return [];
      }
      throw err;
    }
  }

  async deleteSubscriber(id: string): Promise<void> {
    await this.request<void>(`/subscribers/${id}`, { method: 'DELETE' });
    this.invalidateCache('/subscribers');
  }

  // ── CMS: FAQs ──
  async getFaqs(category?: string): Promise<import('./types').FaqItem[]> {
    const qs = category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : '';
    return this.cachedGet<import('./types').FaqItem[]>(`/cms/faqs${qs}`, 30000);
  }

  async createFaq(input: import('./types').FaqInput): Promise<import('./types').FaqItem> {
    const res = await this.request<import('./types').FaqItem>('/cms/faqs', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    this.invalidateCache('/cms/faqs');
    this.invalidateCache('/cms/bundle');
    return res;
  }

  async updateFaq(id: string, input: Partial<import('./types').FaqInput>): Promise<import('./types').FaqItem> {
    const res = await this.request<import('./types').FaqItem>(`/cms/faqs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
    this.invalidateCache('/cms/faqs');
    this.invalidateCache('/cms/bundle');
    return res;
  }

  async deleteFaq(id: string): Promise<void> {
    await this.request<void>(`/cms/faqs/${id}`, { method: 'DELETE' });
    this.invalidateCache('/cms/faqs');
    this.invalidateCache('/cms/bundle');
  }

  // ── CMS: Alumni ──
  async getAlumni(): Promise<import('./types').AlumniItem[]> {
    return this.cachedGet<import('./types').AlumniItem[]>('/alumni', 30000);
  }

  async createAlumni(input: import('./types').AlumniInput): Promise<import('./types').AlumniItem> {
    const res = await this.request<import('./types').AlumniItem>('/alumni', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    this.invalidateCache('/alumni');
    this.invalidateCache('/cms/bundle');
    return res;
  }

  async updateAlumni(id: string, input: Partial<import('./types').AlumniInput>): Promise<import('./types').AlumniItem> {
    const res = await this.request<import('./types').AlumniItem>(`/alumni/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
    this.invalidateCache('/alumni');
    this.invalidateCache('/cms/bundle');
    return res;
  }

  async deleteAlumni(id: string): Promise<void> {
    await this.request<void>(`/alumni/${id}`, { method: 'DELETE' });
    this.invalidateCache('/alumni');
    this.invalidateCache('/cms/bundle');
  }

  // ── CMS: Gallery ──
  async getGallery(): Promise<import('./types').GalleryItem[]> {
    return this.cachedGet<import('./types').GalleryItem[]>('/gallery', 30000);
  }

  async createGalleryItem(input: import('./types').GalleryInput): Promise<import('./types').GalleryItem> {
    const res = await this.request<import('./types').GalleryItem>('/gallery', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    this.invalidateCache('/gallery');
    this.invalidateCache('/cms/bundle');
    return res;
  }

  async deleteGalleryItem(id: string): Promise<void> {
    await this.request<void>(`/gallery/${id}`, { method: 'DELETE' });
    this.invalidateCache('/gallery');
    this.invalidateCache('/cms/bundle');
  }

  // ── CMS: Portfolio Events Media ──
  async getPortfolioMedia(): Promise<import('./types').PortfolioEventMedia[]> {
    return this.cachedGet<import('./types').PortfolioEventMedia[]>('/portfolio-events', 30000);
  }

  async setPortfolioImage(eventId: string, imageUrl: string): Promise<import('./types').PortfolioEventMedia> {
    const res = await this.request<import('./types').PortfolioEventMedia>('/portfolio-events', {
      method: 'POST',
      body: JSON.stringify({ eventId, imageUrl }),
    });
    this.invalidateCache('/portfolio-events');
    this.invalidateCache('/cms/bundle');
    return res;
  }

  async deletePortfolioImage(eventId: string): Promise<void> {
    await this.request<void>(`/portfolio-events/${eventId}`, { method: 'DELETE' });
    this.invalidateCache('/portfolio-events');
    this.invalidateCache('/cms/bundle');
  }

  // ── CMS: Schedule Items (Day 1 & Day 2 Timeline) ──
  async getScheduleItems(day?: number): Promise<import('./types').ScheduleItem[]> {
    const query = day !== undefined ? `?day=${day}` : '';
    return this.cachedGet<import('./types').ScheduleItem[]>(`/cms/schedule${query}`, 30000);
  }

  async createScheduleItem(input: import('./types').ScheduleItemInput): Promise<import('./types').ScheduleItem> {
    const res = await this.request<import('./types').ScheduleItem>('/cms/schedule', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    this.invalidateCache('/cms/schedule');
    this.invalidateCache('/cms/bundle');
    return res;
  }

  async updateScheduleItem(id: string, input: Partial<import('./types').ScheduleItemInput>): Promise<import('./types').ScheduleItem> {
    const res = await this.request<import('./types').ScheduleItem>(`/cms/schedule/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
    this.invalidateCache('/cms/schedule');
    this.invalidateCache('/cms/bundle');
    return res;
  }

  async deleteScheduleItem(id: string): Promise<void> {
    await this.request<void>(`/cms/schedule/${id}`, { method: 'DELETE' });
    this.invalidateCache('/cms/schedule');
    this.invalidateCache('/cms/bundle');
  }

  // ── CMS: Bundle ──
  async getBundle(): Promise<{
    events: import('./types').EventItem[];
    speakers: import('./types').SpeakerItem[];
    scheduleItems: import('./types').ScheduleItem[];
    sponsors: import('./types').SponsorItem[];
    alumni: import('./types').AlumniItem[];
    gallery: import('./types').GalleryItem[];
    portfolioMedia?: import('./types').PortfolioEventMedia[];
    faqs?: import('./types').FaqItem[];
  }> {
    return this.cachedGet('/cms/bundle', 30000);
  }

  // ── Global SiteConfig & Live Announcements ──
  async getSiteConfig(): Promise<SiteConfig> {
    return this.cachedGet('/cms/site-config', 30000);
  }

  async updateSiteConfig(dto: SiteConfigInput): Promise<SiteConfig> {
    const res = await this.request<SiteConfig>('/cms/site-config', {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
    this.invalidateCache('/cms/site-config');
    return res;
  }

  // ── Storage / Cloudflare R2 Upload ──
  async uploadFile(file: File, folder: string = 'media'): Promise<{ url: string; key: string; storage: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const token = this.getToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/storage/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const body = await parseBody(res);
    if (!res.ok) {
      throw new ApiError(extractMessage(body, `Upload failed with status ${res.status}`), res.status, body);
    }

    return body as { url: string; key: string; storage: string };
  }
}

export const api = new ApiClient();
export type { CheckInLog };
