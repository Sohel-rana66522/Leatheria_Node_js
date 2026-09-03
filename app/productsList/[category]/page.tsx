import type { Metadata } from "next";
import { Suspense } from "react";
import { fetchAllProducts } from "@/lib/firebase/products";
import { CATEGORIES } from "@/models/types";
import { ProductListClient } from "./ProductListClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: raw } = await params;
  const category = decodeURIComponent(raw);
  const known = CATEGORIES.find((c) => c.id === category);
  const title = known ? known.title : category;
  return {
    title,
    description: `Shop ${title} at Leatheria — premium handcrafted leather goods, fast delivery in Bangladesh.`,
    alternates: { canonical: `/productsList/${encodeURIComponent(category)}` },
  };
}

export default async function ProductListPage({ params }: Props) {
  const { category: raw } = await params;
  const category = decodeURIComponent(raw);
  const products = await fetchAllProducts();

  return (
    <Suspense fallback={null}>
      <ProductListClient category={category} products={products} />
    </Suspense>
  );
}
