"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, Package } from "lucide-react"

import { useTranslation } from "@/contexts/language-context"
import { formatOrderPrice } from "@/lib/products/whatsapp"
import type { PublicStoreProduct } from "@/lib/products/types"

interface ProductCardProps {
  product: PublicStoreProduct
}

export function ProductCard({ product }: ProductCardProps) {
  const { t, language } = useTranslation()

  const availabilityLabel =
    product.availability === "in_stock"
      ? t.store.inStock
      : product.availability === "low_stock"
        ? t.store.lowStock
        : t.store.outOfStock

  const availabilityClass =
    product.availability === "in_stock"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
      : product.availability === "low_stock"
        ? "border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#E5C65B]"
        : "border-white/10 bg-white/5 text-[#8A8A8A]"

  const categoryLabel =
    t.store.categories[product.category]

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0A] transition-colors hover:border-[#D4AF37]/50">
      <Link
        href={`/loja/${product.slug}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
        aria-label={`${t.store.viewProduct}: ${product.name}`}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-[#111111]">
          {product.primaryImage ? (
            <Image
              src={product.primaryImage.imageUrl}
              alt={
                product.primaryImage.altText ||
                product.name
              }
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-12 w-12 text-white/20" />
            </div>
          )}

          <div className="absolute left-3 top-3 flex max-w-[calc(100%-1.5rem)] flex-wrap gap-2">
            {product.featured && (
              <span className="rounded-full border border-[#D4AF37]/40 bg-black/75 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#D4AF37] backdrop-blur-sm">
                {t.store.featured}
              </span>
            )}

            <span
              className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] backdrop-blur-sm ${availabilityClass}`}
            >
              {availabilityLabel}
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#777777]">
                {categoryLabel}
              </p>
              <h2 className="mt-2 line-clamp-2 text-lg font-bold text-white">
                {product.name}
              </h2>
              <p className="mt-1 text-xs text-[#777777]">
                {t.store.reference}: {product.reference}
              </p>
            </div>

            <ArrowUpRight className="mt-1 h-5 w-5 flex-shrink-0 text-[#D4AF37] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>

          <div className="mt-5 flex items-end justify-between gap-3 border-t border-white/10 pt-4">
            <div>
              <p className="text-xs text-[#777777]">
                {t.store.price}
              </p>
              <p className="mt-1 text-lg font-bold text-white">
                {formatOrderPrice(
                  product.price,
                  product.currency,
                  language
                )}
              </p>
            </div>

            <span className="text-sm font-semibold text-[#D4AF37]">
              {t.store.viewProduct}
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}
