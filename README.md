# FindMyDentist (FMD)

A dentistry-first platform in one Next.js app, with three connected workspaces that share one identity:

| Workspace | Route | For | What it does |
| --- | --- | --- | --- |
| **FMD** (Main) | `/home` | Patients, public | AI dental assistant, dentist discovery, booking, records vault, community, jobs |
| **FMD Clinic** | `/clinic` | Dentists, clinic staff | Calendar, patients, treatment plans, billing, messages, analytics |
| **FMD Academic** | `/academic` | BDS / MDS / faculty | AI seminar studio, research, journal club, cases, posters, viva |

`/` is currently a **"Site under construction"** landing page.

> **Prototype.** Everything is fictional. There is no real auth, payments, AI model, file storage or database. See [What is mocked](#what-is-mocked).

## Quick start

```bash
cd web
npm install
npm run seed      # generates demo data in web/data/*.csv
npm run dev       # http://localhost:3000
```

The repo root has a small `package.json`, so `npm run dev` also works from there (it forwards to `web/`; run `npm install` inside `web/` first).

Scripts (run in `web/`, or from the root for all but `typecheck`): `dev`, `build`, `start`, `lint`, `seed`, `typecheck`.

Requires Node 20+.

## Trying it out

There are no passwords. Go to `/login` (or the profile menu → *Switch demo persona*) and pick one:

| Persona | Lands on | Try this |
| --- | --- | --- |
| Patient (Ananya Rao) | `/home` | Ask the AI a symptom → book a dentist → see it in Appointments and Records |
| Dentist (Dr. Arjun Mehta) | `/clinic` | Confirm the booking, open a patient, advance a treatment, mark an invoice paid |
| Student (Priya Sharma) | `/academic` | Create a seminar (try **Calcium Metabolism**) → edit the outline → generate → edit slides → QC → Viva |
| Clinic staff (Kavya Nair) | `/clinic` | Same workspace as the dentist |

Use the grid icon in the header to switch workspaces. A role without access to a workspace sees a one-click persona switch instead.

## Architecture

```
UI (Server + Client Components)
   ↓
Route Handlers   src/app/api/v1/{main,clinic,academic,...}
   ↓
Services         src/lib/server/services      business rules
   ↓
Repositories     src/lib/server/repositories  typed access per domain
   ↓
CSV layer        src/lib/server/csv           reader / writer / codec
   ↓
web/data/*.csv
```

- The UI never touches CSV. Services never know the store is CSV, so swapping in PostgreSQL means re-implementing `csv/table.ts`.
- Inputs are validated with Zod (`src/lib/validations`). Clinic queries are scoped to the signed-in user's clinic.
- Auth is a user id in an httpOnly cookie (`src/lib/server/session.ts`).

```
web/
├─ data/                    generated CSV "database" (re-created by `npm run seed`)
├─ scripts/seed.ts          demo data, dated relative to today
├─ public/
└─ src/
   ├─ app/
   │  ├─ page.tsx           under-construction landing
   │  ├─ (main)/            FMD Main (home, assistant, dentists, booking, records, community, jobs…)
   │  ├─ (auth)/            login, register, onboarding
   │  ├─ clinic/            FMD Clinic
   │  ├─ academic/          FMD Academic
   │  └─ api/v1/            REST route handlers
   ├─ components/           ui (shadcn) · shared · main · clinic · academic
   ├─ lib/                  config, validations, server (csv, repositories, services)
   └─ types/
```

Stack: Next.js 16 (App Router), TypeScript, Tailwind CSS 4, shadcn/ui (Radix), Lucide, Zod.

> This Next.js version has breaking changes from older releases. Check `web/node_modules/next/dist/docs/` before changing framework-level code.

## Highlights

- **AI Dental Assistant:** rule-based triage with language detection, red-flag safety overrides, specialty routing, dentist matches and a clinical disclaimer. Your description carries through to booking.
- **Booking:** real slot availability, double-booking prevention, notifications to patient and clinic.
- **Records vault:** patient-owned records across clinics, treatment timelines and digital warranty cards.
- **Clinic:** day / week / month calendar, patient detail with treatment roadmaps, invoices, messages with suggested replies, analytics.
- **Academic Studio:** blueprint first, then slides in controlled batches. Every slide is a structured object (type, key points, citations, notes, confidence) that can be edited or regenerated alone. It also has an automatic QC report, speaker notes, present mode, Viva mode and Markdown / JSON export.

## What is mocked

| Area | In the prototype | In production |
| --- | --- | --- |
| Database | CSV files (single process only) | PostgreSQL |
| Auth | Demo cookie | OTP / secure sessions, RBAC, audit logs |
| AI (assistant, academic) | Deterministic rules and a curated Calcium Metabolism knowledge pack | LLM orchestration, RAG over licensed sources |
| Files / X-rays | Placeholders; metadata only | Encrypted object storage |
| Payments | "Mark paid" records the method | Payment gateway, reconciliation |
| PPTX / PDF | Markdown, JSON and browser print | Separate presentation engine |
| Citations | Landmark paper metadata, marked unverified | PubMed / Crossref verification |
| Map | Schematic map from lat/lng | Real map provider |

Spots where a shortcut has a known limit are marked in code with `ponytail:` comments.

## Resetting data

The app writes to `web/data/*.csv`. To reset everything to the demo state:

```bash
npm run seed
```

## Safety note

The AI assistant provides educational guidance only and shows a disclaimer. It escalates red flags (facial swelling, trouble breathing, trauma) to urgent or emergency advice. It is not a diagnosis.

## Source document

The product direction comes from `web/FMD_Technical_Product_Blueprint.pdf`.
