# The Lab 33 — Website

The public website and admin panel for **The Lab 33**, a premium recovery and biohacking facility in Porto Arabia, Qatar. The public site presents the facility and its recovery modalities and captures waitlist signups and job applications; the admin panel (Supabase-authenticated) manages waitlist subscribers, job applications, contact messages, transactional email, and site settings.

## Tech stack

- **Framework:** Next.js 16 (App Router, Turbopack) with React 19 and TypeScript
- **Styling:** Tailwind CSS v4
- **Animation:** Framer Motion
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions)
- **Email:** Resend
- **Charts / exports:** Recharts, jsPDF, xlsx
- **Hosting:** Vercel

## Prerequisites

- Node.js 20.9+ and npm
- A Supabase project (URL + anon key)

## Getting started

```bash
git clone <repo-url>
cd "Lab 33 (website)"
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL (Project Settings → API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key (Project Settings → API) |

`.env.local` is git-ignored and must never be committed. Other service credentials (e.g. the Resend API key) are stored in the database (`site_settings`) and managed from the admin panel, not via environment variables.

## NPM scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the local dev server (Turbopack) on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Project structure

```
src/
  app/                      # Next.js App Router
    (home)/                 # Landing page
    about/ contact/ waitlist/ hiring/ privacy/ terms/
    cold-plunge/ hbot/ hot-tub/ normatec/ red-light-sauna/ guided-stretch/   # Modality pages
    admin/
      (public)/login/       # Admin login (unauthenticated)
      (authenticated)/      # Dashboard, waitlist, applications, contact, email, users, settings, logs
    api/                    # Route handlers (admin APIs, send-* email endpoints)
    layout.tsx  globals.css
  components/
    admin/                  # Admin panel UI (pages/, shared/)
    home/ waitlist/ hiring/ forms/ shared/ seo/ providers/
  hooks/                    # Shared React hooks
  lib/                      # Supabase clients, permissions, rate limiting, utilities
public/                     # Static assets (pre-compressed .webp images, icons)
next.config.ts              # Next config + security headers (CSP)
vercel.json                 # Vercel project config
```

## Admin panel

- Reachable at `/admin` (redirects to `/admin/login` when signed out).
- Authentication is handled by **Supabase Auth**; middleware (`src/middleware.ts`) protects all `/admin` routes except the login page.
- Access is role-based. Roles — `admin`, `manager`, `owner`, `viewer` — and their per-resource permissions are defined in [`src/lib/permissions.ts`](src/lib/permissions.ts).
- Admin users live in the `admin_users` table. Create/invite or remove users via the Supabase dashboard or the `invite-user` / `delete-user` edge functions.

## Supabase

- **Core tables:** `waitlist`, `job_applications`, `positions`, `admin_users`, `site_settings`, `email_logs`, `email_templates`, `email_automations`, `admin_notifications`, `admin_activity_logs`, `system_logs`, `contact_messages`.
- **Edge functions:** `invite-user`, `delete-user`, `reset-password` (admin user management).
- Row Level Security is enabled on all tables. Schema, policies, and triggers are managed in the hosted Supabase project (there are no local migration files in this repo).

## Key architecture notes (do not reverse)

- **`images.unoptimized: true`** in `next.config.ts`. The site runs on Vercel's Hobby tier, which caps Image Optimization; hero images are pre-compressed `.webp` files served as-is. Do not route them through `next/image` optimization.
- **Content Security Policy** is defined in `next.config.ts`. Update it whenever you add an external script/style/image/connect origin, or requests will be blocked.
- **Brand nomenclature:** always write "O₂ Sessions" with the subscript ₂ (never "O2"). Other modality names: Cold Plunge, HBOT, Contrast Heat, Infrared Sauna, Normatec Compression, Guided Stretch.

## Deployment

- Deployed on **Vercel**; the framework is auto-detected (see `vercel.json`).
- Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the Vercel project's Environment Variables.
- Pushing to the production branch triggers a deployment.

## Troubleshooting

- **App fails to start / 500 on boot:** the Supabase env vars are missing. `src/middleware.ts` validates them at startup and throws if absent — confirm `.env.local` is populated.
- **Wrong Node version:** use Node 20.9 or newer.
- **CSP blocking a resource:** add the origin to the relevant directive in `next.config.ts`.
