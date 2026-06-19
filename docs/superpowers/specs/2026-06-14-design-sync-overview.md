# Design-Sync — UI/UX Overhaul Overview & Tracking

**Date:** 2026-06-14
**Status:** Decomposed; Foundation (F1) partially executed autonomously. Page rebuilds awaiting user approval.
**Context:** User requested a broad UI/UX elevation across ~11 pages plus cross-cutting concerns ("looks too AI-generated", elevate UX, Radix/react-bits/21st-magic, reuse search everywhere, breadcrumb standard everywhere, admin sectioning, etc.). Too large for one spec — decomposed into a Foundation + per-page sub-projects, each to get its own spec → plan → build.

> Standing rule [[feedback-no-commit-without-permission]]: nothing is committed; all changes live in the working tree on branch `feature/feedback-engagement-2026-06-14`.

## Decomposition & build order

### F1 — Foundation primitives (cross-cutting; build once, reuse everywhere)
- **Breadcrumb** — redesigned shared component (`Components/HelperComponents/Breadcrumb`): on-brand ivory pill, amber home icon, amber separators, forest-green bold active crumb. Used by Profile, MyOrders, Appointment, PetShop, Product detail, ImportExport. **DONE** (autonomous). Tips detail migrated onto it. Remaining: roll onto Gallery detail when that page is refactored.
- **Shared SearchBar** — the existing `HelperComponents/SearchBar` is gimmicky (purple/pink particle effects) and hard-wired to `/petshop` navigation + dark-overlay styling. Needs generalizing into a reusable, on-brand component (configurable placeholder + `onSearch` + light/overlay variants) and adopting on Tips + everywhere. **DEFERRED — needs design approval** (taste + architecture decision).
- **Card/Tile + motion conventions** — standardize a Radix-based card/tile primitive and transition tokens for the page refactors. **DEFERRED.**

### Page sub-projects (each its own spec → plan → build)
| # | Page | Asks | Risk | Status |
|---|------|------|------|--------|
| P1 | **Home** | hero responsive; fix service icons; carousel controls more visible; "section after featured" real data; FAQ wider + **admin-configurable** (backend); footer **newsletter** (backend); footer Company/Support real links; **currency by IP geolocation** | Mixed | **DONE:** footer links; hero responsive (mobile rebuilt, verified); carousel arrows; FAQ wider (820→960); **FAQ admin-config** (Faq model+CRUD `/api/faqs`, AdminFaqs page `/admin/faqs`+sidebar, FaqSection fetches w/ fallback; tests 6/6); **Newsletter** (NewsletterSubscriber model, `/api/newsletter` subscribe+admin list, footer form wired, live-verified); **Currency IP-geo** (`detectCurrencyByIP` via ipapi.co, CurrencyContext auto-detects when no explicit choice). **PENDING:** service-icons (looked OK in QA — needs a specific defect); StatsSection stat-numbers "real data" (needs decision on what to count). |
| P2 | **Appointment booking → Professional directory** | re-scoped: booking REMOVED; `/appointments` is now a directory (category tabs + cards → "View profile") + new `/appointments/professional/:id` profile page (bio/qualifications/services/availability/contact→/contact). Dashboard removed. Frontend-only, no reviews. | High→Med | **DONE** (2026-06-19) — spec/plan `2026-06-1{8,9}-appointment-directory*`. 79/79 vitest, build clean, browser-verified. |
| P3 | **Service page** | scrap & rebuild; inline import/export form (no navigation); system design | High | Pending approval |
| P4 | **Petstore (shop)** | replace hero with advert banner; make heading/search/breadcrumb prominent | Medium | **DONE** (2026-06-18) — new `shop` advert placement (backend); `ShopBanner` w/ rotation + branded fallback; breadcrumb strip → banner → intro+search; design-system polish (chips/toolbar/pagination); AdminAdverts option. Spec/plan `2026-06-18-petshop-rebuild*`. Browser-verified. |
| P5 | **Individual product** | elevate UX; breadcrumb (F1 ✓) | Medium | **DONE** (2026-06-18) — sticky gallery (image follows on scroll); main-image hover-zoom + full-screen lightbox (thumb strip, Esc/click-out close); buy controls grouped into one elevated purchase panel. Commit `a13e34f`. Browser-verified. |
| P6 | **Pet Care Tips list** | full refactor (looks AI-gen); seed good data + Unsplash images; reuse SearchBar | High | Pending approval |
| P7 | **Pet Care Tips detail** | full refactor; admin **sectioning**; breadcrumb (F1 ✓ migrated) | High | Breadcrumb done; refactor pending |
| P8 | **Gallery** | refactor; more "gallery"-like; admin sectioning | Medium-High | Pending approval |
| P9 | **Gallery detail** | refactor; admin sectioning; breadcrumb (F1) | High | Pending approval |
| P10 | **Contact** | elevate; verify backend wiring | Medium | **DONE** (2026-06-18) — page was already built (hero, working form, promo, GoogleMap). Elevation: enriched "Visit Us" with a Follow-us socials row (real URLs from footer) + tel: link + amber icons; form inputs got a border + amber focus ring. Backend wiring (submitContact + admin reply) already verified. Commit `7d81efa`. |
| P11 | **About** | elevate (already partially polished + real images) | Medium | **DONE** (2026-06-19) — page was already strongly polished (hero, ticker, emergency-steps, real images); verified on-brand. Fixed the now-stale "Book Appointment" CTA → "Find a Professional" (booking removed in P2). |

### Backend mini-features (folded into the page that needs them)
- **FAQ resource + admin CRUD** (P1): model `Faq { question, answer, order, active }`, public `GET /api/faqs`, admin CRUD, AdminFaqs page; homepage FAQ section reads from it (with hardcoded fallback). Also "wider accordion" — CSS width bump.
- **Newsletter subscribe** (P1): model `NewsletterSubscriber { email, active }`, public `POST /api/newsletter`, admin list; wire the footer form (currently a no-op that just clears the field).
- **IP-geo currency** (P1): `CurrencyContext` already auto-detects via browser locale; upgrade to optionally resolve currency from an IP-geolocation lookup on first visit (cache in localStorage), falling back to locale → MUR.
- **Content "sectioning"** (P7–P9): let admins define ordered sections (heading + rich body, like products' `sections[]`) on tips and gallery posts; render them on the detail pages. Tip/Gallery models may need a `sections[]` field; admin forms get a section editor.

## Decisions locked (made autonomously per user delegation)
- Breadcrumb visual = ivory pill + amber accents + forest active (matches the existing amber #BA7517 / forest #001C10 system). Last crumb is the active/current page.
- Footer Company/Support repointed to **real existing routes only** (no dead `/` links, no links to non-existent legal/careers pages). Legal pages (Terms/Privacy/Refund) are a separate future task if wanted.

## What was executed autonomously (overnight, uncommitted)
1. Breadcrumb component + CSS redesign → propagates to all pages using it.
2. Tips detail page migrated to the shared Breadcrumb (removed its bespoke one).
3. Footer Company + Support columns repointed to real routes.

## What is intentionally NOT done autonomously
The "scrap & rebuild / elevate, looks AI-generated" page work (P2–P11 visuals), the SearchBar redesign, and the backend mini-features (FAQ/newsletter/IP-geo/sectioning) — these carry real visual-taste or product decisions and should be brainstormed/approved before building. Recommended next: approve **P1 (Home)** as the first full sub-project (highest visible value, mixes safe fixes with the FAQ/newsletter/currency features), then proceed page-by-page.

## Note on tooling
User asked for Radix UI / "react bits" / 21st-dev magic. The `magic` MCP (21st-dev component generator) is available; generated components will need adaptation to the existing design tokens (amber/forest, `--font-*`, existing CSS conventions). For shared primitives, hand-building on-brand is more reliable than generated output; for richer page rebuilds, the magic MCP can seed components that are then themed.
