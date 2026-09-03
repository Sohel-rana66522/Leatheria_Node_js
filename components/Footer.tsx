import Link from "next/link";
import { Icon } from "./Icon";

const LEATHERIA_LINKS = [
  { href: "/about_us", label: "About" },
  { href: "/productsList/All", label: "Products" },
  { href: "mailto:leatheria.bdshop@gmail.com", label: "Contact" },
];

const SHOP_LINKS = [
  { href: "/productsList/All", label: "Categories" },
  { href: "/productsList/All", label: "All Products" },
  { href: "/productsList/Bags", label: "Bags" },
  { href: "/productsList/Belts", label: "Belts" },
  { href: "/productsList/Wallets", label: "Wallets" },
  { href: "/productsList/Long Wallets", label: "Long Wallets" },
];

const CUSTOMER_LINKS = [
  { href: "/order_status", label: "Order Status" },
  { href: "/cart", label: "Cart" },
  { href: "/login", label: "Account" },
];

export function Footer() {
  return (
    <footer className="w-full bg-surface-container-low pt-16 lg:pt-section-gap pb-12">
      <div className="max-w-container-max mx-auto px-margin-mobile lg:px-gutter">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-gutter mb-16">
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <span className="font-display text-2xl text-primary">Leatheria</span>
            </div>
            <p className="text-body-md text-on-surface-variant max-w-xs">
              Crafting timeless essentials from the world&apos;s finest full-grain leather. Designed for the modern
              voyager.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="https://www.facebook.com/leatheria.bd" target="_blank" rel="noreferrer" aria-label="Facebook">
                <Icon name="public" className="text-on-surface-variant hover:text-primary cursor-pointer" />
              </a>
              <a href="https://www.instagram.com/leatheriabd" target="_blank" rel="noreferrer" aria-label="Instagram">
                <Icon name="photo_camera" className="text-on-surface-variant hover:text-primary cursor-pointer" />
              </a>
              <a href="https://wa.me/+8801995-618710" target="_blank" rel="noreferrer" aria-label="WhatsApp">
                <Icon name="chat" className="text-on-surface-variant hover:text-primary cursor-pointer" />
              </a>
            </div>
          </div>

          <div className="col-span-1">
            <h4 className="text-[13px] font-semibold text-primary uppercase tracking-wide mb-6">Leatheria</h4>
            <ul className="space-y-4">
              {LEATHERIA_LINKS.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-body-md text-on-surface-variant hover:text-primary transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="text-[13px] font-semibold text-primary uppercase tracking-wide mb-6">Shop</h4>
            <ul className="space-y-4">
              {SHOP_LINKS.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-body-md text-on-surface-variant hover:text-primary transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 lg:col-span-2">
            <h4 className="text-[13px] font-semibold text-primary uppercase tracking-wide mb-6">Customer</h4>
            <ul className="space-y-4">
              {CUSTOMER_LINKS.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-body-md text-on-surface-variant hover:text-primary transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-outline-variant/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-[12px] text-on-surface-variant">&copy; Leatheria &mdash; All Rights Reserved.</span>
          <div className="flex gap-6">
            <Icon name="public" className="text-on-surface-variant hover:text-primary cursor-pointer" />
            <Icon name="payments" className="text-on-surface-variant hover:text-primary cursor-pointer" />
            <Icon name="verified" className="text-on-surface-variant hover:text-primary cursor-pointer" />
          </div>
        </div>
      </div>
    </footer>
  );
}
