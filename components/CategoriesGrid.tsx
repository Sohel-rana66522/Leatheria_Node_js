import Link from "next/link";
import { CATEGORIES } from "@/models/types";

export function CategoriesGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
      {CATEGORIES.filter((c) => c.id !== "All").map((category) => (
        <Link
          key={category.id}
          href={`/productsList/${encodeURIComponent(category.id)}`}
          className="group relative aspect-[4/3] overflow-hidden bg-surface-container-low"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={category.imgSrc}
            alt={category.title}
            className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/10 to-transparent" />
          <div className="absolute inset-0 flex items-end p-6">
            <span className="font-display text-2xl text-on-primary tracking-tight">{category.title}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
