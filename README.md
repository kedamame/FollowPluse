# FollowPulse

Farcaster user ranking & follow monitoring dashboard.
Track the top 50 users by follower count and monitor follow/unfollow events in real time.

## Features

- Farcaster user rankings (followers, 24h growth, 6h growth)
- Follow/unfollow event tracking with diff detection
- User detail drawer with follower history
- Follow/unfollow actions via Neynar Managed Signer
- Notification settings (threshold-based)
- Farcaster Mini App support
- Multilingual (Japanese / English)
- 7-day data retention with automatic cleanup

## Tech Stack

- **Frontend/Backend**: Next.js 16 (App Router) + TypeScript
- **UI**: Tailwind CSS v4
- **Database**: Supabase Postgres (Free tier)
- **Data API**: Neynar (Free tier)
- **Auth**: Sign in with Farcaster (SIWF) + Neynar Managed Signer
- **i18n**: next-intl (ja/en)
- **Hosting**: Vercel
- **Cron**: GitHub Actions (every 6 hours)

## Setup

### 1. Clone & Install

```bash
git clone https://github.com/kedamame/FollowPluse.git
cd FollowPluse
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Open the SQL Editor
3. Copy and paste the contents of `supabase/schema.sql` and execute it
4. Go to Settings > API to get your project URL and keys

### 3. Create Neynar Account

1. Go to [neynar.com](https://neynar.com) and create an account
2. Create an app to get your API key
3. Note your Client ID for SIWF (optional, for follow/unfollow features)

### 4. Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `NEYNAR_API_KEY` | Neynar API key |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (client-side) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (client-side) |
| `CRON_SECRET` | Secret for cron job authentication |
| `NEXT_PUBLIC_APP_URL` | Your app URL |
| `NEXT_PUBLIC_NEYNAR_CLIENT_ID` | Neynar Client ID (for SIWF) |

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Manual Job Execution

Trigger data ingestion manually:

```bash
curl "http://localhost:3000/api/jobs/ingest?secret=YOUR_CRON_SECRET"
```

Trigger retention cleanup:

```bash
curl "http://localhost:3000/api/jobs/retention?secret=YOUR_CRON_SECRET"
```

## Deploy to Vercel

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Set environment variables in Vercel dashboard
4. Deploy

## GitHub Actions Cron Setup

Add these secrets to your GitHub repository (Settings > Secrets):

| Secret | Value |
|--------|-------|
| `APP_URL` | Your Vercel deployment URL (e.g., `https://followpulse.vercel.app`) |
| `CRON_SECRET` | Same value as your `CRON_SECRET` env var |

The workflow runs automatically every 6 hours and triggers:
- Data ingestion (top 50 users + follower tracking)
- Daily data retention cleanup (7-day window)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rankings` | Rankings with pagination |
| GET | `/api/users/:fid/activity` | User detail + events |
| GET | `/api/follow-events` | Follow/unfollow event log |
| POST | `/api/social/follow` | Follow a user |
| POST | `/api/social/unfollow` | Unfollow a user |
| POST | `/api/notifications/subscribe` | Update notification settings |
| GET | `/api/jobs/ingest?secret=` | Trigger data ingestion |
| GET | `/api/jobs/retention?secret=` | Trigger data cleanup |

## Testing

```bash
npm test          # Run tests once
npm run test:watch # Watch mode
npm run typecheck  # TypeScript check
npm run lint       # ESLint
```

## Architecture

See [docs/architecture.md](docs/architecture.md) for system design and data flow.

## Limitations

See [docs/limitations.md](docs/limitations.md) for free tier constraints and known limitations.

## Project Structure

```
src/
├── app/
│   ├── [locale]/         # i18n pages (ja/en)
│   ├── api/              # API routes
│   │   ├── jobs/         # Cron job endpoints
│   │   ├── rankings/     # Rankings API
│   │   ├── users/        # User activity API
│   │   ├── follow-events/# Follow events API
│   │   ├── social/       # Follow/unfollow API
│   │   ├── notifications/# Notification settings API
│   │   ├── auth/         # SIWF callback
│   │   └── webhook/      # Mini App webhook
│   └── .well-known/      # Farcaster manifest
├── components/           # React components
├── lib/
│   ├── providers/        # Data provider abstraction
│   ├── supabase/         # Supabase clients
│   ├── jobs/             # Job logic
│   ├── auth/             # Auth context
│   └── utils/            # Utilities
├── messages/             # i18n translations
└── i18n/                 # i18n config
```
