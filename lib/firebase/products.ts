import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { getDb } from "./client";
import type { BannerImage, Product, SortOption } from "@/models/types";

// Collection names are exact matches to the Flutter app — do not rename.
const PRODUCTS_COLLECTION = "OurProducts";
const BANNERS_COLLECTION = "BannerImg";

function toProduct(id: string, data: Record<string, unknown>): Product {
  return {
    id,
    pId: (data.pId as string) ?? "",
    name: (data.name as string) ?? "",
    availability: (data.availability as string) ?? "",
    oldPrice: (data.oldPrice as string) ?? "",
    currentPrice: Number(data.currentPrice ?? 0),
    category: (data.category as string) ?? "",
    imageUrl: (data.imageUrl as string) ?? "",
    imageUrls: Array.isArray(data.imageUrls) ? (data.imageUrls as string[]) : [],
    description: (data.description as string) ?? "",
    // Firestore field is "features" (plural) — Dart's model calls it
    // `feature` (singular). Preserved here, see MIGRATION_PLAN.md §3.
    feature: Array.isArray(data.features) ? (data.features as string[]) : [],
  };
}

/**
 * Fetches the entire OurProducts collection, same as the Flutter app (no
 * pagination, no server-side category filter — see MIGRATION_PLAN.md §4).
 */
export async function fetchAllProducts(): Promise<Product[]> {
  const snapshot = await getDocs(collection(getDb(), PRODUCTS_COLLECTION));
  return snapshot.docs.map((doc) => toProduct(doc.id, doc.data()));
}

/**
 * Fetches a single product directly by its Firestore doc ID.
 *
 * NOTE (bug fix): the original Flutter app (ProductViewScreen) instead
 * fetched the ENTIRE product collection and did `.firstWhere(id: ...)` with
 * no `orElse`, which threw an uncaught error whenever the detail page was
 * opened directly (a bookmark, a shared link, or any search-engine crawl)
 * before the full list had finished loading — exactly the pages Phase 7/8
 * SEO work in the migration brief cares most about. Fetching by ID directly
 * avoids the race entirely and is also strictly fewer reads. See
 * MIGRATION_PLAN.md §0/§5.7.
 */
export async function fetchProductById(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(getDb(), PRODUCTS_COLLECTION, id));
  if (!snap.exists()) return null;
  return toProduct(snap.id, snap.data());
}

export async function fetchBanners(): Promise<BannerImage[]> {
  const snapshot = await getDocs(collection(getDb(), BANNERS_COLLECTION));
  return snapshot.docs.map((doc) => ({ link: (doc.data().link as string) ?? "" }));
}

/**
 * Category filter + search + sort, matching ProductsProvider.filtered() in
 * the Flutter app — with two fixes called out in MIGRATION_PLAN.md §5.3
 * (approved as recommended defaults, flagged here again for visibility):
 *   - Price sorting now actually works (the original had a string-matching
 *     bug — "Price: Low to High" vs "Price Low to High" — that made it a
 *     silent no-op).
 *   - "Newest"/"Oldest" fall back to Firestore's natural document order
 *     (and its reverse) because product documents carry no timestamp field
 *     to sort by, and adding one would mean changing the existing Firestore
 *     schema, which the migration brief explicitly rules out.
 */
export function filterAndSortProducts(
  products: Product[],
  {
    category,
    searchText,
    sort,
  }: { category: string; searchText: string; sort: SortOption },
): Product[] {
  let result = category === "All" ? products : products.filter((p) => p.category === category);

  if (searchText.trim()) {
    const needle = searchText.trim().toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(needle));
  }

  result = [...result];
  switch (sort) {
    case "Price: Low to High":
      result.sort((a, b) => a.currentPrice - b.currentPrice);
      break;
    case "Price: High to Low":
      result.sort((a, b) => b.currentPrice - a.currentPrice);
      break;
    case "Name A-Z":
      result.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "Name Z-A":
      result.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case "Oldest":
      result.reverse();
      break;
    case "Newest":
    default:
      break;
  }

  return result;
}
