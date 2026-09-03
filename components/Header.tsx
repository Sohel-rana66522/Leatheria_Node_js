"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Icon } from "./Icon";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/productsList/All", label: "Shop" },
  { href: "/about_us", label: "Our Story" },
  { href: "/order_status", label: "Order Tracking" },
];

export function Header() {
  const { itemCount } = useCart();
  const { isAuth, logout } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSearchOpen(false);
    router.push(`/productsList/All${searchValue.trim() ? `?q=${encodeURIComponent(searchValue.trim())}` : ""}`);
  }

  return (
    <header className="fixed top-0 w-full z-50">
      <div className="bg-primary text-on-primary py-2 px-margin-mobile lg:px-gutter text-center">
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em]">
          Premium Leather Goods &middot; Crafted for Everyday Luxury
        </span>
      </div>
      <div className="bg-surface/95 backdrop-blur-md shadow-[0_1px_8px_rgba(61,43,31,0.06)]">
        <div className="h-20 max-w-container-max mx-auto px-margin-mobile lg:px-gutter flex items-center justify-between">
          <div className="flex md:hidden items-center">
            <button type="button" aria-label="Open menu" onClick={() => setMobileOpen(true)}>
              <Icon name="menu" className="text-on-surface" />
            </button>
          </div>

          <nav className="hidden md:flex items-center gap-8 flex-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[13px] font-semibold text-on-surface-variant hover:text-on-surface transition-colors uppercase tracking-wide"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center justify-center flex-shrink-0 md:flex-1">
            <Link href="/" className="font-display text-3xl text-primary tracking-tight">
              Leatheria
            </Link>
          </div>

          <div className="flex items-center justify-end gap-5 md:gap-6 flex-1">
            <button type="button" aria-label="Search" onClick={() => setSearchOpen((v) => !v)}>
              <Icon name="search" className="text-on-surface cursor-pointer" />
            </button>
            {isAuth ? (
              <button
                type="button"
                aria-label="Log out"
                onClick={logout}
                className="hidden md:flex w-8 h-8 rounded-full bg-primary items-center justify-center"
              >
                <Icon name="logout" className="text-on-primary text-[18px]" />
              </button>
            ) : (
              <Link
                href="/login"
                aria-label="Account"
                className="hidden md:flex w-8 h-8 rounded-full bg-primary items-center justify-center"
              >
                <Icon name="person" className="text-on-primary text-[18px]" />
              </Link>
            )}
            <Link href="/cart" aria-label="Cart" className="relative">
              <Icon name="shopping_bag" className="text-on-surface cursor-pointer" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-bronze-accent text-on-primary text-[10px] font-bold leading-none rounded-full w-4 h-4 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-outline-variant/20 bg-surface">
            <form
              onSubmit={handleSearchSubmit}
              className="max-w-container-max mx-auto px-margin-mobile lg:px-gutter py-3 flex items-center gap-3"
            >
              <Icon name="search" className="text-on-surface-variant" />
              <input
                autoFocus
                type="search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search products..."
                className="flex-1 bg-transparent focus:outline-none text-body-md placeholder:text-on-surface-variant/50"
              />
            </form>
          </div>
        )}
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50" role="dialog" aria-modal>
          <div className="absolute inset-0 bg-primary/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 left-0 bottom-0 w-72 bg-surface shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-5 h-20 border-b border-outline-variant/20">
              <span className="font-display text-2xl text-primary">Leatheria</span>
              <button type="button" aria-label="Close menu" onClick={() => setMobileOpen(false)}>
                <Icon name="close" className="text-on-surface" />
              </button>
            </div>
            <nav className="flex flex-col p-5 gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 text-[13px] font-semibold text-on-surface uppercase tracking-wide border-b border-outline-variant/10"
                >
                  {link.label}
                </Link>
              ))}
              {isAuth ? (
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="py-3 text-left text-[13px] font-semibold text-on-surface uppercase tracking-wide"
                >
                  Log Out
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="py-3 text-[13px] font-semibold text-on-surface uppercase tracking-wide"
                >
                  Account
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
