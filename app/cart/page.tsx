"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Icon } from "@/components/Icon";

export default function CartPage() {
  const { items, totalAmount, addItem, removeSingleItem, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-container-max mx-auto px-margin-mobile lg:px-gutter py-24 flex flex-col items-center text-center gap-6">
        <Icon name="shopping_bag" className="text-[40px] text-on-surface-variant" />
        <p className="text-body-lg text-on-surface-variant">Your cart is empty</p>
        <Link
          href="/productsList/All"
          className="bg-primary text-on-primary px-8 py-3 uppercase text-[13px] font-semibold tracking-wider"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile lg:px-gutter py-12 pb-section-gap">
      <h1 className="font-display text-[36px] lg:text-[48px] text-primary mb-2">Your Cart</h1>
      <p className="text-body-md text-on-surface-variant mb-10">
        {items.length} item{items.length > 1 ? "s" : ""}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-16">
        <div className="lg:col-span-7 flex flex-col">
          {items.map((item, i) => (
            <div key={item.id} className={`flex gap-5 py-6 ${i > 0 ? "border-t border-outline-variant/20" : ""}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.imageUrl} alt={item.name} className="w-24 h-24 object-cover rounded-lg flex-shrink-0 bg-surface-container-low" />
              <div className="flex-1 min-w-0 flex flex-col gap-2">
                <h3 className="font-display text-[18px] text-primary">{item.name}</h3>
                <span className="text-body-md text-on-surface-variant">{item.price}&#2547;</span>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="flex items-center gap-1 text-[12px] font-semibold uppercase tracking-wide text-on-surface-variant hover:text-error transition-colors w-fit"
                >
                  <Icon name="close" className="text-[14px]" />
                  Remove
                </button>
              </div>
              <div className="flex items-start">
                <div className="flex items-center border border-outline-variant rounded-md">
                  <button
                    type="button"
                    aria-label={`Decrease quantity of ${item.name}`}
                    onClick={() => removeSingleItem(item.id)}
                    className="w-8 h-9 flex items-center justify-center text-primary"
                  >
                    &minus;
                  </button>
                  <span className="w-7 text-center text-[14px]">{item.quantity}</span>
                  <button
                    type="button"
                    aria-label={`Increase quantity of ${item.name}`}
                    onClick={() => addItem(item.id, item.name, item.price, item.imageUrl)}
                    className="w-8 h-9 flex items-center justify-center text-primary"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-5">
          <div className="bg-surface-container-low rounded-xl p-8 lg:sticky lg:top-32">
            <h2 className="font-display text-[24px] text-primary mb-6">Order Summary</h2>
            <div className="flex justify-between text-body-md text-on-surface-variant mb-3">
              <span>Subtotal</span>
              <span>{totalAmount}&#2547;</span>
            </div>
            <div className="flex justify-between text-body-md text-on-surface-variant mb-3">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="w-full h-px bg-outline-variant/30 my-4" />
            <div className="flex justify-between mb-8">
              <span className="font-display text-[18px] text-primary">Estimated Total</span>
              <span className="font-display text-[22px] text-primary">{totalAmount}&#2547;</span>
            </div>
            <Link
              href="/order_checkout"
              className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary py-4 uppercase text-[13px] font-semibold tracking-wider hover:bg-inverse-surface transition-colors"
            >
              Proceed to Checkout
              <Icon name="arrow_right_alt" />
            </Link>
            <div className="flex items-center justify-center gap-2 mt-5 text-[11px] text-on-surface-variant uppercase tracking-wide">
              <Icon name="lock" className="text-[16px]" />
              Secure Checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
