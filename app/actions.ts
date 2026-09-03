"use server";

import { getUserByKey, saveUser, userKey } from "@/lib/firebase/users";
import { placeOrder as placeOrderInDb, type PlaceOrderInput } from "@/lib/firebase/orders";
import type { UserProfile } from "@/models/types";

/**
 * Existing-vs-new customer lookup, used by the checkout name/phone fields
 * (debounced client-side) and the login page. Matches
 * CartProvider.checkExistingUser / AuthProvider.login in the Flutter app.
 */
export async function checkExistingUser(name: string, phone: string): Promise<UserProfile | null> {
  if (!name.trim() || phone.trim().length < 11) return null;
  return getUserByKey(name.trim(), phone.trim());
}

/**
 * Creates a new user account. Matches CartProvider.createUserAccount /
 * AuthProvider.saveUser — the write path actually reachable from the live
 * checkout and signup flows (see MIGRATION_PLAN.md §5.5 for the other,
 * unreachable write path in the original app that was intentionally not
 * ported).
 */
export async function createUserAccount(input: {
  name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
}): Promise<UserProfile> {
  const user: UserProfile = {
    id: userKey(input.name, input.phone),
    name: input.name,
    phone: input.phone,
    email: input.email,
    city: input.city,
    address: input.address,
  };
  await saveUser(user);
  return user;
}

export async function placeOrderAction(
  input: PlaceOrderInput,
): Promise<{ success: true; orderId: string } | { success: false; error: string }> {
  try {
    const orderId = await placeOrderInDb(input);
    return { success: true, orderId };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to place order" };
  }
}
