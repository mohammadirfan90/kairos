<div align="center">

<img src="public/logo.svg" alt="KAIROS Logo" width="120" />

# KAIROS

### Production Readiness & QA Checklist System

An audit-grade release readiness platform for engineering teams — built to enforce deterministic go/no-go deployment gates, track QA evidence, and ship defect-ready reports in one click.

<p align="center">
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white" alt="Next.js 16" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React 19" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript 5.7" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind CSS 3.4" /></a>
  <a href="https://neon.tech/"><img src="https://img.shields.io/badge/Neon-PostgreSQL-00E699?logo=postgresql&logoColor=white" alt="Neon PostgreSQL" /></a>
  <a href="#-license"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" /></a>
</p>

<p align="center">
  <a href="#-overview">Overview</a> · <a href="#-features">Features</a> · <a href="#-tech-stack">Tech Stack</a> · <a href="#-screenshots">Screenshots</a> · <a href="#-installation">Installation</a> · <a href="#-usage">Usage</a> · <a href="#-project-structure">Project Structure</a> · <a href="#-environment-variables">Environment Variables</a> · <a href="#-contributing">Contributing</a> · <a href="#-license">License</a>
</p>

</div>

---

## Overview

**KAIROS** is a structured production verification and QA defect management system for engineering teams. Unlike generic todo-list applications, KAIROS is an **audit-grade release readiness platform** where teams:

- Create software projects scoped to a release environment
- Execute a comprehensive production-readiness checklist item-by-item
- Attach contextual QA evidence and reproduction steps to failures
- Enforce deterministic release gates (Critical / High / Medium / Low severities)
- Generate 1-click defect reports ready for GitHub Issues, Linear, Jira, or Slack

The name **KAIROS** (καιρός) — the ancient Greek concept of the *opportune, decisive moment* — reflects the platform's mission: turning release decisions from a gut feeling into a data-backed verdict.

---

## Features

### Core Workflow
```
Create Project → Run Production Checklist → Review Failures → Add QA Notes
       → Fix Issues → Re-test → Generate/Copy Report → Approve Release
```

### Deterministic Production Readiness Scoring

| Verdict             | Condition                                                                                       |
|---------------------|-------------------------------------------------------------------------------------------------|
| `BLOCKED`           | Any **Critical (P0)** security/infrastructure check fails, or any check is explicitly `Blocked`. |
| `ACTION REQUIRED`   | Non-critical `High` severity failures are present.                                                |
| `IN PROGRESS`       | Required checks remain untested and no blockers are detected.                                     |
| `PRODUCTION READY`  | 100% of Critical checks pass, 0 Failures, 0 Blockers, and QA Approval signed.                    |

### QA Findings & Contextual Notes
- Freeform Markdown observations per check.
- Structured fields: **Expected Behavior**, **Actual Behavior**, **Steps to Reproduce**, **Evidence / Screenshot Link**.
- Notes remain permanently attached to the specific project check, forming a traceable audit trail.

### 1-Click Developer Defect Context & Full Reports
- **1-Click Copy Defect Context** — Formatted, ready-to-paste Markdown for GitHub Issues, Linear, Jira, Slack.
- **Full QA Assessment Report** — Executive summary, Go/No-Go release verdict, complete failure manifest, export to `.md` and print-ready format.

### Strict Monochrome Visual System
A professional internal engineering tool aesthetic — Black, White, Neutral Grays, subtle 1px borders, high contrast.

Color is **exclusively** reserved for semantic states:

| Color         | Meaning            |
|---------------|--------------------|
| 🟢 Green      | Passed / Healthy   |
| 🔴 Red        | Failed / Problem   |
| 🟡 Amber      | Blocked            |
| ⬜ Monochrome | Everything else    |

Sharp geometry: **Minimal border radius (`rounded-none` / `rounded-sm` max 2px)** — no curved edges.

### Additional Capabilities
- 🔐 **Cookie-based session authentication** (`kairos_session_token`) with edge route guards
- 🌓 **Dark / Light mode** with class-based theming
- 🔎 **Advanced filtering** by status, criticality, priority, category, and quick filters (failures, critical, blockers, with notes)
- 📊 **Activity logs** for every project event
- ✅ **Multi-role approvals** (Lead QA, Security Engineer, QA Tester, Software Engineer, DevOps/SRE, Product Manager, Admin)
- 🛡️ **Auto-initializing database schema** — tables are created on first query; no manual migrations required
- 💾 **In-memory fallback store** — runs without a database for local UI exploration (data is non-persistent)

---

## Tech Stack

<p align="center">
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white" alt="Next.js 16" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React 19" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript 5.7" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind CSS 3.4" /></a>
  <a href="https://neon.tech/"><img src="https://img.shields.io/badge/Neon-PostgreSQL-00E699?logo=postgresql&logoColor=white" alt="Neon PostgreSQL" /></a>
  <a href="https://hugeicons.com/"><img src="https://img.shields.io/badge/Hugeicons-React-FF6B35?logo=hugeicons&logoColor=white" alt="Hugeicons React" /></a>
  <a href="https://vercel.com/"><img src="https://img.shields.io/badge/Vercel-Hosted-000000?logo=vercel&logoColor=white" alt="Vercel" /></a>
  <a href="https://eslint.org/"><img src="https://img.shields.io/badge/ESLint-Lint-4B32C3?logo=eslint&logoColor=white" alt="ESLint" /></a>
</p>

<br />

| Layer            | Technology                                                       |
|------------------|------------------------------------------------------------------|
| **Framework**    | Next.js 16 (App Router) with React 19                            |
| **Language**     | TypeScript 5.7                                                    |
| **Styling**      | Tailwind CSS 3.4 — Strict Monochrome System                       |
| **Database**     | Neon PostgreSQL via `pg` (pooled, TLS)                            |
| **Icons**        | Hugeicons React + custom precision SVG icon system                |
| **Fonts**        | System sans + `ui-monospace` stack (no external font CDNs)        |
| **Dev Tooling**  | Agentation, ESLint (via `next lint`)                              |
| **Edge Guard**   | Next.js 16 `proxy.ts` (cookie-based route protection)            |
| **Hosting**      | Vercel + Neon                                                     |

---

## Screenshots

> Placeholder images — drop real screenshots into `docs/screenshots/` and update the paths below.

<div align="center">

| Dashboard | Project Checklist | Defect Report |
|-----------|-------------------|---------------|
| ![Dashboard](docs/screenshots/dashboard.png) | ![Project Checklist](docs/screenshots/checklist.png) | ![Defect Report](docs/screenshots/report.png) |

</div>

A high-fidelity demo build is also available — clone the repo and run `npm run dev` to explore the UI locally on `http://localhost:3000`. With no database configured, the app falls back to an in-memory store so the UI is fully navigable.

---

## Installation

### Prerequisites

- **Node.js** 18.18+ (Node 20+ recommended — required by Next.js 16)
- **npm** 9+ (or `pnpm` / `yarn` / `bun` — `package-lock.json` is committed)
- A **Neon PostgreSQL** database — [create a free project](https://console.neon.tech/)
  - *Optional*: without a database URL, the app runs against an in-memory store for UI exploration

### 1. Clone the repository

```bash
git clone https://github.com/<your-org>/kairos.git
cd kairos
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file at the project root (this file is already covered by `.gitignore`):

```bash
# .env
DATABASE_URL="postgresql://user:pass@ep-sample.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

See [Environment Variables](#-environment-variables) for the full list and fallback behavior.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The first authenticated request will auto-create all required tables (`users`, `sessions`, `projects`, `checklist_categories`, `checklist_items`, `project_checklist_results`, `project_activity_logs`, `project_approvals`).

### 5. (Optional) Seed the canonical checklist

If you want to pre-populate the master checklist categories and items directly into Postgres outside of the running app, you can run the standalone seeder:

```bash
node scripts/db-init.mjs
```

> The script reads `DATABASE_URL` from `.env` and upserts all canonical categories and items. It is idempotent — safe to re-run.

### Production Build

```bash
npm run build
npm start
```

---

## Usage

### Available Scripts

| Command         | Description                                       |
|-----------------|---------------------------------------------------|
| `npm run dev`   | Start the local development server                |
| `npm run build` | Create an optimized production build              |
| `npm start`     | Start the production server                       |
| `npm run lint`  | Lint the codebase with the Next.js ESLint config  |

### Typical User Journey

1. **Sign up / Log in** — Create an account at `/signup` with your engineering role (QA, Security, DevOps, etc.).
2. **Create a Project** — Define a project with version, environment (`Production` / `Staging` / `Preview`), repository URL, and deployment URL.
3. **Run the Checklist** — Walk through the production readiness checklist, marking each check as `Passed`, `Failed`, `Blocked`, or `Not Applicable`.
4. **Document Failures** — For every failed check, attach QA notes with structured fields (Expected vs Actual behavior, Steps to Reproduce, Evidence link).
5. **Generate Defect Reports** — Use the **1-Click Copy** action to format defect context for GitHub Issues, Linear, Jira, or Slack.
6. **Approve the Release** — A designated approver signs off; the readiness engine produces a final Go/No-Go verdict.

---

## Project Structure

```
kairos/
├── app/                                # Next.js App Router
│   ├── api/                            # Route handlers
│   │   ├── auth/
│   │   │   ├── login/route.ts          #   POST: email/password login
│   │   │   ├── logout/route.ts         #   POST: clear session cookie
│   │   │   ├── me/route.ts             #   GET:  current user
│   │   │   └── signup/route.ts         #   POST: create account
│   │   ├── checklist/route.ts          # GET: canonical checklist
│   │   └── projects/
│   │       ├── route.ts                #   GET/POST: list & create projects
│   │       └── [id]/
│   │           ├── route.ts            #     GET/PATCH/DELETE single project
│   │           ├── logs/route.ts       #     GET: project activity log
│   │           └── results/route.ts    #     GET/POST: checklist results
│   ├── login/page.tsx                  # Login page
│   ├── signup/page.tsx                 # Signup page
│   ├── projects/[id]/
│   │   ├── page.tsx                    #   Checklist workspace UI
│   │   └── report/page.tsx             #   Full QA assessment report
│   ├── globals.css                     # Tailwind base + monochrome tokens
│   ├── layout.tsx                      # Root layout (theme + meta)
│   ├── page.tsx                        # Dashboard / projects index
│   └── not-found.tsx                   # 404 page
│
├── components/
│   ├── checklist/                      # ChecklistItemRow, ChecklistItemCard,
│   │                                   # ChecklistToolbar, ChecklistStats,
│   │                                   # AdvanceFilterModal, CopyContextModal,
│   │                                   # QANoteDrawer, ProjectActivityDrawer
│   ├── layout/                         # Header, ThemeToggle
│   ├── project/                        # Create/Edit/Delete modals, ProjectCard,
│   │                                   # ProjectHeader, ProjectTableRow
│   ├── ui/                             # Badge, Button, Dialog, Input, Icons
│   └── dev/                            # Agentation client (dev-only)
│
├── lib/
│   ├── auth.ts                         # Password hashing + session cookie helpers
│   ├── db/index.ts                     # Neon Postgres client + auto schema init
│   ├── readiness.ts                    # Verdict engine (BLOCKED / READY / etc.)
│   ├── report-generator.ts             # Markdown report formatter
│   ├── types.ts                        # Shared TypeScript types
│   ├── seed-data.ts                    # Canonical categories & items
│   └── checklist-data.json             # Static export of canonical checklist
│
├── scripts/
│   ├── db-init.mjs                     # Optional standalone seeder
│   └── clean-and-seed.sql              # Raw SQL reset & seed script
│
├── public/                             # Static assets (logo, favicon, hieroglyph)
├── assets/                             # Design source assets
├── docs/                               # Engineering docs + reference checklist
│
├── proxy.ts                            # Next.js 16 edge proxy (auth route guard)
├── next.config.ts                      # Next.js config
├── tailwind.config.ts                  # Monochrome design tokens
├── tsconfig.json
├── postcss.config.mjs
└── package.json
```

---

## Environment Variables

Create a `.env` file at the project root with the following variables. **All variables are optional** — without any of them the app runs against an in-memory store for UI exploration.

| Variable        | Required | Description                                                                                            | Example                                                                                              |
|-----------------|----------|--------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| `DATABASE_URL`  | Optional | Neon PostgreSQL pooled connection string. Enables persistent storage.                                | `postgresql://user:pass@ep-sample.us-east-2.aws.neon.tech/neondb?sslmode=require`                   |
| `POSTGRES_URL`  | Optional | Fallback Postgres URL used if `DATABASE_URL` is not set.                                                | `postgresql://user:pass@host:5432/db`                                                                |
| `NODE_ENV`      | Optional | Set to `production` in deployed environments. Controls secure cookies and build optimizations.        | `production`                                                                                         |

> **Security:** `.env`, `.env.local`, and friends are already covered by `.gitignore`. Never commit credentials.

---

## Contributing

Contributions are welcome and appreciated. To keep the codebase healthy:

1. **Fork** the repository and create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Install** dependencies and set up your Neon dev database (see [Installation](#-installation)). Without one, the in-memory fallback is sufficient for UI work.
3. **Follow the design system** — keep the monochrome aesthetic; avoid introducing curved geometry or non-semantic color.
4. **Run the linter** before opening a PR:
   ```bash
   npm run lint
   ```
5. **Open a Pull Request** describing the change, motivation, and screenshots (if UI-related).

Please open an [Issue](../../issues) first for larger changes so we can align on direction before you invest time.

---

## License

This project is released under the **MIT License**. See `LICENSE` for the full text.

> If you intend to release this project publicly, add a `LICENSE` file at the repository root.

```
MIT License

Copyright (c) <YEAR> <COPYRIGHT HOLDER>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

<div align="center">

Built with discipline by the KAIROS engineering team.
Turn release decisions from gut feeling → data-backed verdict.

</div>