"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem, ShipmentOption } from "@/models/types";
import { SHIPPING_COSTS } from "@/models/types";

const STORAGE_KEY = "leatheria.cart.v1";

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  totalAmount: number;
  shipmentOption: ShipmentOption;
  shippingCost: number;
  totalWithShipping: number;
  addItem: (id: string, name: string, price: number, imageUrl: string) => void;
  addItemWithQuantity: (id: string, name: string, price: number, imageUrl: string, quantity: number) => void;
  removeItem: (id: string) => void;
  removeSingleItem: (id: string) => void;
  clearCart: () => void;
  setShipmentOption: (option: ShipmentOption) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [shipmentOption, setShipmentOptionState] = useState<ShipmentOption>("outside");
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount. This is a deliberate, flagged
  // improvement over the original Flutter app, which kept the cart in
  // memory only and lost it on every refresh — see MIGRATION_PLAN.md §5.4.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time load from localStorage on mount, not a render-triggered loop
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore malformed/unavailable storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore quota/unavailable storage
    }
  }, [items, hydrated]);

  const addItemWithQuantity = useCallback(
    (id: string, name: string, price: number, imageUrl: string, quantity: number) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.id === id);
        if (existing) {
          return prev.map((i) => (i.id === id ? { ...i, quantity: i.quantity + quantity } : i));
        }
        return [...prev, { id, name, price, imageUrl, quantity }];
      });
    },
    [],
  );

  const addItem = useCallback(
    (id: string, name: string, price: number, imageUrl: string) => {
      addItemWithQuantity(id, name, price, imageUrl, 1);
    },
    [addItemWithQuantity],
  );

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const removeSingleItem = useCallback((id: string) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (!existing) return prev;
      if (existing.quantity > 1) {
        return prev.map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i));
      }
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalAmount = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);
  const shippingCost = SHIPPING_COSTS[shipmentOption];

  const value: CartContextValue = {
    items,
    itemCount: items.length,
    totalAmount,
    shipmentOption,
    shippingCost,
    totalWithShipping: totalAmount + shippingCost,
    addItem,
    addItemWithQuantity,
    removeItem,
    removeSingleItem,
    clearCart,
    setShipmentOption: setShipmentOptionState,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
