# Leatheria — Migration Test Report

Per Phase 17 of the migration brief: **I have not claimed anything works
that I haven't actually tested.** This sandbox's network egress is
allowlisted to package registries and GitHub only — it cannot reach
`firestore.googleapis.com` or `firebasestorage.googleapis.com`. So every
row below is graded on what I could actually verify here, and every
Firestore-dependent behavior is marked `NOT TESTED (needs your
environment)` rather than assumed to work.

## What was actually run

```bash
npx tsc --noEmit        # → 0 errors
npm run build            # → succeeded (Turbopack, Next.js 16.3.4)
npx eslint . --ext .ts,.tsx   # → 0 errors, 0 warnings
npm run start -p 3001    # → production server smoke test
```

All 8 static/no-Firestore-required routes returned HTTP 200 against the
running production server: `/`, `/about_us`, `/login`, `/signUp`, `/cart`,
`/order_checkout`, `/order_status`, `/robots.txt`. `/sitemap.xml` was
confirmed to render valid XML with the correct URL set (homepage, all 6
categories with `Long%20Wallets`/`Card%20Holders` correctly encoded,
`/about_us`) — it just couldn't include real product URLs in this sandbox
since it couldn't reach Firestore to enumerate `OurProducts`.

The homepage did **not** crash when Firestore was unreachable — it
resolved to an empty snapshot and rendered the existing "Loading
products…" state rather than a 500, which matches the original app's own
documented behavior of showing an indefinite spinner rather than a
distinct error state on fetch failure (see MIGRATION_PLAN.md §5.7).

## Feature-by-feature status

| Feature | Old Flutter | Next.js | Status |
|---|---|---|---|
| `npm run build` / `tsc` / `eslint` | n/a | Pass | **PASS** (actually run, see above) |
| Homepage renders, no crash on Firestore-unreachable | Working | Renders loading state, no crash | **PASS** (actually run) |
| `/about_us` static content | Working | Renders, title/content verified | **PASS** (actually run) |
| `/robots.txt`, `/sitemap.xml` shape | N/A (static file) | Dynamic, correct routes/encoding | **PASS** (actually run) |
| Homepage banners/products load from Firestore | Working | Code written, matches Firestore reads in MIGRATION_PLAN.md §4 | **NOT TESTED** — needs real Firebase env vars |
| Category filter / search / sort | Working (partially — see §5.3 bug) | Code written; sort bug fixed | **NOT TESTED** — needs real product data to verify sort/filter results visually |
| Product detail page + gallery | Working (with a crash risk, §0) | Code written; fetches by doc ID directly (bug fixed) | **NOT TESTED** — needs a real product ID |
| Add to cart / update quantity / remove | Working (no persistence) | Code written; now persists to localStorage | **NOT TESTED end-to-end** — cart state logic has no Firestore dependency so it *should* work identically to the in-browser interactions coded, but I have not clicked through it in a real browser |
| Checkout — existing vs new customer detection | Working | Code written, debounce preserved | **NOT TESTED** — needs a real `users` doc to confirm the lookup round-trips correctly |
| Checkout — order creation | Working | Code written, matches `OrderModel.toMap()` field-for-field | **NOT TESTED** — needs a write-enabled Firestore connection |
| Login (name+phone lookup) | Working | Code written | **NOT TESTED** — same reason |
| Signup | Working (no navigation after success) | Code written, same no-navigation behavior preserved | **NOT TESTED** |
| Order status (live listener) | Working | Code written with `onSnapshot`, same query shape | **NOT TESTED** — needs a logged-in session with real orders |
| SEO metadata per product | Not implemented in Flutter (SPA, no per-route `<title>`) | `generateMetadata` per product, JSON-LD `Product` schema | **NOT TESTED against real data**, but metadata generation code path is exercised by the build and matches Firestore field names in MIGRATION_PLAN.md §3 |
| Responsive 320px–1920px | Working | CSS written with the same breakpoint (840px) the Flutter app used for its own desktop/mobile split | **NOT VISUALLY TESTED** — I have not taken screenshots at each breakpoint; recommend a manual pass in a real browser or Claude Code's browser tooling before shipping |

## Known gaps / things I did NOT do

- **No visual screenshot comparison** was performed against the live Flutter
  site (`https://leatheria.vercel.app`) — I don't have a way to render Flutter
  Web in this sandbox to compare pixel-for-pixel, and the live product data
  is needed to compare product cards/detail pages meaningfully anyway.
- **Firestore security rules were not available to me** (not in the repo).
  I have not confirmed the current rules will permit these exact
  reads/writes from a Next.js origin — check this before deploying.
- **The `/icons/og-image.png` reference is carried over from the original
  `web/index.html`, which itself points at a file that doesn't exist in the
  repo** — the Open Graph image was already broken in production before
  this migration. Worth fixing with a real image, but that's a pre-existing
  gap, not something this migration introduced.
- I did not attempt Firebase Hosting deployment configuration (Phase 19) —
  that needs the real `firebase.json`/hosting setup decision (Next.js on
  Firebase Hosting via web frameworks support, vs. Vercel/another host) and
  should be a deliberate choice on your end given hosting-cost and
  build-pipeline implications, not something to default silently.

## Recommended next steps before this goes live

1. Fill in `.env.local` from `.env.example` with the real Firebase web
   config and run `npm run dev` against the real project, then click
   through every row marked "NOT TESTED" above.
2. Confirm Firestore security rules permit the reads/writes this app makes
   (see MIGRATION_PLAN.md §7, open decision #5).
3. Do a visual side-by-side against the live Flutter site on at least
   mobile (375px) and desktop (1440px) for the homepage, a category page,
   and one product detail page.
4. Decide on Firebase Hosting vs. another deploy target (Phase 19) before
   touching the existing `leatheria.web.app` hosting config.

---

## Addendum — Visual redesign verification

After applying the Stitch "Artisanal Heritage" design system (see
MIGRATION_PLAN.md addendum), the same verification pass was re-run:

```bash
npx tsc --noEmit        # → 0 errors
npx eslint . --ext .ts,.tsx   # → 0 errors, 0 warnings
npm run build            # → succeeded (Turbopack, Next.js 16.3.4)
npm run start -p 3001    # → production server smoke test
```

All 9 routes returned HTTP 200 against the running production server: `/`,
`/about_us`, `/login`, `/signUp`, `/cart`, `/order_checkout`,
`/order_status`, `/robots.txt`, `/sitemap.xml`. I also confirmed the
compiled CSS actually contains the design tokens (`--color-primary:
#26170c`, `.bg-primary{background-color:var(--color-primary)}`, "Playfair
Display" present in the font-face rules) rather than just checking that
Tailwind class *names* appear in the HTML.

**Still not visually verified against real product data or in a real
browser**, for the same reason as before — this sandbox cannot reach
`firestore.googleapis.com`. The redesign is presentation-layer only (no
`lib/firebase/`, context, or server-action code changed), so the data-layer
rows in the original test report table above are unaffected by this pass,
but I have not clicked through the new UI end-to-end with your real
Firestore data. Please repeat the "Recommended next steps" from the
original report against this restyled version — in particular the sidebar
category filter (now checkbox-styled) and the merged order-status/tracking
view are new enough in their interaction pattern to be worth a deliberate
click-through even though their underlying logic didn't change.
