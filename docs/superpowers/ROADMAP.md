# VitalPaws — Feature Roadmap (2026-06-14 batch)

A large batch of features was requested and **decomposed into independent sub-projects**, each built through its own design → plan → implementation cycle. This file tracks status so anyone can continue.

> Specs live in `docs/superpowers/specs/`, plans in `docs/superpowers/plans/`. Backend + frontend are **separate repos** (`Raj-SW/petstore-backend`, `Raj-SW/petstore-frontend`); each has a `HANDOFF.md`.

## Status

| # | Sub-project | Status | Spec / Plan |
|---|-------------|--------|-------------|
| — | Featured Products carousel | ✅ on `main` | `*-featured-products-carousel-*` |
| — | Gallery (mini-blog) | ✅ on `main` | `*-gallery-*` |
| 1 | Contact Page + Map + Socials | ✅ branch `feature/contact-promo-admin-2026-06-14` (pushed) | `*-contact-page-*` |
| 1b | Promo banner → admin-managed (`hero`/`promo` adverts) | ✅ same branch | `*-promo-banner-admin-*` |
| 2 | Homepage Engagement: Question/Feedback tabs + Feedback testimonials | ✅ DONE on branch `feature/feedback-engagement-2026-06-14` (backend + frontend; not yet merged to main) | `*-feedback-engagement-*` |
| 3 | Discounts / On-Sale | ✅ DONE on branch `feature/feedback-engagement-2026-06-14` (backend + frontend; not yet merged) | `*-discounts-on-sale-*` |
| 4 | Recurring Orders (subscriptions) | ✅ DONE on branch `feature/feedback-engagement-2026-06-14` (backend + frontend; not yet merged). Loyalty/benefits NOT started. | `*-recurring-orders-*` |
| 4B | Sale Announcements (email broadcast; re-scope of "Loyalty") | ✅ DONE same branch (backend + frontend; not merged) | `*-sale-announcements-*` |
| — | Promo slideshow restored in EngagementSection (both tabs, `promo`-advert driven w/ fallback) | ✅ same branch; **pending visual QA** | — |
| — | Homepage FAQ accordion section (`FaqSection`, design-system styled) | ✅ same branch; **pending visual QA** | — |
| — | About Us page (`/about`, 6 branded sections from skeleton) | ✅ same branch; **pending visual QA** (built by subagent, not yet reviewed) | — |

## Remaining work — details

### 2. Homepage Engagement ✅ DONE (branch, not merged)
Feedback resource (public submit, name/role/rating/message + up to 3 photos, **admin approval**), tabbed homepage section (Ask a Question | Leave Feedback, Featured-style tabs), and approved feedback driving the `StatsSection` "What Our Clients Say" carousel. Backend (model/validator/controller/routes/tests) + frontend (feedbackApi, EngagementSection tabs, FeedbackForm w/ stars+photos, StatsSection DB-driven w/ fallback, AdminFeedback moderation at `/admin/feedback`) all implemented, tested (FeedbackForm 4/4, backend 7/7 in isolation), build clean, live-verified (POST→201, GET→[] unapproved). On branch `feature/feedback-engagement-2026-06-14` — **not yet merged to main**.

### 3. Discounts / On-Sale (not started)
Product sale pricing (e.g. `salePrice` or `discountPercent` + `onSale`), "On Sale" badge on cards/detail, admin toggle in AdminProducts, and price display honoring the currency formatting. Brainstorm → spec → plan → build.

### 4. Recurring Orders (subscriptions) ✅ DONE (branch, not merged)
Backend (commit `a334548`) + frontend (commit `0d82f1d`). Customer: My Subscriptions page (`/my-subscriptions`) with pause/resume/skip/cancel + nav entries; Subscribe & Save widget on the product page; "Make this a recurring order" toggle at checkout. Admin: Subscriptions page (`/admin/subscriptions`) + sidebar. Backend runs a Vercel daily cron (`/api/subscriptions/process-due`, Bearer `CRON_SECRET`) that auto-creates discounted pending orders, reserves stock, and emails a pay-now link. See backend ROADMAP for the full backend breakdown. **Benefits/Loyalty (points/tiers) still NOT started.**

## Already satisfied / not needed
- **Auto-identifiable currency** — `CurrencyContext` already auto-detects via browser locale (`detectCurrency()` → region→currency, default MUR). Only optional upgrade: IP geolocation.

## Smaller leftover items
- Open/merge the two pushed PRs (`feature/contact-promo-admin-2026-06-14`) — merging to `main` triggers production deploys.
- Data fix: one seeded advert's link is `/petstore` → should be `/petshop` (Admin → Adverts).
- Backend full-suite `npm test` is flaky under combined load (`User.findById` null) — suites pass individually; pre-existing.
- Older: browser walkthrough of Tips/Gallery; repo topology decision; remove duplicate `src/`/`tests/` at the parent root (pending confirmation).

## Conventions to reuse
- **Adverts** power promo/hero cards (placements: banner/sponsored/hero/promo).
- **Cloudinary**: `uploadToCloudinary` (square, products), `uploadBannerToCloudinary` (wide, banners), `uploadMultipleToCloudinary` (galleries/feedback).
- **Admin** pages: shared `DataTable` + `AnimatePresence` `admin-modal*` delete pattern; sidebar in `AdminLayout.jsx`.
- **RichText** `"blog"` preset has inline image upload.
