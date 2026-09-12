// Centralized delivery-fee configuration. Values preserved from the
// project's existing shipping-fee setup (previously a manually-selected
// radio group in checkout — see MIGRATION_PLAN.md addendum for how this was
// refactored into automatic, city-based selection).
//
// The customer's delivery destination is the existing checkout "City"
// field (models/types.ts CITIES: Dhaka, Chittagong, Khulna, Rajshahi,
// Sylhet) — there is no separate "Dhaka Sub Urban" option in that list, so
// that historic middle tier has no city that can automatically resolve to
// it today. Its fee is kept here (not deleted) so it's a one-line change to
// wire up later if the City list ever grows a matching option — see the
// addendum for why this wasn't silently dropped or silently merged into
// one of the other two tiers.
export interface DeliveryZone {
  /** Display name shown to the customer next to the computed fee. */
  name: string;
  /** Exact values from CITIES (models/types.ts) that resolve to this zone. */
  cities: string[];
  /** Fee in ৳ (BDT). */
  fee: number;
}

export const DELIVERY_ZONES: DeliveryZone[] = [
  { name: "Dhaka City", cities: ["Dhaka"], fee: 70 },
  { name: "Dhaka Sub Urban", cities: [], fee: 100 },
  { name: "Outside Dhaka", cities: ["Chittagong", "Khulna", "Rajshahi", "Sylhet"], fee: 120 },
];

// Explicit fallback for any city that doesn't match a configured zone
// (requirement: never silently charge nothing, or the wrong thing, for an
// unrecognized location). "Outside Dhaka" is both the documented fallback
// and the existing app's own previous default shipment selection.
export const FALLBACK_ZONE: DeliveryZone = DELIVERY_ZONES.find((z) => z.name === "Outside Dhaka")!;

/**
 * Resolves a customer's delivery fee from their checkout city. Single
 * source of truth — used identically on the client (for the live order
 * summary) and on the server (to compute the trusted, final order total;
 * see lib/firebase/orders.ts).
 */
export function getDeliveryFee(city: string): { zoneName: string; fee: number } {
  const zone = DELIVERY_ZONES.find((z) => z.cities.includes(city));
  const resolved = zone ?? FALLBACK_ZONE;
  return { zoneName: resolved.name, fee: resolved.fee };
}
