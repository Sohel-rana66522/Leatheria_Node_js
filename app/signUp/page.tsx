"use client";

import { useState } from "react";
import Link from "next/link";
import { createUserAccount } from "@/app/actions";
import { CITIES } from "@/models/types";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || phone.trim().length < 11 || !email.includes("@") || !address.trim()) {
      setError("Please fill in all fields correctly.");
      return;
    }
    setSubmitting(true);
    try {
      await createUserAccount({ name: name.trim(), phone: phone.trim(), email, city: city || CITIES[0], address });
      // Matches the original SingUpPage, which resets the form on success
      // rather than navigating away — see MIGRATION_PLAN.md §5.
      setName("");
      setPhone("");
      setEmail("");
      setCity("");
      setAddress("");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full border border-outline-variant rounded-md px-4 py-3 text-body-md text-primary placeholder:text-on-surface-variant/60 focus:outline-none focus:border-secondary transition-colors";

  return (
    <div className="flex min-h-[calc(100vh-176px)]">
      <div
        className="hidden lg:flex w-1/2 relative bg-cover bg-center items-end p-16"
        style={{ backgroundImage: "url(/logo/letherialogo.png)", backgroundColor: "var(--color-primary-container)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/30 to-transparent" />
        <div className="relative z-10 text-on-primary max-w-md">
          <h2 className="font-display text-[40px] leading-[1.1]">Join the Atelier</h2>
          <p className="mt-4 text-body-lg text-primary-fixed">
            Become part of an exclusive circle that appreciates timeless craftsmanship and uncompromising quality.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 bg-surface">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-[32px] text-primary text-center mb-2">Create Account</h1>
          <p className="text-body-md text-on-surface-variant text-center mb-8">
            Register to track orders and save your preferences.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-[11px] font-semibold text-primary uppercase tracking-widest mb-2">Full Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" required className={inputClass} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-primary uppercase tracking-widest mb-2">Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+880 1XXX-XXXXXX" required minLength={11} className={inputClass} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-primary uppercase tracking-widest mb-2">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" required className={inputClass} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-primary uppercase tracking-widest mb-2">Select City</label>
              <select value={city} onChange={(e) => setCity(e.target.value)} className={`${inputClass} cursor-pointer`}>
                <option value="">Choose a city…</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-primary uppercase tracking-widest mb-2">Address</label>
              <textarea
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address, suite, etc."
                required
                className={`${inputClass} resize-none`}
              />
            </div>
            {error && <p className="text-error text-[13px]">{error}</p>}
            {done && <p className="text-secondary text-[13px]">Account created! You can now log in.</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-on-primary py-4 uppercase text-[13px] font-semibold tracking-wider hover:bg-inverse-surface transition-colors disabled:opacity-50"
            >
              {submitting ? "Creating…" : "Sign Up"}
            </button>
          </form>
          <p className="text-center text-body-md text-on-surface-variant mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-bronze-accent font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
