
---

## Addendum — Visual redesign (Stitch "Artisanal Heritage" design system)

After the initial functional migration above, the visual design was replaced
with the design system from `Leatheria_Node_js` (a set of Stitch-generated
static HTML mockups: shop grid, product detail, cart, checkout, login,
signup, order tracking, customer profile) — its `DESIGN.md` describes an
"Artisanal Heritage" system: Playfair Display (serif headlines) + Montserrat
(sans body/UI), an espresso/cream/bronze color palette, generous editorial
spacing, and soft (4px–8px) border radii.

**What changed:** every page and shared component (`Header`, `Footer`,
`ProductCard`, `ProductGrid`, homepage hero, product listing sidebar filter,
product detail gallery/info panel, cart, checkout, login/signup, order
status) was restyled with Tailwind CSS v4 using tokens ported 1:1 from
`DESIGN.md` into `app/globals.css`'s `@theme` block. The plain-CSS
stylesheet from the first pass was removed.

**What did NOT change:** `CartContext`, `AuthContext`, `app/actions.ts`
(server actions), everything in `lib/firebase/`, and `models/types.ts` are
untouched — same Firestore collections, same document shapes, same cart
persistence/sort-fix/auth/product-fetch decisions documented above. This was
a presentation-layer-only change.

**Adaptations made because the mockups used placeholder content our real
data doesn't have:**
- The mockups show color-swatch selectors, monogramming, and star ratings on
  the product detail page — `OurProducts` documents have none of these
  fields, so they were left out rather than faked.
- The mockup's category filter sidebar uses independent checkboxes (multi-
  select); our routing model is one category per URL
  (`/productsList/:category`), so the checkboxes are styled identically but
  behave as a single-select that navigates, preserving the existing
  one-category-per-page URL structure from Phase 4.
- The mockup's "Customer Profile" (order list + profile sidebar) and "Order
  Tracking" (status timeline) were two separate mockup pages; they were
  merged into one `/order_status` page (list + a timeline detail view on
  click), since that's the one route the original Flutter app has for this.
  The timeline maps `orderStatus` against a `Placed → Processing → Shipped →
  Delivered` sequence for display purposes only — the underlying data is
  still just the single `orderStatus` string field, unchanged.
- Added a functional header search (submits to
  `/productsList/All?q=<term>`, read via `useSearchParams` on that page) —
  the mockup's header has a search icon with no wired behavior; this makes
  it a real feature rather than decorative chrome, without altering any
  existing search logic (it just seeds the same client-side search state
  Phase 5.3 already documents).

---

## Addendum 2 — Checkout auto-fill for logged-in users

Added: when `/order_checkout` loads and a customer is already logged in
(`AuthContext.isAuth`), the Full Name, Phone, Email, City, and Address
fields are pre-filled from that customer's existing profile.

**Data source (the actual one found in this project — not Firebase
Authentication, which this app doesn't use; see §5.6 above):**

```text
AuthContext.user  (already a full UserProfile: name, phone, email, city, address)
       ↓
comes from the existing `users/{name+phone}` Firestore document
(via checkExistingUser / login / signup / checkout-account-creation —
all of which already read or write this same document)
       ↓
Checkout form fields
```

No new fetch, collection, or document shape was introduced — `AuthContext`
already held the complete profile object; the only change was reading it
into the checkout form's existing `name`/`phone`/`email`/`city`/`address`
state on mount.

**Files changed:** `app/order_checkout/page.tsx` only.
- Added a `touchedRef` (one boolean per field) set on that field's existing
  `onChange`, so autofill never overwrites something the customer already
  typed — including if they start typing during the brief window before the
  autofill effect runs.
- Added one `useEffect` that fills any untouched, currently-empty field from
  `user` the first time a given logged-in user's data becomes available,
  guarded so it doesn't re-run on unrelated re-renders.
- No JSX/markup, styling, or Tailwind classes changed — every input still
  renders exactly as it did before; only its initial value can now come
  from `user` instead of always starting blank.

**Important discrepancy worth flagging:** because `AuthContext` is
deliberately NOT persisted across a page refresh (a decision documented in
§5.6, made to match the original Flutter app's own in-memory-only "login"
behavior), refreshing the checkout page while logged in logs the customer
out again, same as it always has — the autofill won't reappear after a
refresh, because from the app's point of view nobody is logged in anymore
after a refresh. That's existing behavior, not something this change
altered; making autofill survive a refresh would require adding session
persistence to `AuthContext`, which is a separate decision outside this
task's scope (see §7, open decision #3).
