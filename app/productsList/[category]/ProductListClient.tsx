"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Product, SortOption } from "@/models/types";
import { filterAndSortProducts } from "@/lib/firebase/products";
import { CATEGORIES, SORT_OPTIONS } from "@/models/types";
import { ProductGrid } from "@/components/ProductGrid";
import { Icon } from "@/components/Icon";

export function ProductListClient({ category, products }: { category: string; products: Product[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sort, setSort] = useState<SortOption>("Newest");
  const [searchText, setSearchText] = useState(searchParams.get("q") ?? "");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(
    () => filterAndSortProducts(products, { category, searchText, sort }),
    [products, category, searchText, sort],
  );

  const activeCategory = CATEGORIES.find((c) => c.id === category);

  return (
    <div className="flex flex-col w-full">
      <div className="w-full px-margin-mobile lg:px-gutter max-w-container-max mx-auto py-12 flex flex-col md:flex-row items-baseline justify-between gap-6">
        <div className="flex flex-col gap-2">
          <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <Icon name="chevron_right" className="text-[16px]" />
            <Link href="/productsList/All" className="hover:text-primary transition-colors">
              Shop
            </Link>
            <Icon name="chevron_right" className="text-[16px]" />
            <span className="text-primary font-bold">{activeCategory?.title ?? category}</span>
          </nav>
          <h1 className="font-display text-[36px] lg:text-[56px] text-primary">{activeCategory?.title ?? category}</h1>
          <p className="text-body-md text-on-surface-variant max-w-lg mt-2">
            Discover our {activeCategory?.title.toLowerCase() ?? category.toLowerCase()} collection, designed for
            timeless elegance and everyday durability.
          </p>
        </div>
        <div className="flex flex-col gap-4 w-full md:w-auto">
          <div className="relative group w-full md:w-80">
            <Icon
              name="search"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors"
            />
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-surface-container-low text-body-md text-on-surface py-3 pl-12 pr-4 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/50"
            />
          </div>
          <div className="flex items-center justify-between md:justify-end gap-4">
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="appearance-none bg-transparent pr-8 text-[13px] font-semibold uppercase tracking-wide text-primary focus:outline-none cursor-pointer"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <Icon name="expand_more" className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-primary" />
            </div>
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              className="flex md:hidden items-center gap-2 text-[13px] font-semibold text-primary uppercase hover:bg-surface-container-low px-4 py-2 transition-colors"
            >
              <Icon name="tune" className="text-[20px]" />
              Filters
            </button>
          </div>
        </div>
      </div>

      <div className="w-full border-t border-outline-variant/20 mb-8" />

      <div className="w-full max-w-container-max mx-auto px-margin-mobile lg:px-gutter pb-section-gap flex flex-col lg:flex-row gap-gutter relative">
        <aside className={`${filtersOpen ? "flex" : "hidden"} lg:flex w-full lg:w-64 flex-shrink-0 flex-col gap-8`}>
          <div className="flex flex-col gap-4">
            <h3 className="text-[13px] font-semibold text-primary uppercase tracking-widest border-b border-outline-variant/30 pb-2">
              Categories
            </h3>
            <div className="flex flex-col gap-3">
              {CATEGORIES.map((c) => (
                <label key={c.id} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="category-checkbox"
                    checked={category === c.id}
                    onChange={() => router.push(`/productsList/${encodeURIComponent(c.id)}`)}
                  />
                  <span className="text-body-md text-on-surface-variant group-hover:text-primary transition-colors">
                    {c.title}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex-1">
          {filtered.length > 0 ? (
            <ProductGrid products={filtered} />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-on-surface-variant text-center">
              <Icon name="search_off" className="text-[32px]" />
              <p>No products found{searchText ? ` for "${searchText}"` : ""}.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
