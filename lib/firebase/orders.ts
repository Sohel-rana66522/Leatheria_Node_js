import { addDoc, collection, Timestamp } from "firebase/firestore";
import { getDb } from "./client";
import { getDeliveryFee } from "@/lib/delivery";
import type { CartItem, Order } from "@/models/types";

const ORDERS_COLLECTION = "orders";

export interface PlaceOrderInput {
  key: string; // name + phone, see users.ts userKey()
  name: string;
  phone: string;
  email: string;
  // Actual delivery destination to persist on the order (and, from the
  // checkout page, on the customer's profile) — e.g. "Dhaka", "Savar", or,
  // when the "Outside Dhaka" zone was picked, the customer's typed district
  // (e.g. "Chittagong"), never the literal string "Outside Dhaka" unless
  // they left the district blank. This is what the existing Order/UserModel
  // `city` field has always meant: the real destination city.
  city: string;
  // The delivery-fee ZONE the customer selected in the checkout dropdown
  // (one of CHECKOUT_DELIVERY_ZONE_OPTIONS in models/types.ts — "Dhaka",
  // "Savar", "Gazipur", "Narayanganj", "Keraniganj", or "Outside Dhaka").
  // Kept separate from `city` on purpose: the fee only depends on which
  // zone was picked, never on the free-text district typed for "Outside
  // Dhaka", so a customer can't affect their delivery fee by what they type
  // in that field.
  deliveryZone: string;
  address: string;
  items: CartItem[];
  // NOTE: no `totalAmount` field here — see below. Trusting a number the
  // browser sends for the amount to charge/record would let a customer
  // edit that value before submitting; the total is computed inside
  // placeOrder() itself instead, from `items` and `deliveryZone`, so this
  // function is the trusted point that produces the final amount, not a
  // passthrough of whatever the client calculated for display purposes.
}

/**
 * Creates an order document. Doc ID is Firestore's auto-generated ID; the
 * `id` FIELD inside the document is name+phone (the same convention as the
 * `users` doc ID) and is what "my orders" is queried by. Matches
 * OrderModel.toMap() in the Flutter app exactly. See MIGRATION_PLAN.md §5.5.
 *
 * `totalAmount` = product subtotal (recomputed here from `items`, not
 * trusted from the caller) + delivery fee (resolved here from
 * `deliveryZone`, not from `city` — see PlaceOrderInput above — via the
 * same lib/delivery.ts config the checkout UI uses for its live display) —
 * see MIGRATION_PLAN.md addendum on automatic delivery fees.
 */
export async function placeOrder(input: PlaceOrderInput): Promise<string> {
  const subtotal = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const { fee: deliveryFee } = getDeliveryFee(input.deliveryZone);
  const totalAmount = subtotal + deliveryFee;

  const docRef = await addDoc(collection(getDb(), ORDERS_COLLECTION), {
    id: input.key,
    name: input.name,
    phone: input.phone,
    email: input.email,
    city: input.city,
    address: input.address,
    orderStatus: "Placed",
    items: input.items.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
      quantity: item.quantity,
    })),
    totalAmount,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export function toOrder(docId: string, data: Record<string, unknown>): Order {
  const createdAt = data.createdAt as Timestamp | undefined;
  return {
    docId,
    id: (data.id as string) ?? "",
    name: (data.name as string) ?? "",
    phone: (data.phone as string) ?? "",
    email: (data.email as string) ?? "",
    city: (data.city as string) ?? "",
    address: (data.address as string) ?? "",
    orderStatus: (data.orderStatus as string) ?? "",
    items: Array.isArray(data.items) ? (data.items as Order["items"]) : [],
    totalAmount: Number(data.totalAmount ?? 0),
    createdAt: createdAt ? createdAt.toDate() : new Date(0),
  };
}

export { ORDERS_COLLECTION };
