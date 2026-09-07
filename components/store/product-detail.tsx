"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  MessageCircle,
  Package,
} from "lucide-react"

import { useTranslation } from "@/contexts/language-context"
import type {
  PublicProductVariant,
  PublicStoreProduct,
} from "@/lib/products/types"
import {
  buildWhatsAppOrderMessage,
  buildWhatsAppOrderUrl,
  formatOrderPrice,
  normalizeWhatsAppNumber,
} from "@/lib/products/whatsapp"

interface ProductDetailProps {
  product: PublicStoreProduct
}

export function ProductDetail({
  product,
}: ProductDetailProps) {
  const { t, language } = useTranslation()

  const [selectedImageIndex, setSelectedImageIndex] =
    useState(0)
  const [selectedVariantName, setSelectedVariantName] =
    useState<string | null>(null)
  const [whatsappNumber, setWhatsappNumber] =
    useState("")
  const [settingsLoading, setSettingsLoading] =
    useState(true)
  const [settingsError, setSettingsError] =
    useState(false)

  useEffect(() => {
    let cancelled = false

    const loadSettings = async () => {
      try {
        const response = await fetch(
          "/api/settings",
          {
            cache: "no-store",
            headers: {
              "Cache-Control":
                "no-cache, no-store, must-revalidate",
            },
          }
        )

        if (!response.ok) {
          throw new Error(
            `Settings HTTP ${response.status}`
          )
        }

        const data = await response.json()
        const normalized =
          normalizeWhatsAppNumber(
            data.whatsappNumber || ""
          )

        if (!normalized) {
          throw new Error(
            "WhatsApp não configurado"
          )
        }

        if (!cancelled) {
          setWhatsappNumber(normalized)
          setSettingsError(false)
        }
      } catch (error) {
        console.error(
          "[STORE] Erro ao carregar WhatsApp:",
          error
        )

        if (!cancelled) {
          setWhatsappNumber("")
          setSettingsError(true)
        }
      } finally {
        if (!cancelled) {
          setSettingsLoading(false)
        }
      }
    }

    loadSettings()

    return () => {
      cancelled = true
    }
  }, [])

  const selectedVariant = useMemo(() => {
    if (!selectedVariantName) {
      return null
    }

    return (
      product.variants.find(
        (variant) =>
          variant.name ===
          selectedVariantName
      ) ?? null
    )
  }, [product.variants, selectedVariantName])

  const selectedImage =
    product.images[selectedImageIndex] ??
    product.primaryImage

  const effectivePrice =
    selectedVariant?.priceOverride ??
    product.price

  const hasVariants =
    Boolean(product.variantLabel) &&
    product.variants.length > 0

  const variantRequired =
    hasVariants && !selectedVariant

  const selectedVariantOutOfStock =
    Boolean(
      selectedVariant &&
        selectedVariant.stockQuantity <= 0
    )

  const productOutOfStock =
    product.availability ===
    "out_of_stock"

  const canOrder =
    !settingsLoading &&
    !settingsError &&
    Boolean(whatsappNumber) &&
    !productOutOfStock &&
    !variantRequired &&
    !selectedVariantOutOfStock

  const availabilityLabel =
    product.availability === "in_stock"
      ? t.store.inStock
      : product.availability === "low_stock"
        ? t.store.lowStock
        : t.store.outOfStock

  const categoryLabel =
    t.store.categories[product.category]

  const handlePreviousImage = () => {
    if (product.images.length <= 1) {
      return
    }

    setSelectedImageIndex((current) =>
      current === 0
        ? product.images.length - 1
        : current - 1
    )
  }

  const handleNextImage = () => {
    if (product.images.length <= 1) {
      return
    }

    setSelectedImageIndex((current) =>
      current === product.images.length - 1
        ? 0
        : current + 1
    )
  }

  const handleOrder = () => {
    if (!canOrder) {
      return
    }

    const message =
      buildWhatsAppOrderMessage({
        productName: product.name,
        reference: product.reference,
        variantLabel: product.variantLabel,
        variantName:
          selectedVariant?.name ?? null,
        price: effectivePrice,
        currency: product.currency,
        language,
      })

    const url = buildWhatsAppOrderUrl(
      whatsappNumber,
      message
    )

    if (!url) {
      return
    }

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    )
  }

  const getVariantButtonClass = (
    variant: PublicProductVariant
  ) => {
    const isSelected =
      selectedVariantName === variant.name
    const isOutOfStock =
      variant.stockQuantity <= 0

    if (isOutOfStock) {
      return "cursor-not-allowed border-white/5 bg-white/[0.03] text-[#555555] line-through"
    }

    if (isSelected) {
      return "border-[#D4AF37] bg-[#D4AF37] text-black"
    }

    return "border-white/10 bg-black text-white hover:border-[#D4AF37]/60"
  }

  return (
    <div className="min-h-screen bg-black pb-24 pt-24 text-white sm:pb-16 sm:pt-28">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <Link
          href="/loja"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg pr-3 text-sm font-semibold text-[#B3B3B3] transition-colors hover:text-[#D4AF37]"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.store.backToStore}
        </Link>

        <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] lg:gap-12">
          <section>
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0A] sm:aspect-[4/3] lg:aspect-square">
              {selectedImage ? (
                <Image
                  src={selectedImage.imageUrl}
                  alt={
                    selectedImage.altText ||
                    product.name
                  }
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ImageIcon className="h-14 w-14 text-white/20" />
                </div>
              )}

              {product.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePreviousImage}
                    aria-label={t.store.previousImage}
                    className="absolute left-3 top-1/2 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/70 text-white backdrop-blur-sm transition-colors hover:border-[#D4AF37] hover:text-[#D4AF37]"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleNextImage}
                    aria-label={t.store.nextImage}
                    className="absolute right-3 top-1/2 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/70 text-white backdrop-blur-sm transition-colors hover:border-[#D4AF37] hover:text-[#D4AF37]"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="mt-3 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {product.images.map(
                  (image, index) => (
                    <button
                      key={`${image.imageUrl}-${index}`}
                      type="button"
                      onClick={() =>
                        setSelectedImageIndex(index)
                      }
                      className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border transition-colors sm:h-24 sm:w-24 ${
                        selectedImageIndex === index
                          ? "border-[#D4AF37]"
                          : "border-white/10 hover:border-white/30"
                      }`}
                      aria-label={`${t.store.image} ${index + 1}`}
                    >
                      <Image
                        src={image.imageUrl}
                        alt={
                          image.altText ||
                          product.name
                        }
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </button>
                  )
                )}
              </div>
            )}
          </section>

          <section className="lg:pt-2">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 bg-[#0A0A0A] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#A0A0A0]">
                {categoryLabel}
              </span>

              {product.featured && (
                <span className="rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#D4AF37]">
                  {t.store.featured}
                </span>
              )}
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {product.name}
            </h1>

            <p className="mt-3 text-sm text-[#777777]">
              {t.store.reference}: {product.reference}
            </p>

            <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-y border-white/10 py-5">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#777777]">
                  {t.store.price}
                </p>
                <p className="mt-1 text-3xl font-bold text-white">
                  {formatOrderPrice(
                    effectivePrice,
                    product.currency,
                    language
                  )}
                </p>
              </div>

              <div className="text-right">
                <p
                  className={`text-sm font-bold ${
                    product.availability ===
                    "out_of_stock"
                      ? "text-[#777777]"
                      : product.availability ===
                          "low_stock"
                        ? "text-[#D4AF37]"
                        : "text-emerald-300"
                  }`}
                >
                  {availabilityLabel}
                </p>
                <p className="mt-1 text-xs text-[#666666]">
                  {product.totalStock}{" "}
                  {product.totalStock === 1
                    ? t.store.unitAvailable
                    : t.store.unitsAvailable}
                </p>
              </div>
            </div>

            {product.description && (
              <div className="mt-7">
                <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[#D4AF37]">
                  {t.store.description}
                </h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#B3B3B3] sm:text-base">
                  {product.description}
                </p>
              </div>
            )}

            {hasVariants && (
              <div className="mt-8">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-white">
                    {t.store.selectVariant}:{" "}
                    <span className="text-[#D4AF37]">
                      {product.variantLabel}
                    </span>
                  </h2>

                  {selectedVariant && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#D4AF37]">
                      <Check className="h-3.5 w-3.5" />
                      {selectedVariant.name}
                    </span>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {product.variants.map(
                    (variant) => (
                      <button
                        key={variant.name}
                        type="button"
                        disabled={
                          variant.stockQuantity <= 0
                        }
                        onClick={() =>
                          setSelectedVariantName(
                            variant.name
                          )
                        }
                        className={`min-h-12 rounded-xl border px-3 py-2 text-sm font-bold transition-colors ${getVariantButtonClass(
                          variant
                        )}`}
                      >
                        <span className="block">
                          {variant.name}
                        </span>
                        <span className="mt-0.5 block text-[10px] font-medium opacity-70">
                          {variant.stockQuantity > 0
                            ? `${variant.stockQuantity} ${t.store.availableShort}`
                            : t.store.outOfStock}
                        </span>
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            <div className="mt-8 hidden rounded-2xl border border-white/10 bg-[#0A0A0A] p-4 sm:block">
              <OrderButton
                canOrder={canOrder}
                loading={settingsLoading}
                settingsError={settingsError}
                variantRequired={variantRequired}
                productOutOfStock={productOutOfStock}
                onOrder={handleOrder}
              />
            </div>
          </section>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-black/95 p-3 backdrop-blur-md sm:hidden">
        <div className="mx-auto max-w-7xl">
          <OrderButton
            canOrder={canOrder}
            loading={settingsLoading}
            settingsError={settingsError}
            variantRequired={variantRequired}
            productOutOfStock={productOutOfStock}
            onOrder={handleOrder}
          />
        </div>
      </div>
    </div>
  )
}

function OrderButton({
  canOrder,
  loading,
  settingsError,
  variantRequired,
  productOutOfStock,
  onOrder,
}: {
  canOrder: boolean
  loading: boolean
  settingsError: boolean
  variantRequired: boolean
  productOutOfStock: boolean
  onOrder: () => void
}) {
  const { t } = useTranslation()

  let helperText: string = t.store.orderHelper

  if (loading) {
    helperText = t.store.loadingContact
  } else if (settingsError) {
    helperText = t.store.contactUnavailable
  } else if (productOutOfStock) {
    helperText = t.store.outOfStockHelper
  } else if (variantRequired) {
    helperText = t.store.selectVariantHelper
  }

  return (
    <div>
      <button
        type="button"
        disabled={!canOrder}
        onClick={onOrder}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-5 text-sm font-bold text-black transition-colors hover:bg-[#E5C65B] disabled:cursor-not-allowed disabled:bg-[#292929] disabled:text-[#777777]"
      >
        {productOutOfStock ? (
          <Package className="h-5 w-5" />
        ) : (
          <MessageCircle className="h-5 w-5" />
        )}
        {productOutOfStock
          ? t.store.outOfStock
          : t.store.orderWhatsApp}
      </button>

      <p className="mt-2 text-center text-xs leading-5 text-[#666666]">
        {helperText}
      </p>
    </div>
  )
}
