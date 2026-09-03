import { addDoc, collection, Timestamp } from "firebase/firestore";
import { getDb } from "./client";
import type { CartItem, Order } from "@/models/types";

const ORDERS_COLLECTION = "orders";

export interface PlaceOrderInput {
  key: string; // name + phone, see users.ts userKey()
  name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  items: CartItem[];
  totalAmount: number; // product subtotal + shipping, matches OrderModel.totalAmount
}

/**
 * Creates an order document. Doc ID is Firestore's auto-generated ID; the
 * `id` FIELD inside the document is name+phone (the same convention as the
 * `users` doc ID) and is what "my orders" is queried by. Matches
 * OrderModel.toMap() in the Flutter app exactly. See MIGRATION_PLAN.md §5.5.
 */
export async function placeOrder(input: PlaceOrderInput): Promise<string> {
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
    totalAmount: input.totalAmount,
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
