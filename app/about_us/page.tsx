import type { Metadata } from "next";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = {
  title: "Our Story",
  description: "Leatheria is dedicated to crafting premium leather goods using 100% authentic leather.",
};

const VALUES = [
  { icon: "verified", title: "100% Authentic Leather", desc: "Every product is made from genuine, pure leather — no synthetics, no shortcuts." },
  { icon: "handshake", title: "Affordable Premium", desc: "Quality craftsmanship priced fairly, so premium leather is within everyone's reach." },
  { icon: "construction", title: "Crafted with Care", desc: "Each belt, wallet, and bag is made with attention to detail and durability." },
  { icon: "favorite", title: "Customer First", desc: "We stand behind every product with quality you can trust, order after order." },
];

const PRODUCT_CHIPS = ["Belts", "Wallets", "Long Wallets", "Bags", "Card Holders", "Mini Wallets"];

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full">
      <section className="relative w-full h-[420px] flex items-center justify-center bg-primary overflow-hidden">
        <div className="relative z-10 text-center px-margin-mobile">
          <h1 className="font-display text-[40px] lg:text-[56px] text-on-primary tracking-tight">LEATHERIA</h1>
          <p className="text-primary-fixed italic mt-4 text-body-lg">Crafted in Leather. Trusted in Quality.</p>
        </div>
      </section>

      <div className="max-w-container-max mx-auto w-full px-margin-mobile lg:px-gutter py-16 lg:py-24 flex flex-col gap-16 lg:gap-24">
        <section>
          <div className="flex items-center gap-3 mb-6">
            <span className="w-1 h-6 bg-bronze-accent inline-block" />
            <h2 className="font-display text-[26px] text-primary">Who We Are</h2>
          </div>
          <p className="text-body-lg text-on-surface-variant leading-relaxed max-w-3xl">
            Leatheria is dedicated to crafting premium leather goods using 100% authentic leather. From belts and
            wallets to bags and card holders, every product we make is built with genuine materials, careful
            craftsmanship, and an eye for lasting quality.
            <br />
            <br />
            We believe premium doesn&apos;t have to mean expensive. Our mission is simple: bring you pure,
            authentic leather products at a price that feels fair — without cutting corners on quality.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-8">
            <span className="w-1 h-6 bg-bronze-accent inline-block" />
            <h2 className="font-display text-[26px] text-primary">Why Choose Us</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v) => (
              <div key={v.title} className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-6">
                <Icon name={v.icon} className="text-[26px] text-bronze-accent" />
                <h3 className="font-display text-[17px] text-primary mt-4">{v.title}</h3>
                <p className="text-body-md text-on-surface-variant mt-2 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-6">
            <span className="w-1 h-6 bg-bronze-accent inline-block" />
            <h2 className="font-display text-[26px] text-primary">What We Offer</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {PRODUCT_CHIPS.map((p) => (
              <span key={p} className="bg-primary text-on-primary text-[13px] font-medium px-4 py-2 rounded-full">
                {p}
              </span>
            ))}
          </div>
        </section>

        <section className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-10 text-center">
          <Icon name="eco" className="text-[32px] text-bronze-accent" />
          <h3 className="font-display text-[22px] text-primary mt-4">Our Commitment</h3>
          <p className="text-body-md text-on-surface-variant mt-3 max-w-xl mx-auto leading-relaxed">
            We are committed to providing premium, genuine leather products at an affordable price — because
            authentic craftsmanship should be accessible to everyone.
          </p>
        </section>
      </div>
    </div>
  );
}
