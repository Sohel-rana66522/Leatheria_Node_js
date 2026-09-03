import type { Product } from "@/models/types";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products, limit }: { products: Product[]; limit?: number }) {
  const shown = limit ? products.slice(0, limit) : products;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
      {shown.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
