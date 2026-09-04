import { LOW_STOCK_THRESHOLD } from "./constants"
import type {
  ProductAvailability,
  ProductVariant,
} from "./types"

export function getVariantEffectivePrice(
  basePrice: number,
  variant: Pick<
    ProductVariant,
    "priceOverride"
  >
) {
  return variant.priceOverride ?? basePrice
}

export function getActiveVariants(
  variants: ProductVariant[]
) {
  return variants.filter(
    (variant) => variant.active
  )
}

export function getTotalStock(
  variants: ProductVariant[]
) {
  return getActiveVariants(variants).reduce(
    (total, variant) =>
      total + Math.max(0, variant.stockQuantity),
    0
  )
}

export function getAvailabilityFromStock(
  stockQuantity: number
): ProductAvailability {
  if (stockQuantity <= 0) {
    return "out_of_stock"
  }

  if (
    stockQuantity <= LOW_STOCK_THRESHOLD
  ) {
    return "low_stock"
  }

  return "in_stock"
}

export function getProductAvailability(
  variants: ProductVariant[]
): ProductAvailability {
  const totalStock = getTotalStock(variants)

  return getAvailabilityFromStock(totalStock)
}

export function getVariantAvailability(
  variant: Pick<
    ProductVariant,
    "active" | "stockQuantity"
  >
): ProductAvailability {
  if (!variant.active) {
    return "out_of_stock"
  }

  return getAvailabilityFromStock(
    variant.stockQuantity
  )
}

export function isProductAvailable(
  variants: ProductVariant[]
) {
  return (
    getProductAvailability(variants) !==
    "out_of_stock"
  )
}

export function isVariantAvailable(
  variant: Pick<
    ProductVariant,
    "active" | "stockQuantity"
  >
) {
  return (
    getVariantAvailability(variant) !==
    "out_of_stock"
  )
}