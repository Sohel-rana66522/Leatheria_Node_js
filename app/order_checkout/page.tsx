"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { CITIES, SHIPPING_LABELS, type ShipmentOption } from "@/models/types";
import { checkExistingUser, createUserAccount, placeOrderAction } from "@/app/actions";
import { userKey } from "@/lib/firebase/users";
import type { UserProfile } from "@/models/types";
import { Icon } from "@/components/Icon";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-[11px] font-semibold text-primary uppercase tracking-widest mb-2">{children}</label>;
}

const inputClass =
  "w-full bg-transparent border-b border-outline-variant py-3 text-body-md text-primary placeholder:text-on-surface-variant/50 focus:outline-none focus:border-secondary transition-colors";

export default function CheckoutPage() {
  const { items, totalAmount, shipmentOption, shippingCost, totalWithShipping, setShipmentOption, clearCart } =
    useCart();
  const { setUser } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState(CITIES[0]);
  const [address, setAddress] = useState("");

  const [existingUser, setExistingUser] = useState<UserProfile | null | "checking">(null);
  const [createAccount, setCreateAccount] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!name.trim() || phone.trim().length < 11) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clearing lookup state when the dependencies (name/phone) themselves changed
      setExistingUser(null);
      return;
    }
    setExistingUser("checking");
    debounceRef.current = setTimeout(async () => {
      const found = await checkExistingUser(name, phone);
      setExistingUser(found);
    }, 600);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [name, phone]);

  function handleAutofill() {
    if (existingUser && existingUser !== "checking") {
      setEmail(existingUser.email);
      setCity(existingUser.city || CITIES[0]);
      setAddress(existingUser.address);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    if (!agreeTerms) {
      setError("Please agree to the Terms & Conditions to place your order.");
      return;
    }
    const isNewCustomer = existingUser === null;
    if (isNewCustomer && !createAccount) {
      setError('Please check "Create an account" to continue as a new customer.');
      return;
    }
    if (!name.trim() || phone.trim().length < 11 || !email.includes("@") || !address.trim()) {
      setError("Please fill in all fields correctly.");
      return;
    }

    setSubmitting(true);
    try {
      const key = userKey(name.trim(), phone.trim());

      if (isNewCustomer) {
        const user = await createUserAccount({ name: name.trim(), phone: phone.trim(), email, city, address });
        setUser(user);
      } else if (existingUser && existingUser !== "checking") {
        setUser(existingUser);
      }

      const result = await placeOrderAction({
        key,
        name: name.trim(),
        phone: phone.trim(),
        email,
        city,
        address,
        items,
        totalAmount: totalWithShipping,
      });

      if (!result.success) {
        setError(result.error);
        setSubmitting(false);
        return;
      }

      clearCart();
      setPlaced(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong placing your order.");
      setSubmitting(false);
    }
  }

  if (placed) {
    return (
      <div className="max-w-container-max mx-auto px-margin-mobile lg:px-gutter py-24 flex flex-col items-center text-center gap-4">
        <Icon name="check_circle" className="text-[48px] text-secondary" filled />
        <h1 className="font-display text-[32px] text-primary">Order Placed!</h1>
        <p className="text-body-md text-on-surface-variant">We&apos;ll contact you shortly to confirm your order.</p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mt-4 bg-primary text-on-primary px-8 py-3 uppercase text-[13px] font-semibold tracking-wider"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-container-max mx-auto px-margin-mobile lg:px-gutter py-24 flex flex-col items-center text-center gap-6">
        <p className="text-body-lg text-on-surface-variant">Your cart is empty.</p>
        <Link href="/productsList/All" className="bg-primary text-on-primary px-8 py-3 uppercase text-[13px] font-semibold tracking-wider">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile lg:px-gutter py-12 pb-section-gap">
      <h1 className="font-display text-[36px] lg:text-[48px] text-primary mb-2">Secure Checkout</h1>
      <p className="text-body-md text-on-surface-variant mb-10">Complete your order with Leatheria.</p>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-16 items-start">
        <div className="lg:col-span-7 flex flex-col gap-8">
          <div className="bg-surface-container-low rounded-xl p-8">
            <h2 className="font-display text-[22px] text-primary border-b border-outline-variant/30 pb-4 mb-6">Checkout</h2>

            <div className="mb-6">
              <FieldLabel>Full Name</FieldLabel>
              <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" required />
            </div>
            <div className="mb-6">
              <FieldLabel>Phone Number</FieldLabel>
              <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter phone number" required minLength={11} />
            </div>

            {existingUser === "checking" && <p className="text-[13px] text-on-surface-variant mb-4">Checking&hellip;</p>}
            {existingUser && existingUser !== "checking" && (
              <div className="flex items-center justify-between bg-surface-container rounded-lg px-4 py-3 mb-6">
                <span className="text-body-md text-primary">Welcome back, {existingUser.name}!</span>
                <button type="button" onClick={handleAutofill} className="text-[12px] font-semibold uppercase tracking-wide text-secondary hover:text-primary">
                  Login &amp; autofill
                </button>
              </div>
            )}
            {existingUser === null && name.trim() && phone.trim().length >= 11 && (
              <label className="flex items-center gap-3 mb-6 cursor-pointer">
                <input type="checkbox" className="category-checkbox" checked={createAccount} onChange={(e) => setCreateAccount(e.target.checked)} />
                <span className="text-body-md text-on-surface-variant">Create an account with this info</span>
              </label>
            )}

            <div className="mb-6">
              <FieldLabel>Email</FieldLabel>
              <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email address" required />
            </div>
            <div className="mb-6">
              <FieldLabel>City</FieldLabel>
              <select className={`${inputClass} cursor-pointer`} value={city} onChange={(e) => setCity(e.target.value)}>
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel>Address</FieldLabel>
              <textarea
                rows={3}
                className={`${inputClass} resize-none border border-outline-variant py-3 px-3`}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter full address"
                required
              />
            </div>
          </div>

          <div className="bg-surface-container-low rounded-xl p-8">
            <h2 className="font-display text-[22px] text-primary border-b border-outline-variant/30 pb-4 mb-6">Shipping</h2>
            <div className="flex flex-col gap-4">
              {(Object.keys(SHIPPING_LABELS) as ShipmentOption[]).map((option) => (
                <label key={option} className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="shipment" className="radio-dot" checked={shipmentOption === option} onChange={() => setShipmentOption(option)} />
                  <span className="text-body-md text-on-surface-variant">{SHIPPING_LABELS[option]}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-primary text-on-primary rounded-xl p-8 lg:sticky lg:top-32">
            <h2 className="font-display text-[22px] mb-6">Order Summary</h2>
            <div className="flex flex-col gap-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.imageUrl} alt={item.name} className="w-14 h-14 object-cover rounded-md flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold uppercase tracking-wide truncate">{item.name}</p>
                    <p className="text-[12px] text-primary-fixed-dim">Qty {item.quantity}</p>
                  </div>
                  <span className="text-[13px] flex-shrink-0">{item.price * item.quantity}&#2547;</span>
                </div>
              ))}
            </div>
            <div className="w-full h-px bg-on-primary/20 mb-4" />
            <div className="flex justify-between text-body-md text-primary-fixed-dim mb-2">
              <span>Subtotal</span>
              <span>{totalAmount}&#2547;</span>
            </div>
            <div className="flex justify-between text-body-md text-primary-fixed-dim mb-4">
              <span>Shipping</span>
              <span>{shippingCost}&#2547;</span>
            </div>
            <div className="w-full h-px bg-on-primary/20 mb-4" />
            <div className="flex justify-between items-baseline mb-6">
              <span className="font-display text-[18px]">Total</span>
              <span className="font-display text-[26px] text-bronze-accent">{totalWithShipping}&#2547;</span>
            </div>

            <label className="flex items-start gap-3 mb-6 cursor-pointer">
              <input type="checkbox" className="category-checkbox mt-0.5" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />
              <span className="text-[13px] text-primary-fixed-dim">I agree to the Terms &amp; Conditions</span>
            </label>

            {error && <p className="text-error-container text-[13px] mb-4 bg-error/20 rounded px-3 py-2">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-on-primary text-primary py-4 uppercase text-[13px] font-semibold tracking-wider hover:bg-secondary-fixed transition-colors disabled:opacity-50"
            >
              {submitting ? "Placing order…" : "Place Order"}
              {!submitting && <Icon name="arrow_right_alt" />}
            </button>
            <div className="flex items-center justify-center gap-2 mt-5 text-[11px] text-primary-fixed-dim uppercase tracking-wide">
              <Icon name="lock" className="text-[16px]" />
              Secure Checkout
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
