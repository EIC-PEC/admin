# E-Summit 2026 — Operations & Command Center

[![Next.js](https://img.shields.io/badge/Next.js-16.3.5_(Turbopack)-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![NextAuth](https://img.shields.io/badge/NextAuth.js-5.0_Beta-purple?style=for-the-badge&logo=auth0&logoColor=white)](https://authjs.dev/)

> Real-time operations, gate check-in, headless CMS, and telemetry command center for PEC E-Summit 2026.  
> Runs on port `3001` alongside the public experience portal (`3000`) and backend API (`4000`).

---

## Capabilities & Feature Modules

### 1. WebRTC Gate Scanner & Check-In (`/`)
- In-browser camera scanning powered by `html5-qrcode`.
- Instant cryptographic HMAC verification via backend API (`POST /api/v1/checkin/verify-qr`).
- Anti-replay duplicate ticket prevention with visual & audio feedback.
- Manual attendee search by name, email, or `PEC-XXXXXX` pass ID.

### 2. Attendee & Delegate Management (`/attendees`, `/delegates`)
- Paginated datatable with live debounced search and tier filters.
- Real-time attendance counters (Checked In vs Total Issued).
- CSV export for on-ground registration desk logistics.

### 3. Headless Festival CMS (`/cms`)
- **Events & Schedule**: Day 1 & Day 2 timeline items, track assignments, and venues.
- **Speakers**: Keynote guests, bios, photos, social links, and session assignments.
- **Sponsors**: Tier classification (Title, Gold, Silver, Media) and partner links.
- **Alumni**: Wall of fame profiles with PEC graduation years and company tags.

### 4. Platform Config & Feature Flags (`/config`)
- **Emergency Maintenance Mode**: Instantly halts public mutations while preserving read access.
- **Pass Sales Switch**: Toggle active registration tiers in real-time.
- **Announcement Banner**: Broadcast live alerts across all public pages without redeployment.

### 5. Telemetry, Charts & Audit Logs (`/audit`, `/`)
- **Live Analytics**: Revenue velocity, pass distribution breakdown, and gate check-in pace via `Recharts`.
- **System Audit Trail**: Immutable timeline of organizer logins, pass validations, and configuration updates.

---

## Tech Stack

- **Framework**: Next.js 16.3.5 (App Router, Turbopack enabled)
- **Runtime & UI**: React 19.2.8 & React DOM 19.2.8
- **Styling**: Tailwind CSS v4 with `@tailwindcss/postcss`
- **Authentication**: NextAuth.js v5.0.0-beta.32 (JWT strategy)
- **Scanning**: `html5-qrcode` (WebRTC camera stream integration)
- **Data Visualization**: Recharts 3
- **Icons & Notifications**: Lucide React & Sonner toasts

---

## Getting Started

### 1. Prerequisites
- **Node.js**: `v20.x` LTS recommended
- **Backend API**: Running on `http://localhost:4000` (or configured API endpoint)

### 2. Setup & Execution

```bash
# 1. Navigate to directory
cd admin

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local

# 4. Start development server on port 3001
npm run dev

# 5. Build for production
npm run build
npm run start
```

### 3. Environment Variables (`.env.local`)

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `AUTH_SECRET` | NextAuth secret encryption key (min 32 chars) | `openssl rand -hex 32` |
| `NEXT_PUBLIC_API_BASE_URL` | Base URL to the NestJS production API | `http://localhost:4000/api/v1` |

---

## Role-Based Access Control (RBAC)

The Admin Command Center integrates with the backend JWT role hierarchy:

- **`SUPER_ADMIN`**: Full permissions, system config switches, audit logs, and CMS.
- **`ORGANIZER`**: Schedule management, attendee lists, speaker and sponsor CRUD.
- **`VOLUNTEER_CHECKIN`**: Restricted to gate scanning and manual attendee lookup.
- **`INVESTOR`**: Restricted to jury pitch evaluation and startup team scoring rubrics.

---

## Verification & CI

Admin runs standalone GitHub Actions CI (`.github/workflows/ci.yml`) on every pull request and push:

```bash
# Run linting (ESLint 9)
npm run lint

# Production build with Turbopack
npm run build
```
