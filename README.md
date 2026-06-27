# CivicMind AI

An AI-powered civic grievance reporting platform for Indian municipalities. Citizens report issues, a 5-agent AI pipeline analyzes them, and officers/admins manage resolution.

## Tech Stack

- **Frontend:** Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Next.js API Routes + Supabase (PostgreSQL + Auth + Storage)
- **AI:** Google Gemini (Vision, Severity, Repair Planning agents)
- **Maps:** MapLibre GL + Google Maps Geocoding API
- **PWA:** next-pwa with offline queue

## Setup

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd civicmind-ai
pnpm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in the required keys:

```bash
cp .env.example .env.local
```

Required keys:
| Key | Where to get |
|-----|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Pre-filled (civicmind-ai project) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Pre-filled (civicmind-ai project) |
| `SUPABASE_SERVICE_ROLE_KEY` | [Supabase Dashboard → Settings → API](https://supabase.com/dashboard/project/bhydeeblhdnxlfkimkzq/settings/api) |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `GOOGLE_MAPS_API_KEY` | [Google Cloud Console](https://console.cloud.google.com/) (optional) |

### 3. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Database

Already set up on Supabase project `civicmind-ai` (`bhydeeblhdnxlfkimkzq`).

Tables: `profiles`, `wards`, `departments`, `admins`, `officers`, `complaints`, `complaint_updates`, `complaint_verifications`, `notifications`, `work_orders`

Storage bucket: `complaint-images` (public, 5MB limit)

## User Roles

| Role | Access |
|------|--------|
| **Citizen** | Register, report issues, track complaints, upvote |
| **Officer** | View ward complaints, update status, manage work orders |
| **Admin** | Approve/reject officers, manage system (allowlist: `abhinavkumarkeshri27@gmail.com`, `abhinavkrk888@gmail.com`) |

## AI Agent Pipeline

```
Photo + Location
      ↓
Step 1+2 (parallel): visionAgent + geoAgent
      ↓
Step 3: duplicateAgent  → blocks re-submission within 100m / 24hrs
      ↓
Step 4: severityAgent   → critical / high / medium / low
      ↓
Step 5: repairPlanningAgent → department + steps + INR cost estimate
```

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Set these environment variables in Vercel dashboard before deploying:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `GOOGLE_MAPS_API_KEY` (optional)
