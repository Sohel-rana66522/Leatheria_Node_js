import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchProductById } from "@/lib/firebase/products";
import { ProductDetailClient } from "./ProductDetailClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProductById(id);
  if (!product) {
    return { title: "Product not found" };
  }
  const description = product.description || `${product.name} — premium leather goods from Leatheria.`;
  return {
    title: product.name,
    description,
    alternates: { canonical: `/product/${id}` },
    openGraph: {
      title: product.name,
      description,
      images: product.imageUrl ? [product.imageUrl] : undefined,
      type: "website",
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = await fetchProductById(id);

  if (!product) {
    notFound();
  }

  // Structured data built only from what's actually in Firestore — no
  // invented price/availability/brand/ratings, per the migration brief's
  // Phase 8 instruction.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || undefined,
    image: product.imageUrls.length > 0 ? product.imageUrls : product.imageUrl ? [product.imageUrl] : undefined,
    offers: {
      "@type": "Offer",
      price: product.currentPrice,
      priceCurrency: "BDT",
      availability:
        product.availability === "stock_out"
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
      url: `https://leatheria.vercel.app/product/${product.id}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient product={product} />
    </>
  );
}
