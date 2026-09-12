"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { CHECKOUT_DELIVERY_ZONE_OPTIONS } from "@/models/types";
import { canonicalizeKnownCity, getDeliveryFee } from "@/lib/delivery";
import { checkAddressConsistency } from "@/lib/addressCheck";
import { checkExistingUser, createUserAccount, placeOrderAction } from "@/app/actions";
import { userKey } from "@/lib/firebase/users";
import type { UserProfile } from "@/models/types";
import { Icon } from "@/components/Icon";

const OUTSIDE_DHAKA = "Outside Dhaka";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-[11px] font-semibold text-primary uppercase tracking-widest mb-2">{children}</label>;
}

const inputClass =
  "w-full bg-transparent border-b border-outline-variant py-3 text-body-md text-primary placeholder:text-on-surface-variant/50 focus:outline-none focus:border-secondary transition-colors";

export default function CheckoutPage() {
  const { items, totalAmount, clearCart } = useCart();
  const { user, setUser } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState(CHECKOUT_DELIVERY_ZONE_OPTIONS[0]);
  const [deliveryDistrict, setDeliveryDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [addressWarning, setAddressWarning] = useState<string | null>(null);

  const isOutsideDhaka = city === OUTSIDE_DHAKA;

  // Delivery fee is derived automatically from the selected zone — see
  // lib/delivery.ts (the same single source of truth used server-side when
  // the order is actually created) and MIGRATION_PLAN.md addendum. Updates
  // immediately whenever `city` changes; no manual selection. Note this
  // uses the ZONE (`city`), never `deliveryDistrict` — the free-text
  // district never affects the fee, only which zone was picked does.
  const { zoneName: deliveryZoneName, fee: deliveryFee } = useMemo(() => getDeliveryFee(city), [city]);
  const totalWithDelivery = totalAmount + deliveryFee;

  // The actual destination city/district to persist on the order/profile:
  // the typed district when "Outside Dhaka" is selected, otherwise the
  // zone name itself (which IS a real city name for the other 5 options).
  const effectiveDestinationCity = isOutsideDhaka ? deliveryDistrict.trim() || OUTSIDE_DHAKA : city;
  const deliveryFeeBasisLabel = isOutsideDhaka && deliveryDistrict.trim() ? `${city} — ${deliveryDistrict.trim()}` : city;

  // Tracks which fields the customer has manually edited, so autofill (below)
  // never overwrites something they've already typed — including a value
  // typed before the profile finished loading.
  const touchedRef = useRef({ name: false, phone: false, email: false, city: false, deliveryDistrict: false, address: false });
  // Guards against re-autofilling the same logged-in user's data over and
  // over (e.g. on unrelated re-renders) while still allowing a fresh
  // autofill if a different user becomes the logged-in user.
  const [autofilledForUserId, setAutofilledForUserId] = useState<string | null>(null);

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

  // Resolves a saved profile city into the checkout's two city fields:
  // a known Dhaka-area zone (Dhaka/Savar/Gazipur/Narayanganj/Keraniganj)
  // selects that zone directly; anything else (e.g. "Chittagong", saved
  // before this feature existed or entered as a district) selects the
  // "Outside Dhaka" zone and fills the district with the saved value, so
  // the customer's real destination is never lost or misrepresented.
  // Shared by the automatic autofill effect and the manual "Login &
  // autofill" button so both behave identically.
  function applyProfileCity(profileCity: string | undefined) {
    if (!profileCity || !profileCity.trim()) return;
    const canonical = canonicalizeKnownCity(profileCity);
    if (canonical) {
      if (!touchedRef.current.city) setCity(canonical);
    } else {
      if (!touchedRef.current.city) setCity(OUTSIDE_DHAKA);
      if (!touchedRef.current.deliveryDistrict) setDeliveryDistrict(profileCity.trim());
    }
  }

  // Auto-fill checkout fields for a logged-in customer (AuthContext.user —
  // this project's existing authenticated-user source; see MIGRATION_PLAN.md
  // §5.6 — there is no Firebase Authentication in this app, so "logged-in
  // user" means the existing name+phone session held in AuthContext, whose
  // UserProfile already comes straight from the existing `users` Firestore
  // document and already contains name/phone/email/city/address together —
  // no second fetch or new data source needed). Only fills fields the
  // customer hasn't already typed into, and only once per logged-in user.
  useEffect(() => {
    if (!user || autofilledForUserId === user.id) return;
    if (!touchedRef.current.name && user.name) setName(user.name);
    if (!touchedRef.current.phone && user.phone) setPhone(user.phone);
    if (!touchedRef.current.email && user.email) setEmail(user.email);
    applyProfileCity(user.city);
    if (!touchedRef.current.address && user.address) setAddress(user.address);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync guard so this autofill runs once per logged-in user, not a render feedback loop
    setAutofilledForUserId(user.id);
  }, [user, autofilledForUserId]);

  function handleAutofill() {
    if (existingUser && existingUser !== "checking") {
      setEmail(existingUser.email);
      applyProfileCity(existingUser.city);
      setAddress(existingUser.address);
    }
  }

  // Advisory-only address/delivery-city consistency check (see
  // lib/addressCheck.ts) — debounced, and recalculated whenever the
  // address, the selected city zone, or the typed district changes, per
  // this task's timing requirement. Never blocks submission.
  useEffect(() => {
    if (!address.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clearing the warning when its own dependency (address) becomes empty, not a feedback loop
      setAddressWarning(null);
      return;
    }
    const timer = setTimeout(() => {
      const result = checkAddressConsistency(address, effectiveDestinationCity);
      setAddressWarning(result.message);
    }, 500);
    return () => clearTimeout(timer);
  }, [address, effectiveDestinationCity]);

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
    if (isOutsideDhaka && !deliveryDistrict.trim()) {
      setError("Please enter your delivery city/district.");
      return;
    }

    setSubmitting(true);
    try {
      const key = userKey(name.trim(), phone.trim());

      if (isNewCustomer) {
        const user = await createUserAccount({
          name: name.trim(),
          phone: phone.trim(),
          email,
          city: effectiveDestinationCity,
          address,
        });
        setUser(user);
      } else if (existingUser && existingUser !== "checking") {
        setUser(existingUser);
      }

      const result = await placeOrderAction({
        key,
        name: name.trim(),
        phone: phone.trim(),
        email,
        city: effectiveDestinationCity,
        deliveryZone: city,
        address,
        items,
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
              <input className={inputClass} value={name} onChange={(e) => { touchedRef.current.name = true; setName(e.target.value); }} placeholder="Enter your full name" required />
            </div>
            <div className="mb-6">
              <FieldLabel>Phone Number</FieldLabel>
              <input className={inputClass} value={phone} onChange={(e) => { touchedRef.current.phone = true; setPhone(e.target.value); }} placeholder="Enter phone number" required minLength={11} />
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
              <input type="email" className={inputClass} value={email} onChange={(e) => { touchedRef.current.email = true; setEmail(e.target.value); }} placeholder="Enter email address" required />
            </div>
            <div className="mb-6">
              <FieldLabel>City</FieldLabel>
              <select className={`${inputClass} cursor-pointer`} value={city} onChange={(e) => { touchedRef.current.city = true; setCity(e.target.value); }}>
                {CHECKOUT_DELIVERY_ZONE_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            {isOutsideDhaka && (
              <div className="mb-6">
                <FieldLabel>Delivery City / District</FieldLabel>
                <input
                  className={inputClass}
                  value={deliveryDistrict}
                  onChange={(e) => { touchedRef.current.deliveryDistrict = true; setDeliveryDistrict(e.target.value); }}
                  placeholder="Enter your city/district"
                  required
                />
              </div>
            )}
            <div>
              <FieldLabel>Address</FieldLabel>
              <textarea
                rows={3}
                className={`${inputClass} resize-none border border-outline-variant py-3 px-3`}
                value={address}
                onChange={(e) => { touchedRef.current.address = true; setAddress(e.target.value); }}
                placeholder="Enter full address"
                required
              />
              {addressWarning && (
                <p className="flex items-start gap-2 text-[12px] text-tertiary mt-2">
                  <Icon name="info" className="text-[15px] flex-shrink-0" />
                  <span>{addressWarning}</span>
                </p>
              )}
            </div>
          </div>

          <div className="bg-surface-container-low rounded-xl p-8">
            <h2 className="font-display text-[22px] text-primary border-b border-outline-variant/30 pb-4 mb-6">Delivery Fee</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-body-md text-on-surface-variant">
                <Icon name="local_shipping" className="text-[18px]" />
                <span>
                  {deliveryZoneName} &middot; <span className="text-on-surface-variant/70">based on {deliveryFeeBasisLabel}</span>
                </span>
              </div>
              <span className="text-body-lg text-primary font-semibold">{deliveryFee}&#2547;</span>
            </div>
            <p className="text-[12px] text-on-surface-variant/70 mt-3">
              Calculated automatically from your delivery city — change City above to update it.
            </p>
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
              <span>Delivery Fee</span>
              <span>{deliveryFee}&#2547;</span>
            </div>
            <div className="w-full h-px bg-on-primary/20 mb-4" />
            <div className="flex justify-between items-baseline mb-6">
              <span className="font-display text-[18px]">Total</span>
              <span className="font-display text-[26px] text-bronze-accent">{totalWithDelivery}&#2547;</span>
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
