# KAIROS — Production Deployment Readiness Check Plan

This document defines the strict pre-deployment verification gates, infrastructure checks, security audits, and automated validation procedures required before deploying the **KAIROS Production Readiness & QA Checklist System** to **Vercel** + **Neon PostgreSQL**.

---

## 1. Executive Summary

KAIROS is shipped through a deterministic, gate-based release process. Each deployment must clear **five sequential gates** — database integrity, security hardening, build quality, frontend performance, and environment configuration — before it is considered production-ready. A single failed gate blocks the release.

---

## 2. Pre-Deployment Verification Checklist

### Gate 1: Database & Persistence Integrity (Neon PostgreSQL)

- [ ] **Connection Pooling & SSL** — Connection string contains `sslmode=require`, or the serverless pool is configured with `rejectUnauthorized: false`.
- [ ] **Schema Migration Completeness** — Verify all **8 core tables** exist and are healthy:
  - `users` (`id`, `email`, `password_hash`, `name`, `role`, `created_at`, `updated_at`)
  - `sessions` (`id`, `user_id`, `token_hash`, `expires_at`, `created_at`)
  - `projects` (`id`, `name`, `slug`, `description`, `version`, `environment`, `repository_url`, `deployment_url`, `owner`, `lead_tester`, `target_release_date`, `created_at`, `updated_at`)
  - `checklist_categories` (`id`, `name`, `slug`, `description`, `section_group`, `order_index`)
  - `checklist_items` (`id`, `category_id`, `code`, `title`, `description`, `verification_guide`, `criticality`, `priority`, `section_group`, `order_index`, `tags`)
  - `project_checklist_results` (`id`, `project_id`, `item_id`, `status`, `tester_name`, `tester_id`, `notes`, `expected_behavior`, `actual_behavior`, `steps_to_reproduce`, `evidence_url`, `updated_at`)
  - `project_activity_logs` (`id`, `project_id`, `item_id`, `action`, `actor`, `actor_id`, `previous_status`, `new_status`, `details`, `created_at`)
  - `project_approvals` (`id`, `project_id`, `approver_name`, `approver_id`, `role`, `decision`, `notes`, `created_at`)
- [ ] **Checklist Dataset Seeding** — Exactly **69 unique categories** and **1,260 canonical items** are seeded in Neon DB.
- [ ] **Indexes Active**:
  - `idx_results_project_id` ON `project_checklist_results(project_id)`
  - `idx_logs_project_id` ON `project_activity_logs(project_id)`
  - `idx_sessions_token` ON `sessions(token_hash)`

---

### Gate 2: Security & Authentication Hardening

- [ ] **Route Guard Edge Proxy** — `proxy.ts` (Next.js 16.3+) intercepts and protects `/`, `/projects/*`, `/api/projects/*`, `/api/checklist`.
- [ ] **API Security** — Unauthenticated API requests return clean `401 Unauthorized` JSON responses.
- [ ] **Password Security** — Passwords are salted and hashed with **PBKDF2 (10,000 iterations, SHA-512)**.
- [ ] **Session Protection**:
  - Session tokens stored as **SHA-256 hashes** in the database.
  - Cookies set with `HttpOnly`, `SameSite=Lax`, and `Secure` (in production).
- [ ] **Environment Isolation** — No `.env` secrets or credentials committed to source control.

---

### Gate 3: Build & Static Code Quality

- [ ] **Zero TypeScript Compilation Errors** — `npx tsc --noEmit` passes with **0 errors**.
- [ ] **Next.js Production Build** — `npm run build` succeeds (`exit code 0`).
- [ ] **Route Manifest Validation** — Static routes (`/`, `/login`, `/signup`, `/_not-found`) and dynamic routes (`/projects/[id]`, `/projects/[id]/report`, `/api/*`) generate cleanly.
- [ ] **Assets** — Brand assets (`logo_lightMode.svg`, `logo_darkMode.svg`, `logo.svg`) load with **200 OK**.

---

### Gate 4: Frontend Performance & UX Audit

- [ ] **Code Splitting** — Heavy modals (`EditProjectModal`, `DeleteProjectModal`, `QANoteDrawer`, `CopyContextModal`, `AdvanceFilterModal`, `ProjectActivityDrawer`) are dynamically imported via `next/dynamic`.
- [ ] **Search Responsiveness** — Search filter uses `useDeferredValue` for smooth 60fps input without freezing the main thread.
- [ ] **Accordion Rendering** — Collapsed category accordions unmount inner DOM nodes, keeping the DOM under **600 nodes**.
- [ ] **Row Memoization** — `ChecklistItemRow` and `ChecklistItemCard` are wrapped in `React.memo` for instantaneous status toggles (**< 5ms**).
- [ ] **Session Caching** — Header caches the user profile in-memory to prevent repeated `/api/auth/me` calls across page transitions.

---

### Gate 5: Vercel Environment Configuration

- [ ] Set `DATABASE_URL` in **Vercel Project Settings → Environment Variables**.
- [ ] Set `NODE_ENV=production`.
- [ ] Verify **Root Directory** is `./`.
- [ ] Verify **Framework Preset** is **Next.js**.

---

## 3. Autonomous Execution Prompt

The following prompt is designed to be executed by an autonomous coding agent (such as **Puku CLI**). It performs all five verification gates in sequence and emits a final verdict.

````markdown
Run a complete pre-deployment readiness check for KAIROS. Perform the following
5 verification steps autonomously and output a comprehensive readiness report:

1. DATABASE HEALTH & SCHEMA AUDIT:
   - Connect to Neon PostgreSQL using DATABASE_URL.
   - Verify table counts and row counts for all 8 tables (users, sessions,
     projects, checklist_categories, checklist_items, project_checklist_results,
     project_activity_logs, project_approvals).
   - Ensure checklist_categories has 69 rows and checklist_items has 1,260 rows.
   - Verify all columns exist (specifically tester_id in project_checklist_results,
     actor_id in project_activity_logs, approver_id in project_approvals).
   - Check that indexes (idx_results_project_id, idx_logs_project_id,
     idx_sessions_token) exist.

2. BUILD & COMPILATION INTEGRITY:
   - Run typecheck and clean Next.js build: `npm run build`.
   - Verify exit code is 0 and no Next.js page collection errors occur.

3. SECURITY & ROUTE GUARDS:
   - Verify proxy.ts protects all dashboard and project routes from
     unauthenticated traffic.
   - Verify API routes return 401 Unauthorized for unauthenticated requests.
   - Verify auth cookie configuration sets HttpOnly, SameSite=Lax, and Secure
     in production.

4. STATIC ASSETS & BRANDING:
   - Verify /public contains logo_lightMode.svg, logo_darkMode.svg, and logo.svg.
   - Check that theme toggle properly switches dark and light modes.

5. VERDICT:
   - Print a pass/fail summary scorecard for each gate.
   - If all gates pass, confirm: "KAIROS IS PRODUCTION READY FOR VERCEL DEPLOYMENT".
````

---

## 4. Release Verdict Format

A successful run produces a single-line verdict:

> **KAIROS IS PRODUCTION READY FOR VERCEL DEPLOYMENT**

Any failed gate must be remediated and the full gate sequence re-executed before deployment.

---

## See Also

- [`README.md`](./README.md) — Project overview, installation, and usage
- [`docs/ProductionReadinessChecklist.md`](./docs/ProductionReadinessChecklist.md) — Canonical QA verification checklist (1,260 items across 69 categories)