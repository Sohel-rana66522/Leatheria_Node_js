"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product } from "@/models/types";
import { useCart } from "@/context/CartContext";
import { Icon } from "@/components/Icon";

const RETURN_POLICY_TITLE = "রিটার্ন পলিসি";
const RETURN_POLICY_BODY =
  "যদি পণ্য সঠিকভাবে বুঝে পাওয়ার পরেও ব্যক্তিগত কারণে রিটার্ন করতে চান, সেক্ষেত্রে রিটার্ন চার্জ প্রযোজ্য হবে। তবে পণ্যে কোনো ত্রুটি থাকলে, ফ্রি রিটার্ন বা এক্সচেঞ্জের সুযোগ পাবেন।";

export function ProductDetailClient({ product }: { product: Product }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);
  const { addItemWithQuantity } = useCart();
  const router = useRouter();

  const isStockOut = product.availability === "stock_out";
  const images = product.imageUrls.length > 0 ? product.imageUrls : [product.imageUrl];

  function handleAddToCart() {
    addItemWithQuantity(product.id, product.name, product.currentPrice, product.imageUrl, quantity);
    setAddedMessage(`${product.name} added to cart`);
    window.setTimeout(() => setAddedMessage(null), 2500);
  }

  function handleBuyNow() {
    addItemWithQuantity(product.id, product.name, product.currentPrice, product.imageUrl, quantity);
    router.push("/order_checkout");
  }

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile lg:px-gutter w-full pb-section-gap">
      <div className="flex items-center gap-2 py-8 mb-4 flex-wrap">
        <Link href="/" className="text-[11px] font-semibold text-on-surface-variant hover:text-primary transition-colors uppercase tracking-widest">
          Home
        </Link>
        <span className="text-on-surface-variant text-xs">/</span>
        <Link href="/productsList/All" className="text-[11px] font-semibold text-on-surface-variant hover:text-primary transition-colors uppercase tracking-widest">
          Shop
        </Link>
        <span className="text-on-surface-variant text-xs">/</span>
        <Link
          href={`/productsList/${encodeURIComponent(product.category)}`}
          className="text-[11px] font-semibold text-on-surface-variant hover:text-primary transition-colors uppercase tracking-widest"
        >
          {product.category}
        </Link>
        <span className="text-on-surface-variant text-xs">/</span>
        <span className="text-[11px] font-semibold text-primary uppercase tracking-widest">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-16">
        {/* Left: gallery */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          <div className="relative w-full aspect-[4/5] bg-surface-container rounded-xl overflow-hidden shadow-lg">
            {isStockOut && (
              <span className="absolute top-6 left-6 z-20 inline-block bg-error text-on-error text-[11px] font-semibold uppercase px-4 py-1.5 rounded-full shadow-sm tracking-widest">
                Stock Out
              </span>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={images[selectedIndex]} alt={product.name} className="w-full h-full object-cover" />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={() => setSelectedIndex((i) => Math.max(0, i - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-surface/85 backdrop-blur-md flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors shadow-sm"
                >
                  <Icon name="chevron_left" />
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={() => setSelectedIndex((i) => Math.min(images.length - 1, i + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-surface/85 backdrop-blur-md flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors shadow-sm"
                >
                  <Icon name="chevron_right" />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => setSelectedIndex(i)}
                  className={`relative aspect-square bg-surface-container rounded-lg overflow-hidden focus:outline-none ${
                    i === selectedIndex ? "ring-2 ring-primary ring-offset-2 ring-offset-surface" : ""
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: info */}
        <div className="lg:col-span-5 relative">
          <div className="lg:sticky lg:top-32 flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-[0.2em]">
                {product.category}
              </span>
              <h1 className="font-display text-[32px] lg:text-[48px] text-primary leading-[1.05]">{product.name}</h1>
              <div className="flex items-end gap-4 mt-1">
                <span className="font-display text-[28px] lg:text-[32px] text-primary">{product.currentPrice}&#2547;</span>
                {product.oldPrice && (
                  <span className="text-body-md text-on-surface-variant mb-1 line-through decoration-outline-variant">
                    {product.oldPrice}&#2547;
                  </span>
                )}
              </div>
            </div>

            <p className="text-body-lg text-on-surface-variant leading-relaxed">{product.description}</p>

            <div className="w-full h-px bg-outline-variant/30" />

            <fieldset disabled={isStockOut} className="flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="flex items-center justify-between border border-outline-variant rounded-md px-2">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="w-9 h-11 flex items-center justify-center text-primary"
                  >
                    &minus;
                  </button>
                  <span className="w-8 text-center">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    aria-label="Increase quantity"
                    className="w-9 h-11 flex items-center justify-center text-primary"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 bg-primary text-on-primary uppercase text-[13px] font-semibold tracking-wider px-6 transition-all duration-300 hover:bg-inverse-surface disabled:opacity-40"
                >
                  Add to Cart
                </button>
              </div>
              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full border border-primary text-primary uppercase text-[13px] font-semibold tracking-wider py-4 transition-all duration-300 hover:bg-primary hover:text-on-primary disabled:opacity-40"
              >
                Buy Now
              </button>
            </fieldset>
            {isStockOut && <p className="text-error text-[13px]">Currently out of stock.</p>}
            {addedMessage && (
              <p role="status" className="text-[13px] text-secondary">
                {addedMessage}
              </p>
            )}

            {product.feature.length > 0 && (
              <div>
                <h3 className="text-[13px] font-semibold text-primary uppercase tracking-widest border-b border-outline-variant/30 pb-2 mb-4">
                  Features &amp; Functionality
                </h3>
                <ul className="flex flex-col gap-2">
                  {product.feature.map((f, i) => (
                    <li key={i} className="flex gap-2 text-body-md text-on-surface-variant">
                      <Icon name="star" className="text-[16px] text-bronze-accent" filled />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-body-md text-on-surface-variant">
                <Icon name="check_circle" className="text-[18px] text-secondary" filled />
                <span>অগ্রিম টাকা ছাড়াই অর্ডার করতে পারবেন।</span>
              </div>
              <div className="flex items-center gap-2 text-body-md text-on-surface-variant">
                <Icon name="check_circle" className="text-[18px] text-secondary" filled />
                <span>পণ্য চেক করে টাকা পরিশোধ করতে পারবেন।</span>
              </div>
            </div>

            <div>
              <h3 className="text-[13px] font-semibold text-primary uppercase tracking-widest border-b border-outline-variant/30 pb-2 mb-3">
                {RETURN_POLICY_TITLE}
              </h3>
              <p className="text-body-md text-on-surface-variant leading-relaxed">{RETURN_POLICY_BODY}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
