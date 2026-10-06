# FMD Interactive Prototype (`fmd.html`)

A single-file, zero-build prototype of the FMD ecosystem: FMD Main (with Concierge), Clinic OS, the Clinic Agentic AI Manager, Scholar, Admin and the Accountant Portal. All data is fictional and every integration is simulated.

## Run

Open `fmd.html` in a browser. You don't need a server or a build step. The only network request is for Google Fonts, and it falls back to system fonts when you're offline. State is saved in LocalStorage. Use **Reset demo** (top strip) to restore fresh data.

## Demo accounts (login screen)

| Role | Name | Lands on |
|---|---|---|
| Patient | Aarav Menon | FMD Main |
| Dentist | Dr. Ishaan Mehta | Main · Clinic · Scholar |
| Student | Ira Nair | Scholar (activate via Student membership) |
| Dental Company | Orbis Dental Devices | Main (jobs, content) |
| Clinic Owner/Admin | Dr. Nandini Rao | Clinic OS (Lumen Dental Studio) |
| Clinic Staff | Kavya Pillai | Clinic OS (no clinical notes/images) |
| FMD Support | Ritika Shetty | Admin: Concierge, tickets, verification |
| Moderator | Neel Banerjee | Admin: moderation |
| Super Admin | Asha Krishnan | Admin: everything + read-only finance |
| Accountant | Lakshmi Sinha | Accountant Portal only |

The **Guided tour** button walks through Main → Clinic → Scholar → Admin → Accountant. It switches roles automatically.

## Structure (inside `fmd.html`, one `<script>` per layer)

`Storage` (LocalStorage repo) → `MockData` (seeded generator) → `State` → `Permissions` (all `can*()` checks) → `Audit` / `Notify` → services (`Booking`, `Journey`, `Records`, `Clinical`, `Plans`, `Billing`, `Warranty`, `Concierge`, `Reviews`, `Content`, `Inventory`, `Support`, `Accounting`, `Admin`, `Membership`, `Referral`, `Scholar`) → AI simulators (`MainAI`, `ClinicAI`, `ScholarAI`) → `UI` / `Charts` components → `Router` + shell → `Views.*` → delegated event handlers (`Actions`, `Forms`, `Changes`, `Inputs`).

Buttons only dispatch to `Actions`. All business rules live in the services, and every protected action goes through `Permissions`.

## Key workflows to try

1. **Patient:** ask the AI → find an Endodontist → book (the **12:00 ⚡ slot always simulates "just taken"**) → appointments → care journey → records (share with time limit, view access history) → warranty (verify `WC-2026-00417`).
2. **Concierge:** submit a request as the patient → manage it as Support/Super Admin (status, checklist, clinic contact, close with outcome).
3. **Clinic:** patient `Aarav Menon` → Treatment tab → mark treatment completed → create invoice → issue warranty. Then switch to the patient and see it in the journey, records and notifications.
4. **AI Manager:** "Find patients due for recall and draft recall messages" → stops at *Needs approval* → approve → executes (patients without consent are skipped, so it shows *Partially completed*) → audit ref.
5. **Scholar:** activate membership → assistant → new seminar → edit blueprint → generate → edit/regenerate slides → citations → QC → Viva.
6. **Accountant:** add an expense → match bank lines → resolve exceptions → GST/TDS → month-end close (enforces step order).
7. **Admin:** verification, moderation, Security & trust scenarios, AI safety lab, audit-log filters.

## Simulated (not real)

AI responses, voice input, file extraction, payments, credential verification, SMS/WhatsApp/email, bank import, maps, availability, analytics, tax filings and PDF export (browser print). Translations are partial: the greeting and disclaimer are translated, and detailed answers stay in English.

## Known limitations

- Single-browser state. Nothing syncs between users or devices.
- AI is pattern-matched, not a model. Unrecognised requests fall back to a clarify or uncertain response.
- Real upload content isn't parsed beyond small text files (used for the prompt-injection check).
- Light theme only, and the layout is tuned for desktop, tablet and phone widths.
- Everything is in one ~490 KB HTML file because that's what was asked for. Splitting it along the script boundaries above into separate files is mechanical.
