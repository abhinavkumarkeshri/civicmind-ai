# CivicMind AI

AI-powered civic grievance reporting for Indian municipalities. A citizen snaps a photo of a pothole, garbage pile, broken streetlight, or water leak, and a 5-agent AI pipeline built on **Google Gemini** automatically classifies, geolocates, deduplicates, scores severity, and drafts a repair plan — routing it straight to the right department officer.

**Live app:** https://civicmind-ai-dusky.vercel.app/

---

## The Problem

Civic complaints in Indian cities mostly still travel through phone calls, paper forms, or WhatsApp forwards to local councillors. There's no structured triage, no de-duplication of the same pothole reported by twenty people, and no objective way to decide what gets fixed first. CivicMind AI turns a photo + location into a structured, prioritized work item in seconds.

## How It Works

1. A citizen reports an issue with a photo and location (camera/gallery + GPS or map pin).
2. The report is pushed through an AI orchestrator that runs five agents:

```
Photo + Location
      │
      ├── visionAgent   → identifies category (pothole, garbage, streetlight, water leak,
      │                     drain, fallen tree, road damage) and describes the issue
      ├── geoAgent       → resolves ward, ties the report to a location on the map
      │        (parallel)
      ▼
duplicateAgent   → blocks re-submission of the same issue within 100m / 24hrs
      ▼
severityAgent    → scores the issue critical / high / medium / low
      ▼
repairPlanningAgent → assigns the right department, drafts repair steps,
                       and estimates cost in INR
```

3. The complaint lands on the relevant officer's dashboard, already triaged and prioritized — no manual sorting needed.
4. The officer updates status, opens a work order, and the citizen gets notified and can verify the fix once marked resolved.

## Features

**For citizens**
- Photo + GPS-based complaint reporting with offline queueing (PWA — reports save locally and sync when back online)
- Real-time tracking of complaint status from submission to resolution
- Interactive map view (MapLibre GL) of all reported issues in the city
- Upvoting on existing complaints instead of duplicate filing
- Points and badges for civic participation (gamification)
- Verification step once an officer marks an issue resolved

**For officers**
- Ward-scoped complaint queue, pre-sorted by AI-assigned severity
- Status updates, work order creation, and department-level analytics
- Officer registration with admin approval workflow

**For admins**
- Officer approval/rejection (with a hardcoded email allowlist as a safety net)
- City-wide analytics across wards, departments, and complaint categories
- System and ward/department configuration

## Google Technologies Used

This project leans heavily on Google's stack, which is core to both the AI pipeline and the location intelligence:

- **Google Gemini 2.5 Flash** (via `@google/generative-ai`) — powers three of the five AI agents, used for both fast classification calls and deeper reasoning steps:
  - **Vision agent** — multimodal image understanding to classify the complaint category and generate a description directly from the uploaded photo
  - **Severity agent** — reasons over the image + description to assign a severity level and score
  - **Repair planning agent** — generates department routing, repair steps, and an INR cost estimate
- **Google Maps Geocoding API** — optional integration for higher-accuracy reverse geocoding (the geo agent currently uses OpenStreetMap's Nominatim by default; Google Maps key upgrades this path)

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling/UI | Tailwind CSS + shadcn/ui + Radix primitives |
| Backend | Next.js API Routes |
| Database & Auth | Supabase (PostgreSQL, Row-Level Security, Auth, Storage) |
| AI | Google Gemini 2.5 Flash (Vision, Severity, Repair Planning agents) |
| Maps | MapLibre GL + react-map-gl, OpenStreetMap (Nominatim reverse geocoding), Google Maps Geocoding API (optional) |
| PWA | next-pwa with IndexedDB-backed offline queue (`idb`) |
| Charts | Recharts (officer/admin analytics) |
| Deployment | Vercel |

## Project Structure

```
civicmind-final/
├── agents/                 # The 5 AI agents (vision, geo, duplicate, severity, repair planning)
├── orchestrator/           # Pipeline that runs the agents in sequence/parallel
├── prompts/                # Gemini prompt templates per agent
├── app/
│   ├── citizen/            # Report, track, map, dashboard
│   ├── officer/            # Officer dashboard, complaint management, analytics
│   ├── admin/               # Officer approvals, system settings, dashboard
│   ├── auth/                # Login, registration, role selection
│   └── api/                 # REST endpoints: ai/orchestrate, complaints, workorders, wards...
├── components/              # Reusable UI: complaints, map, dashboard, report flow
├── lib/
│   ├── ai/                  # Gemini model config
│   ├── supabase/            # Client/server Supabase setup
│   ├── pwa/                 # Offline queue logic
│   └── constants.ts          # Categories, severity levels, status labels
├── services/                # Supabase data access, geolocation, gamification
└── public/                  # PWA manifest, icons
```

## Database

Built on Supabase (PostgreSQL): `profiles`, `wards`, `departments`, `admins`, `officers`, `complaints`, `complaint_updates`, `complaint_verifications`, `notifications`, `work_orders`. Images are stored in a public `complaint-images` storage bucket (5MB limit per upload).

## User Roles

| Role | Access |
|---|---|
| **Citizen** | Register, report issues, track complaints, upvote, earn points/badges |
| **Officer** | View ward complaints, update status, manage work orders, view analytics (requires admin approval to activate) |
| **Admin** | Approve/reject officers, manage wards/departments, view city-wide analytics |

## Running Locally

```bash
git clone <your-repo-url>
cd civicmind-ai
pnpm install
cp .env.example .env.local   # fill in your Supabase + Gemini keys
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

| Key | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project settings |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `GOOGLE_MAPS_API_KEY` | [Google Cloud Console](https://console.cloud.google.com/) (optional, enables reverse geocoding) |

## What's Next

- SMS/IVR reporting channel for citizens without smartphones
- Predictive maintenance — flagging wards likely to need attention based on historical complaint density
- Multi-language support for regional languages