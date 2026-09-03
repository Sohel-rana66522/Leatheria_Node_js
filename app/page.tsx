import Link from "next/link";
import { fetchAllProducts, fetchBanners } from "@/lib/firebase/products";
import { ProductGrid } from "@/components/ProductGrid";
import { CategoriesGrid } from "@/components/CategoriesGrid";
import { Icon } from "@/components/Icon";

// Always fetch fresh data on request — matches the Flutter app re-fetching
// products/banners on every visit to the homepage (no caching layer existed
// in the original app either).
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [banners, products] = await Promise.all([fetchBanners(), fetchAllProducts()]);
  const heroImage = banners[0]?.link;

  return (
    <div className="flex flex-col w-full">
      {/* Hero */}
      <section className="relative w-full h-[600px] lg:h-[780px] min-h-[480px] flex items-center justify-center bg-surface-variant overflow-hidden">
        {heroImage && (
          <div
            className="absolute inset-0 bg-cover bg-center w-full h-full opacity-90"
            style={{ backgroundImage: `url(${heroImage})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/20 to-transparent" />
        <div className="relative z-10 w-full max-w-container-max px-margin-mobile lg:px-gutter flex flex-col items-center text-center mt-8 lg:mt-16">
          <h1 className="font-display text-[40px] leading-[1.1] lg:text-[64px] lg:leading-[1.1] text-on-primary max-w-4xl tracking-tight">
            Crafted in Leather.
            <br />
            <span className="italic font-light">Designed for Life.</span>
          </h1>
          <p className="mt-6 text-body-lg text-primary-fixed max-w-2xl mx-auto">
            Discover timeless leather goods made for everyday elegance. Heritage craftsmanship meets modern
            utility.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center w-full max-w-md mx-auto">
            <Link
              href="/productsList/All"
              className="group flex-1 flex items-center justify-center gap-2 bg-on-primary text-primary px-8 py-4 uppercase text-[13px] font-semibold tracking-wider transition-all duration-300 hover:bg-secondary-fixed hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20"
            >
              Shop Collection
              <Icon name="arrow_right_alt" className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <a
              href="#categories"
              className="group flex-1 flex items-center justify-center gap-2 border border-on-primary text-on-primary px-8 py-4 uppercase text-[13px] font-semibold tracking-wider transition-all duration-300 hover:bg-on-primary/10 backdrop-blur-sm"
            >
              Explore Categories
            </a>
          </div>
        </div>
      </section>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-on-surface-variant">
          <div className="w-8 h-8 border-2 border-outline-variant border-t-primary rounded-full animate-spin" />
          <p>Loading products&hellip;</p>
        </div>
      ) : (
        <>
          <section className="max-w-container-max mx-auto w-full px-margin-mobile lg:px-gutter py-16 lg:py-24">
            <div className="flex items-end justify-between mb-10">
              <h2 className="font-display text-[32px] lg:text-[40px] text-primary">Our Products</h2>
              <Link href="/productsList/All" className="hidden sm:flex items-center gap-1 text-[13px] font-semibold uppercase tracking-wide text-on-surface-variant hover:text-primary transition-colors">
                View All
                <Icon name="arrow_right_alt" />
              </Link>
            </div>
            <ProductGrid products={products} limit={12} />
            <div className="mt-12 flex sm:hidden justify-center">
              <Link
                href="/productsList/All"
                className="border border-primary text-primary px-8 py-3 uppercase text-[13px] font-semibold tracking-wide"
              >
                View More
              </Link>
            </div>
          </section>

          <section id="categories" className="bg-surface-container-low py-16 lg:py-24">
            <div className="max-w-container-max mx-auto w-full px-margin-mobile lg:px-gutter">
              <h2 className="font-display text-[32px] lg:text-[40px] text-primary mb-10">Categories</h2>
              <CategoriesGrid />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
