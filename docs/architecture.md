# FollowPulse Architecture

## Overview

FollowPulse is a Farcaster user ranking & follow monitoring dashboard.
It tracks the top 50 users by follower count and records follow/unfollow events over time.

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Clients                          │
│  ┌──────────────┐  ┌───────────────────────────┐    │
│  │ Web Browser  │  │ Warpcast (Mini App)       │    │
│  └──────┬───────┘  └────────────┬──────────────┘    │
└─────────┼───────────────────────┼───────────────────┘
          │                       │
          ▼                       ▼
┌─────────────────────────────────────────────────────┐
│              Vercel (Next.js App Router)             │
│                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  Pages/UI   │  │  API Routes  │  │  Jobs API  │ │
│  │  (SSR/CSR)  │  │  /api/*      │  │  /api/jobs │ │
│  └─────────────┘  └──────┬───────┘  └─────┬──────┘ │
│                          │                │        │
│  ┌───────────────────────┴────────────────┘        │
│  │         lib/providers/ (abstraction)             │
│  │  ┌──────────────┐  ┌─────────────────────┐      │
│  │  │   Neynar     │  │  Snapchain (future) │      │
│  │  │   Provider   │  │  Provider           │      │
│  │  └──────────────┘  └─────────────────────┘      │
│  └─────────────────────────────────────────────────│
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│              Supabase (Postgres)                    │
│                                                     │
│  tracked_users │ follow_edges_current               │
│  follow_events │ user_metrics_hourly                │
│  rankings_hourly │ notification_subscriptions       │
│  job_runs                                           │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│          GitHub Actions (Cron Trigger)               │
│  Every 6 hours → POST /api/jobs/ingest              │
│  Daily         → POST /api/jobs/retention           │
└─────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Ingestion (every 6 hours)
1. GitHub Actions triggers `POST /api/jobs/ingest?secret=CRON_SECRET`
2. Job fetches top 50 users by follower count from Neynar
3. For each user, fetches most recent 100 followers
4. Compares with previous snapshot in `follow_edges_current`
5. Generates `follow_events` for new follows / unfollows
6. Updates `user_metrics_hourly` with current counts
7. Computes `rankings_hourly` by various metrics
8. Logs run in `job_runs`

### 2. Retention (daily)
1. GitHub Actions triggers `POST /api/jobs/retention?secret=CRON_SECRET`
2. Deletes records older than 7 days from:
   - `follow_events`
   - `user_metrics_hourly`
   - `rankings_hourly`
   - `job_runs`

### 3. User Interactions
- View rankings: `GET /api/rankings` → query `rankings_hourly`
- View user activity: `GET /api/users/:fid/activity` → query `follow_events` + `user_metrics_hourly`
- Follow/Unfollow: `POST /api/social/follow` → Neynar Managed Signer
- Notifications: `POST /api/notifications/subscribe` → `notification_subscriptions`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js (App Router) + React 19 |
| Styling | Tailwind CSS v4 |
| Language | TypeScript |
| Database | Supabase Postgres (Free tier) |
| Data API | Neynar (Free tier, ~300 req/day) |
| Auth | Sign in with Farcaster (SIWF) + Neynar Managed Signer |
| i18n | next-intl (ja/en) |
| Hosting | Vercel (Free tier) |
| Cron | GitHub Actions |

## API Budget (Neynar Free: ~300 req/day)

| Operation | Requests/run | ×4 runs/day | Total |
|-----------|-------------|-------------|-------|
| Bulk user lookup (top 50) | 1 | 4 | 4 |
| Followers per user (50 users) | 50 | 4 | 200 |
| **Total** | **51** | | **~204** |

Remaining budget: ~96 requests/day for user-initiated actions (follow/unfollow, search).

## Directory Structure

```
src/
├── app/
│   ├── [locale]/          # i18n routes
│   │   ├── page.tsx       # Rankings page
│   │   └── layout.tsx     # Locale layout
│   ├── api/
│   │   ├── rankings/      # GET rankings
│   │   ├── users/         # GET user activity
│   │   ├── follow-events/ # GET follow events
│   │   ├── social/        # POST follow/unfollow
│   │   ├── notifications/ # POST subscribe
│   │   └── jobs/          # Cron job endpoints
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Redirect to locale
├── components/            # React components
├── lib/
│   ├── providers/         # Data provider abstraction
│   │   ├── types.ts       # Provider interface
│   │   ├── neynar.ts      # Neynar implementation
│   │   └── index.ts       # Factory/export
│   ├── supabase/          # Supabase client
│   ├── jobs/              # Job logic
│   └── utils/             # Shared utilities
├── messages/              # i18n translation files
│   ├── ja.json
│   └── en.json
└── middleware.ts           # i18n middleware
```
