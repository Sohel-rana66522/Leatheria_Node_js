import { doc, getDoc, setDoc } from "firebase/firestore";
import { getDb } from "./client";
import type { UserProfile } from "@/models/types";

const USERS_COLLECTION = "users";

// Same convention as the Flutter app: no separate account system, no
// password — a customer's identity is just name + phone concatenated with
// no separator. Preserved exactly so existing customers' order history
// stays reachable after migration. See MIGRATION_PLAN.md §5.5/§5.6.
export function userKey(name: string, phone: string): string {
  return `${name}${phone}`;
}

function toUserProfile(id: string, data: Record<string, unknown>): UserProfile {
  return {
    id,
    name: (data.name as string) ?? "",
    phone: (data.phone as string) ?? "",
    email: (data.email as string) ?? "",
    city: (data.city as string) ?? "",
    address: (data.address as string) ?? "",
  };
}

export async function getUserByKey(name: string, phone: string): Promise<UserProfile | null> {
  const id = userKey(name, phone);
  const snap = await getDoc(doc(getDb(), USERS_COLLECTION, id));
  if (!snap.exists()) return null;
  return toUserProfile(snap.id, snap.data());
}

export async function getUserById(id: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(getDb(), USERS_COLLECTION, id));
  if (!snap.exists()) return null;
  return toUserProfile(snap.id, snap.data());
}

/**
 * Creates/overwrites a user document. Matches the shape written by
 * CartProvider.createUserAccount in the Flutter app (no `createdAt` field —
 * that's the write path actually reachable from checkout; the other one,
 * AuthProvider.saveUser1, is dead code in the original app and was not
 * ported). See MIGRATION_PLAN.md §5.5.
 */
export async function saveUser(user: UserProfile): Promise<void> {
  await setDoc(doc(getDb(), USERS_COLLECTION, user.id), {
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    city: user.city,
    address: user.address,
  });
}
