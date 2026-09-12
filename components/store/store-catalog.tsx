"use client"

import { useMemo, useState } from "react"
import { PackageSearch, Search, X } from "lucide-react"

import { useTranslation } from "@/contexts/language-context"
import type {
  ProductAvailability,
  ProductCategory,
  PublicStoreProduct,
} from "@/lib/products/types"

import { ProductCard } from "./product-card"

interface StoreCatalogProps {
  products: PublicStoreProduct[]
}

type CategoryFilter = "all" | ProductCategory
type AvailabilityFilter = "all" | "available" | "out_of_stock"

const categoryOrder: ProductCategory[] = [
  "vestuario",
  "equipamento",
  "acessorios",
]

function normalizeSearchValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

function isAvailable(
  availability: ProductAvailability
) {
  return (
    availability === "in_stock" ||
    availability === "low_stock"
  )
}

export function StoreCatalog({
  products,
}: StoreCatalogProps) {
  const { t } = useTranslation()

  const [search, setSearch] = useState("")
  const [category, setCategory] =
    useState<CategoryFilter>("all")
  const [availability, setAvailability] =
    useState<AvailabilityFilter>("all")

  const filteredProducts = useMemo(() => {
    const normalizedSearch =
      normalizeSearchValue(search)

    return products.filter((product) => {
      const matchesCategory =
        category === "all" ||
        product.category === category

      const matchesAvailability =
        availability === "all" ||
        (availability === "available"
          ? isAvailable(product.availability)
          : product.availability ===
            "out_of_stock")

      const searchableText =
        normalizeSearchValue(
          [
            product.name,
            product.reference,
            product.description,
            t.store.categories[
              product.category
            ],
          ].join(" ")
        )

      const matchesSearch =
        !normalizedSearch ||
        searchableText.includes(
          normalizedSearch
        )

      return (
        matchesCategory &&
        matchesAvailability &&
        matchesSearch
      )
    })
  }, [
    products,
    search,
    category,
    availability,
    t,
  ])

  const hasActiveFilters =
    Boolean(search.trim()) ||
    category !== "all" ||
    availability !== "all"

  const clearFilters = () => {
    setSearch("")
    setCategory("all")
    setAvailability("all")
  }

  return (
    <section className="pb-20 sm:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-3 sm:p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#666666]" />
            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder={
                t.store.searchPlaceholder
              }
              className="min-h-12 w-full rounded-xl border border-white/10 bg-black py-3 pl-12 pr-4 text-sm text-white outline-none transition-colors placeholder:text-[#666666] focus:border-[#D4AF37]"
            />
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => setCategory("all")}
              className={`min-h-11 flex-shrink-0 rounded-full border px-4 text-sm font-semibold transition-colors ${
                category === "all"
                  ? "border-[#D4AF37] bg-[#D4AF37] text-black"
                  : "border-white/10 bg-black text-[#B3B3B3] hover:border-[#D4AF37]/50 hover:text-white"
              }`}
            >
              {t.store.allCategories}
            </button>

            {categoryOrder.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`min-h-11 flex-shrink-0 rounded-full border px-4 text-sm font-semibold transition-colors ${
                  category === item
                    ? "border-[#D4AF37] bg-[#D4AF37] text-black"
                    : "border-white/10 bg-black text-[#B3B3B3] hover:border-[#D4AF37]/50 hover:text-white"
                }`}
              >
                {t.store.categories[item]}
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-col gap-3 border-t border-white/10 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {(
                [
                  ["all", t.store.allStock],
                  ["available", t.store.available],
                  ["out_of_stock", t.store.outOfStock],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setAvailability(value)
                  }
                  className={`min-h-11 flex-shrink-0 rounded-lg border px-3 text-xs font-semibold transition-colors ${
                    availability === value
                      ? "border-[#D4AF37]/50 bg-[#D4AF37]/10 text-[#D4AF37]"
                      : "border-white/10 bg-black text-[#888888] hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex min-h-11 items-center justify-between gap-3 sm:justify-end">
              <span className="text-sm text-[#777777]">
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1
                  ? t.store.productCountSingular
                  : t.store.productCountPlural}
              </span>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-[#D4AF37] hover:text-[#E5C65B]"
                >
                  <X className="h-4 w-4" />
                  {t.store.clearFilters}
                </button>
              )}
            </div>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-white/10 bg-[#0A0A0A] px-6 py-16 text-center">
            <PackageSearch className="mx-auto h-12 w-12 text-[#D4AF37]/60" />
            <h2 className="mt-5 text-xl font-bold text-white">
              {t.store.emptyTitle}
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#888888]">
              {t.store.emptyDescription}
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-white/10 bg-[#0A0A0A] px-6 py-16 text-center">
            <PackageSearch className="mx-auto h-12 w-12 text-[#D4AF37]/60" />
            <h2 className="mt-5 text-xl font-bold text-white">
              {t.store.noResultsTitle}
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#888888]">
              {t.store.noResultsDescription}
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 min-h-11 rounded-lg bg-[#D4AF37] px-5 text-sm font-bold text-black transition-colors hover:bg-[#E5C65B]"
            >
              {t.store.clearFilters}
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.slug}
                product={product}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
