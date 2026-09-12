// Centralized delivery-fee configuration — single source of truth used by
// both the checkout UI (live order-summary display) and order creation
// (lib/firebase/orders.ts, the trusted server-side calculation). See
// MIGRATION_PLAN.md addendum for history.
//
// Current rules (parcels up to 500g — no product-weight calculation yet):
//   Dhaka City                                    -> ৳60
//   Dhaka Suburbs (Savar/Gazipur/Narayanganj/Keraniganj) -> ৳80
//   Outside Dhaka (selected explicitly, with a typed city/district)  -> ৳120
//
// The checkout "City" dropdown (models/types.ts CITIES) now lists exactly:
// Dhaka, Savar, Gazipur, Narayanganj, Keraniganj, Outside Dhaka — selecting
// "Outside Dhaka" reveals a free-text "Delivery City / District" field in
// the checkout page (the actual typed district is what gets persisted as
// the order/profile's `city`; this zone config only ever sees the zone
// selection itself for fee purposes — see app/order_checkout/page.tsx and
// lib/firebase/orders.ts for how the two are kept separate on purpose).
export interface DeliveryZone {
  /** Display name shown to the customer next to the computed fee. */
  name: string;
  /** Normalized (trimmed, lowercased) city/zone names that resolve to this zone. */
  cities: string[];
  /** Fee in ৳ (BDT), for parcels up to 500g. */
  fee: number;
}

function normalizeCity(city: string): string {
  return city.trim().toLowerCase();
}

export const DELIVERY_ZONES: DeliveryZone[] = [
  { name: "Dhaka City", cities: ["dhaka"], fee: 60 },
  { name: "Dhaka Suburbs", cities: ["savar", "gazipur", "narayanganj", "keraniganj"], fee: 80 },
  { name: "Outside Dhaka", cities: ["outside dhaka"], fee: 120 },
];

// Fallback for any non-empty city/zone value that doesn't match a
// configured zone — never silently charge nothing for an unrecognized (but
// selected) value.
export const FALLBACK_ZONE: DeliveryZone = DELIVERY_ZONES.find((z) => z.name === "Outside Dhaka")!;

/**
 * Resolves a delivery fee from a zone/city value.
 *
 * - Matching is done on a normalized (trimmed + lowercased) value, so
 *   "Dhaka" / "dhaka" / "DHAKA" / " Dhaka" all match identically — exact
 *   equality only, no substring matching.
 * - An empty/unselected value returns a ৳0 fee rather than guessing — the
 *   checkout City dropdown always defaults to CITIES[0] ("Dhaka"), so this
 *   branch is a defensive fallback, not something the current checkout UI
 *   hits today.
 * - Any other non-empty value resolves to the Outside Dhaka fee (see
 *   FALLBACK_ZONE) — never a fake/guessed zone.
 *
 * IMPORTANT: pass the *zone selection* here (one of the CITIES dropdown
 * values), not a freely-typed district name — when "Outside Dhaka" is
 * selected, the customer's actual typed district is a separate value (see
 * the checkout page's `deliveryDistrict` state) that must NOT be passed to
 * this function for fee calculation, since fee only depends on which zone
 * was picked, not which specific district within it.
 */
export function getDeliveryFee(city: string): { zoneName: string; fee: number } {
  const normalized = normalizeCity(city ?? "");
  if (!normalized) {
    return { zoneName: "Not selected", fee: 0 };
  }
  const zone = DELIVERY_ZONES.find((z) => z.cities.includes(normalized));
  const resolved = zone ?? FALLBACK_ZONE;
  return { zoneName: resolved.name, fee: resolved.fee };
}

// Maps a normalized city name back to the exact display string used in the
// CITIES dropdown (models/types.ts) — used only to canonicalize a saved
// profile's city into a valid dropdown value for autofill (e.g. a profile
// saved with city "savar" or "SAVAR" should still select the "Savar"
// option). Returns null for anything that isn't one of the five named
// zones (Dhaka + the four suburbs) — including "Outside Dhaka" itself and
// any other district name — so the caller can tell "known Dhaka-area city"
// apart from "needs the Outside Dhaka + district flow" apart from "not one
// of our dropdown values at all".
const KNOWN_CITY_DISPLAY_BY_NORMALIZED: Record<string, string> = {
  dhaka: "Dhaka",
  savar: "Savar",
  gazipur: "Gazipur",
  narayanganj: "Narayanganj",
  keraniganj: "Keraniganj",
};

export function canonicalizeKnownCity(city: string): string | null {
  return KNOWN_CITY_DISPLAY_BY_NORMALIZED[normalizeCity(city ?? "")] ?? null;
}
