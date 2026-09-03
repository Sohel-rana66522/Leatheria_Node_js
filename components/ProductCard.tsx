"use client";

import Link from "next/link";
import type { Product } from "@/models/types";
import { useCart } from "@/context/CartContext";
import { Icon } from "./Icon";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const isStockOut = product.availability === "stock_out";
  const isAvailable = product.availability === "available";

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    // NOTE (bug fix, see MIGRATION_PLAN.md): standardized on the Firestore
    // doc ID as the cart-item ID everywhere, rather than the original app's
    // inconsistent product.pId vs. doc-ID usage between entry points.
    addItem(product.id, product.name, product.currentPrice, product.imageUrl);
  }

  return (
    <Link href={`/product/${product.id}`} className="group flex flex-col">
      <div className="relative w-full aspect-[4/5] bg-surface-container-low overflow-hidden mb-4">
        {isStockOut && (
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-primary/90 backdrop-blur-sm text-on-primary text-[10px] font-semibold uppercase tracking-widest px-3 py-1">
              Stock Out
            </span>
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        {isAvailable && (
          <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out bg-gradient-to-t from-primary/80 to-transparent flex justify-center">
            <button
              type="button"
              onClick={handleAddToCart}
              className="text-on-primary text-[13px] font-semibold uppercase tracking-widest flex items-center gap-2 hover:text-bronze-accent transition-colors"
            >
              <Icon name="add_shopping_cart" className="text-[18px]" />
              Add to Cart
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-col items-center text-center px-2">
        <h3 className="font-display text-[20px] text-primary mb-1 group-hover:text-bronze-accent transition-colors line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          {product.oldPrice && (
            <span className="text-body-md text-on-surface-variant/60 line-through">{product.oldPrice}&#2547;</span>
          )}
          <span className="text-body-md text-on-surface-variant">{product.currentPrice}&#2547;</span>
        </div>
      </div>
    </Link>
  );
}
