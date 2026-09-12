// Lightweight, heuristic address/delivery-city consistency check.
//
// This project has no address-verification or geocoding service (checked
// before writing this — nothing in lib/firebase/ or anywhere else does
// this), and this task explicitly says not to introduce a large new system
// for it. So this is a plain-text heuristic: it looks for whether the
// selected delivery city/district is mentioned in the typed address, and
// separately whether some *other* recognizable Bangladeshi city/district is
// mentioned instead. It is NOT proof of anything about the address — it
// can't be, from text alone — so it only ever produces a soft, advisory
// warning or nothing at all. It must never claim an address is "verified"
// (only that no likely mismatch was found) and never claim one is
// definitely wrong (only that it "may not match").
const KNOWN_BD_LOCATIONS = [
  "dhaka",
  "savar",
  "gazipur",
  "narayanganj",
  "keraniganj",
  "chittagong",
  "chattogram",
  "khulna",
  "rajshahi",
  "sylhet",
  "rangpur",
  "barisal",
  "barishal",
  "mymensingh",
  "comilla",
  "cumilla",
  "bogra",
  "bogura",
  "jessore",
  "jashore",
  "dinajpur",
  "tangail",
  "narsingdi",
  "faridpur",
  "noakhali",
  "coxs bazar",
  "cox's bazar",
];

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

export interface AddressCheckResult {
  consistent: boolean;
  /** Advisory message to show the customer, or null if nothing to flag. */
  message: string | null;
}

/**
 * Checks whether a typed address appears consistent with the selected
 * delivery city/district. Purely advisory — never used to block order
 * submission, and never claims certainty in either direction.
 */
export function checkAddressConsistency(address: string, deliveryCity: string): AddressCheckResult {
  const normalizedAddress = normalize(address);
  const normalizedCity = normalize(deliveryCity);

  // Nothing to compare yet.
  if (!normalizedAddress || !normalizedCity) {
    return { consistent: true, message: null };
  }

  // The selected city/district is mentioned in the address — consistent.
  if (normalizedAddress.includes(normalizedCity)) {
    return { consistent: true, message: null };
  }

  // The address doesn't mention the selected city, but does mention some
  // *other* recognizable location — likely mismatch, worth a nudge.
  const mentionsOtherKnownLocation = KNOWN_BD_LOCATIONS.some(
    (loc) => loc !== normalizedCity && normalizedAddress.includes(loc),
  );
  if (mentionsOtherKnownLocation) {
    return {
      consistent: false,
      message: `The address may not match the selected delivery city/district ("${deliveryCity}"). Please verify it.`,
    };
  }

  // Address doesn't clearly mention the selected city OR any other known
  // location — genuinely ambiguous (e.g. a house/road name with no city
  // name at all), not a confident mismatch, so no warning. Avoids false
  // positives on perfectly normal addresses that just don't spell out the
  // city.
  return { consistent: true, message: null };
}
