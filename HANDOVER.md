# Handover — Service Ownership Migration

The application **code** in this repository is self-contained and transfers with the git repo. However, three **hosted services** are required to run it, and they currently live in the previous owner's personal accounts. The new team must provision their **own** accounts and migrate to them. This document is the step-by-step.

> After migration, none of the previous owner's accounts (Supabase, Vercel, Resend) are needed. Until it's done, the app will build but **cannot read/write data** (wrong Supabase project) and **cannot send email** (wrong Resend account).

## Services to re-create

| Service | Purpose | What must move |
| --- | --- | --- |
| **Supabase** | Database, Auth, Edge Functions, Vault secrets | Transfer the whole project to the new owner's org (Option A, recommended) or rebuild from scratch (Option B) |
| **GitHub** | Source code | Transfer the repository to the new owner's account/org |
| **Vercel** | Hosting / deployment | Transfer the project to the new owner's team (Option A, recommended) or create fresh (Option B) |
| **Resend** | Transactional email | No transfer mechanism — new account + re-verify `lab33recovery.qa` + new API key |

---

## 1. Supabase

There are two ways to move the database. **Option A (project transfer) is strongly recommended** — it moves the entire live project into the new owner's organization in one step, with everything intact.

### Option A — Transfer the existing project (recommended)

Supabase supports [transferring a project between organizations](https://supabase.com/docs/guides/platform/project-transfer). The project itself is untouched: **same URL, same API keys, database, auth users (passwords included), storage files, edge functions, and Vault secrets all stay exactly as they are** — only the owning organization (and its billing) changes. Nothing in the app or Vercel needs re-configuring.

1. **New owner:** create a Supabase account and an organization. If the project uses paid-plan features, the organization must be on a matching paid plan (attach the new owner's payment method).
2. **New owner:** invite the previous owner's email to that organization (Organization Settings → Team → Invite; "Developer" role is sufficient — the transfer initiator must be at least a member of the target org).
3. **Previous owner:** accept the invite, then open the project → **Project Settings → General → Transfer project** → select the new organization → confirm. (Pre-conditions: no GitHub integration, no log drains, no custom-domain add-on on the project — this project uses none of those.)
4. **New owner:** remove the previous owner from the organization.
5. **New owner (security hygiene):** reset the **database password** (Project Settings → Database) and consider rotating the API keys, since the previous owner knew the old ones. If keys are rotated, update `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel.
6. Update the 3 admin users' passwords (they carry over working — change them to values only the new team knows).

Notes: expect up to 1–2 minutes of downtime only when moving to a Free-plan org; transfers keep the project in its region (this project: `ap-south-1`).

If you use Option A, **skip Option B entirely** — sections 1a–1g below are only for building a fresh project from scratch.

### Option B — Fresh project + dump/restore (fallback)

#### 1a. Create the new project
1. Create a Supabase account/organization for the new owner and a new project.
2. Note the new **Project URL** and **anon key** (Project Settings → API) — these become the app's env vars in Vercel (section 3).
3. Install the CLI: `npm i -g supabase`, then `supabase login`.

#### 1b. Export schema + data from the OLD project
Run these with the **old** project's database connection string (Old project → Project Settings → Database → Connection string). This is the authoritative, complete export (tables, columns, RLS policies, functions, triggers, sequences, enum types, grants):

```bash
# Schema (structure only)
supabase db dump --db-url "postgresql://postgres:[OLD_DB_PASSWORD]@db.[OLD_PROJECT_REF].supabase.co:5432/postgres" -f schema.sql

# Data (rows only)
supabase db dump --db-url "postgresql://postgres:[OLD_DB_PASSWORD]@db.[OLD_PROJECT_REF].supabase.co:5432/postgres" --data-only -f data.sql
```
(`pg_dump` works too if you prefer: `pg_dump --schema=public ...`.)

#### 1c. Restore into the NEW project
```bash
psql "postgresql://postgres:[NEW_DB_PASSWORD]@db.[NEW_REF].supabase.co:5432/postgres" -f schema.sql
psql "postgresql://postgres:[NEW_DB_PASSWORD]@db.[NEW_REF].supabase.co:5432/postgres" -f data.sql   # only if keeping existing records
```

**Included in the schema:** tables `waitlist`, `job_applications`, `positions`, `admin_users`, `site_settings`, `email_logs`, `email_templates`, `email_automations`, `admin_notifications`, `admin_activity_logs`, `system_logs`, `contact_messages`; enum types `admin_role`, `marketing_status`; RLS policies; and the DB functions/triggers (notification triggers `trg_notify_new_waitlist` / `trg_notify_new_application`, `updated_at` triggers, `get_secret`/`upsert_secret`, `has_permission`, `is_admin`, etc.).

**Extensions** the schema relies on (enable in the new project if the dump doesn't create them): `pgcrypto`, `uuid-ossp`, `supabase_vault`, `pg_net`, `pg_cron`.

> **Optional cleanup — orphaned marketing objects.** The marketing feature was removed from the app. The database may still contain now-unused objects: the `marketing_status` enum, functions `execute_scheduled_publish` / `handle_post_scheduling`, and any `marketing_content` table / related cron job. They are harmless but dead. Drop them after migration if you want a clean DB.

#### 1d. Deploy the edge functions
The three edge functions are committed in [`supabase/functions/`](supabase/functions/) (they are **not** part of a DB dump). Deploy them to the new project:
```bash
supabase link --project-ref [NEW_REF]
supabase functions deploy invite-user
supabase functions deploy delete-user
supabase functions deploy reset-password
```

#### 1e. Re-seed Vault secrets
The app reads secrets from Supabase Vault via the `get_secret` RPC. Set these on the **new** project (SQL editor or `upsert_secret`):
- `resend_api_key` — the **new** Resend key from section 4.
- `site_url` — the production URL (e.g. `https://lab33recovery.qa`).

```sql
select upsert_secret('resend_api_key', 're_your_new_key');
select upsert_secret('site_url', 'https://lab33recovery.qa');
```

#### 1f. Recreate storage buckets
Storage **files are not included in a database dump**. On the new project, recreate the **`email-assets`** bucket (public) and copy its files across (download from the old project's Storage UI, upload to the new one). These are the logo/social icons used inside transactional emails — `src/components/admin/pages/email/emailRenderer.ts` builds their URLs from `NEXT_PUBLIC_SUPABASE_URL`, so once the bucket exists on the new project with the same file names, emails render correctly. Check the old project's Storage tab for any other buckets and copy them the same way.

#### 1g. Recreate the 3 admin users
Auth users (and their passwords) do **not** transfer. Recreate the same three logins on the new project — passwords are set fresh by the new team. Easiest path is the `invite-user` edge function (also creates the `admin_users` profile), called while signed in as an existing admin; for the very first admin, use the Supabase dashboard (Authentication → Add user, "Auto Confirm"), which fires the `on_auth_user_created` trigger to create the profile row.

Recreate these emails with their roles:
| Email | Role |
| --- | --- |
| `marketing@lab33recovery.qa` | `admin` |
| `manal@lab33recovery.qa` | `manager` |
| `iza@lab33recovery.qa` | `owner` |

If a profile row isn't auto-created, insert it (matching the new auth user's UUID):
```sql
insert into admin_users (id, email, name, role, is_active)
values ('[NEW_AUTH_USER_UUID]', 'marketing@lab33recovery.qa', 'Marketing', 'admin', true);
```

---

## 2. GitHub repository
Transfer the repo natively: repo → **Settings → General → Danger Zone → Transfer ownership** → the new owner's GitHub username/org. The clean single-commit history moves as-is. (Alternative: they create a fresh repo and this history is pushed to it.)

## 3. Vercel

Like Supabase, [Vercel supports transferring a project](https://vercel.com/docs/projects/transferring-projects) with **zero downtime** — Option A is recommended.

### Option A — Transfer the existing Vercel project (recommended)
What moves automatically: deployments, environment variables, the `lab33recovery.qa` domain assignment, Web Analytics, and all project settings.

1. **New owner:** create a Vercel account. Their team must be on **Pro** (trial or one month) — Hobby teams are single-member and cannot invite the transfer initiator — with a **payment method attached**.
2. **New owner:** invite the previous owner to the team (member role).
3. **Previous owner:** project → **Settings → General → Transfer Project** → select their team → Transfer. Takes seconds to minutes; production stays up throughout.
4. **New owner:** remove the previous owner from the team.
5. **Git relink:** after the GitHub repo transfer (section 2), open the project → Settings → Git and connect it to the repo under the new owner's GitHub, so pushes deploy again.

Not transferred (not used by this project anyway): integrations, log/monitoring history, usage stats.

### Option B — Fresh project (fallback)
1. Create a Vercel account/team for the new owner.
2. **New Project → Import** the git repo. Framework (Next.js) is auto-detected; `vercel.json` is already in the repo.
3. Set Environment Variables (Production + Preview): `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (unchanged values if Supabase was transferred via Option A).
4. Deploy, then add the domain to the new project (see Domain / DNS section).
5. The old `.vercel/` folder is git-ignored and local-only — no action needed.

## 4. Resend
1. Create a Resend account for the new owner.
2. **Domains → Add** `lab33recovery.qa` and add the DNS records Resend provides (SPF/DKIM) at the domain registrar.
3. Once verified, create an **API key** and store it in the new Supabase Vault as `resend_api_key` (step 1e). The app sends as `Lab 33 Recovery <marketing@lab33recovery.qa>` (configurable in `site_settings`).

## 5. Domain / DNS (`lab33recovery.qa`)
- Point the domain to the **new** Vercel project (Vercel → Project → Domains gives the exact A/CNAME records).
- Add Resend's email DNS records (section 4) at the same registrar.
- Ownership of the registrar account itself must also transfer to the new owner.

---

## Cutover checklist

**Supabase — Option A (project transfer):**
- [ ] Project transferred to the new owner's organization
- [ ] Previous owner removed from the organization
- [ ] Database password reset (and API keys rotated if desired — update Vercel env if so)
- [ ] 3 admin users' passwords changed by the new team

**Supabase — Option B (fresh project), only if not using A:**
- [ ] New project created; schema (and data, if kept) restored
- [ ] Extensions enabled (`pgcrypto`, `uuid-ossp`, `supabase_vault`, `pg_net`, `pg_cron`)
- [ ] Edge functions deployed (`invite-user`, `delete-user`, `reset-password`)
- [ ] Vault seeded (`resend_api_key`, `site_url`)
- [ ] Storage buckets recreated (`email-assets`) and files copied
- [ ] 3 admin users recreated with new passwords

**Both paths:**
- [ ] GitHub repository transferred to the new owner's account/org
- [ ] Vercel project transferred to the new owner's team (or fresh project created) and Git relinked
- [ ] New Resend account + `lab33recovery.qa` domain verified + key in Vault
- [ ] Domain + email DNS pointed to the new accounts
- [ ] Registrar account transferred

## Verify after cutover
- Site loads and the **waitlist form** submits successfully (writes to the new DB; confirmation email sends via the new Resend).
- **Contact form** delivers to `marketing@lab33recovery.qa`.
- Admin login works at `/admin` and the dashboard shows data from the new project.
