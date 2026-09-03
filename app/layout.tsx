import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const SITE_URL = "https://leatheria.web.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Leatheria - Premium Leather Goods Online",
    template: "%s | Leatheria",
  },
  description:
    "Shop premium handcrafted leather bags, wallets, men's belt, sweat leather, full grain leather and accessories at Leatheria. Fast delivery, quality guaranteed.",
  keywords: [
    "leather",
    "hand crafts",
    "synthetic leather",
    "artificial leather",
    "full grain leather",
    "sweat leather",
    "leather belt",
    "men's belt",
    "leather product",
    "leather bags",
    "leather wallets",
    "handmade leather",
    "leatheria",
  ],
  authors: [{ name: "Leatheria" }],
  icons: {
    icon: "/favicon.png",
    apple: "/icons/Icon-192.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Leatheria - Premium Leather Goods",
    description:
      "Shop premium handcrafted leather bags, wallets, men's belt, sweat leather, full grain leather and accessories at Leatheria. Fast delivery, quality guaranteed.",
    url: SITE_URL,
    type: "website",
    images: ["/icons/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Leatheria - Premium Leather Goods",
    description:
      "Shop premium handcrafted leather bags, wallets, men's belt, sweat leather, full grain leather and accessories at Leatheria. Fast delivery, quality guaranteed.",
    images: ["/icons/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- App Router root layout <head> is the documented place for global fonts; this rule targets the legacy Pages Router */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- see above */}
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100..900&family=Playfair+Display:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="w-full pt-28 bg-surface min-h-screen">{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
