# Session Handoff — 2026-06-14 (frontend)

Snapshot of work done this session so another developer can pick up. Full designs/plans are in `docs/superpowers/specs/` and `docs/superpowers/plans/`.

> Backend changes for these features live in the separate **backend** repo (see its `HANDOFF.md`). Frontend talks to the backend via `VITE_NODE_API_URL` (`.env`, defaults to `http://localhost:5000/api`).

## Features in this branch

### 1. Featured Products carousel (HomePage) — *already on main*
`src/Pages/HomePage/HomePageSections/FeaturedProductSection.jsx` is an embla carousel (3/2/1.2 cols, arrows, dots, drag, reduced-motion-aware autoplay via `featuredAutoplay.js`), loads up to 100 featured items. Dep: `embla-carousel-autoplay`.

### 2. Gallery (mini-blog) — *already on main*
`src/Pages/Gallery/*` (list + detail + card), `src/Pages/Admin/Gallery/*` (CRUD), `galleryApi.js`, RichText `"blog"` preset with inline image upload (`@tiptap/extension-image`). Routes `/gallery`, `/gallery/:slug`, `/admin/gallery`.

### 3. Promo banner carousel → admin-managed (this branch)
- `PromoBannerCarousel.jsx` now fetches active **`hero`** adverts (sorted by `order`), renders clickable slides, **hides when empty**; full-bleed width. Removed the 18 hardcoded brand imports.
- `AdminAdverts.jsx`: placement now includes **Banner / Sponsored / Homepage carousel (hero) / Contact promo**; **image upload** (Cloudinary) + URL fallback + preview; `order` field; link optional for hero/promo; **delete uses the system modal** (no more `window.confirm`).
- `advertsApi.uploadImage()` added.

### 4. Contact Page + Map + Socials (this branch)
- `src/Pages/Contact/ContactPage.jsx` (+`Contact.css`) — `/contact` route + nav link enabled. Hero, contact form (→ `POST /api/contact`), rotating **promo card** (driven by `promo` adverts), and a map.
- `src/Components/Common/GoogleMap.jsx` — **reusable**, no-API-key iframe; `CLINIC_LOCATION` default (Vitalpaws clinic, from the Find-Us link). Has a test.
- `Footer.jsx` socials → WhatsApp `wa.me/23057580480`, TikTok `@vitalpawsmru`, Instagram `@vitalpawsmru`, Facebook (share link). (YouTube removed.)
- `src/Pages/Admin/Contacts/AdminContacts.jsx` — admin inbox (`/admin/contacts` + sidebar): list, view modal, status cycle (new→read→replied), delete. `contactApi.js`. **This same inbox also receives the homepage question-form submissions.**

## How to run / verify
```bash
npm install        # picks up embla-carousel-autoplay + @tiptap/extension-image
npm run dev        # needs the backend running (see backend repo)
npm test           # 64 tests, all passing
npm run build      # clean
```

## State & caveats
- **64 frontend tests pass; build clean.**
- Social URLs are live. Map needs no API key.
- Contact promo card + hero adverts are managed under **Admin → Adverts** (placement "Homepage carousel" or "Contact promo").
- Homepage promo carousel/contact card only fetch **on page load** — admin edits require a page refresh to show.

## Not yet started (roadmap)
- **Homepage Engagement**: question-form ↔ write-feedback **tabs**; a Feedback/testimonials feature (photo upload, admin moderation, "What Our Clients Say" on homepage).
- **Discounts / On-Sale** on products.
- **Recurring orders + benefits/loyalty** (largest — needs its own decomposition).
- "Auto currency" is already handled by `CurrencyContext` (browser-locale detection).
