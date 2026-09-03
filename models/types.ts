// Mirrors lib/models/*.dart exactly, including field-name quirks. See
// MIGRATION_PLAN.md §3 for the source-of-truth notes on each of these.

export interface Product {
  id: string; // Firestore doc ID
  pId: string; // separate "product id" field stored inside the doc
  name: string;
  availability: string; // 'available' | 'stock_out' | free text
  oldPrice: string; // stored as a string in Firestore, display-only
  category: string; // must exactly match a CATEGORY id below
  currentPrice: number;
  imageUrl: string;
  imageUrls: string[];
  description: string;
  feature: string[]; // Firestore field is "features" (plural) — mapped in lib/firebase/products.ts
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

export interface Order {
  docId: string; // Firestore auto-generated document ID
  id: string; // = name + phone, used as the "my orders" query key — NOT the doc ID
  name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  orderStatus: string;
  items: OrderItem[];
  totalAmount: number;
  createdAt: Date;
}

export interface UserProfile {
  id: string; // = name + phone, and IS the Firestore doc ID for `users`
  name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
}

export interface Category {
  id: string;
  title: string;
  imgSrc: string; // local asset, same category images as the Flutter app
}

export interface BannerImage {
  link: string;
}

// Hard-coded in the Flutter app (lib/providers/categoryList.dart /
// products_provider.dart) — not read from Firestore. Keep in sync with the
// exact strings stored in each product's `category` field.
export const CATEGORIES: Category[] = [
  { id: "All", title: "All Products", imgSrc: "/category/All_products.png" },
  { id: "Bags", title: "Bags", imgSrc: "/category/bag.jpg" },
  { id: "Belts", title: "Belts", imgSrc: "/category/belts.jpg" },
  { id: "Wallets", title: "Wallets", imgSrc: "/category/bifold_wallets.jpg" },
  { id: "Long Wallets", title: "Long Wallets", imgSrc: "/category/long_wallets.jpg" },
  { id: "Card Holders", title: "Card Holders", imgSrc: "/category/card_holders.jpg" },
];

export const SORT_OPTIONS = [
  "Newest",
  "Oldest",
  "Price: Low to High",
  "Price: High to Low",
  "Name A-Z",
  "Name Z-A",
] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

// Fixed list used by both the checkout city dropdown and the signup/login
// city dropdown in the Flutter app (identical lists, kept as one here).
export const CITIES = ["Dhaka", "Chittagong", "Khulna", "Rajshahi", "Sylhet"];

export type ShipmentOption = "outside" | "suburban" | "city";

export const SHIPPING_COSTS: Record<ShipmentOption, number> = {
  outside: 120,
  suburban: 100,
  city: 70,
};

export const SHIPPING_LABELS: Record<ShipmentOption, string> = {
  outside: "Outside Dhaka: 120৳",
  suburban: "Dhaka Sub Urban: 100৳",
  city: "Dhaka City: 70৳",
};
