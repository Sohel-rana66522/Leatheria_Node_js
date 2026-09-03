"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { checkExistingUser } from "@/app/actions";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { setUser } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const user = await checkExistingUser(name, phone);
    setSubmitting(false);
    if (!user) {
      setError("No account found with that name and phone number.");
      return;
    }
    setUser(user);
    router.push("/");
  }

  return (
    <div className="flex min-h-[calc(100vh-176px)]">
      <div
        className="hidden lg:flex w-1/2 relative bg-cover bg-center items-end p-16"
        style={{ backgroundImage: "url(/logo/letherialogo.png)", backgroundColor: "var(--color-primary-container)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/30 to-transparent" />
        <div className="relative z-10 text-on-primary max-w-md">
          <h2 className="font-display text-[40px] leading-[1.1]">Artisanal Craft. Modern Identity.</h2>
          <p className="mt-4 text-body-lg text-primary-fixed">
            Experience the intersection of heritage leather working and contemporary luxury. Access your
            personalized collection.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 bg-surface">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-[32px] text-primary text-center mb-8">Login</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              required
              className="w-full border border-outline-variant rounded-md px-4 py-3 text-body-md text-primary placeholder:text-on-surface-variant/60 focus:outline-none focus:border-secondary transition-colors"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone Number"
              required
              minLength={11}
              className="w-full border border-outline-variant rounded-md px-4 py-3 text-body-md text-primary placeholder:text-on-surface-variant/60 focus:outline-none focus:border-secondary transition-colors"
            />
            {error && <p className="text-error text-[13px]">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-on-primary py-4 uppercase text-[13px] font-semibold tracking-wider hover:bg-inverse-surface transition-colors disabled:opacity-50"
            >
              {submitting ? "Checking…" : "Login"}
            </button>
          </form>
          <p className="text-center text-body-md text-on-surface-variant mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/signUp" className="text-bronze-accent font-semibold">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
