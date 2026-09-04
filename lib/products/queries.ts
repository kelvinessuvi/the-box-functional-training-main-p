import "server-only"

import { unstable_noStore as noStore } from "next/cache"

import {
  getServiceClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server"

import {
  getProductAvailability,
  getTotalStock,
} from "./availability"

import { normalizePrice } from "./format-price"

import type {
  ProductImage,
  ProductImageRow,
  ProductQueryOptions,
  ProductVariant,
  ProductVariantRow,
  ProductWithRelationsRow,
  PublicStoreProduct,
  StoreProduct,
} from "./types"

const PRODUCT_SELECT = `
  id,
  name,
  slug,
  reference,
  description,
  category,
  price,
  currency,
  variant_label,
  active,
  featured,
  display_order,
  created_at,
  updated_at,
  product_variants (
    id,
    product_id,
    name,
    stock_quantity,
    price_override,
    active,
    display_order,
    created_at,
    updated_at
  ),
  product_images (
    id,
    product_id,
    image_url,
    storage_path,
    alt_text,
    display_order,
    created_at
  )
`

function getRequiredServiceClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase não está configurado"
    )
  }

  const supabase = getServiceClient()

  if (!supabase) {
    throw new Error(
      "Cliente Supabase não disponível"
    )
  }

  return supabase
}

function mapVariant(
  row: ProductVariantRow
): ProductVariant {
  return {
    id: row.id,
    productId: row.product_id,
    name: row.name,
    stockQuantity: Math.max(
      0,
      Math.trunc(
        normalizePrice(
          row.stock_quantity
        )
      )
    ),
    priceOverride:
      row.price_override === null
        ? null
        : normalizePrice(
            row.price_override
          ),
    active: Boolean(row.active),
    displayOrder:
      row.display_order ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapImage(
  row: ProductImageRow
): ProductImage {
  return {
    id: row.id,
    productId: row.product_id,
    imageUrl: row.image_url,
    storagePath:
      row.storage_path,
    altText: row.alt_text,
    displayOrder:
      row.display_order ?? 0,
    createdAt: row.created_at,
  }
}

function sortVariants(
  variants: ProductVariant[]
) {
  return [...variants].sort(
    (a, b) => {
      if (
        a.displayOrder !==
        b.displayOrder
      ) {
        return (
          a.displayOrder -
          b.displayOrder
        )
      }

      return a.name.localeCompare(
        b.name,
        "pt"
      )
    }
  )
}

function sortImages(
  images: ProductImage[]
) {
  return [...images].sort(
    (a, b) =>
      a.displayOrder -
      b.displayOrder
  )
}

function mapProduct(
  row: ProductWithRelationsRow,
  options?: {
    publicOnly?: boolean
  }
): StoreProduct {
  const allVariants =
    sortVariants(
      (
        row.product_variants ??
        []
      ).map(mapVariant)
    )

  const activeVariants =
    allVariants.filter(
      (variant) =>
        variant.active
    )

  const stockVariants =
    options?.publicOnly
      ? activeVariants
      : allVariants

  const visibleVariants =
    options?.publicOnly
      ? row.variant_label
        ? activeVariants
        : []
      : allVariants

  const images = sortImages(
    (
      row.product_images ?? []
    ).map(mapImage)
  )

  const totalStock =
    getTotalStock(
      stockVariants
    )

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    reference: row.reference,
    description:
      row.description ?? "",
    category: row.category,
    price:
      normalizePrice(row.price),
    currency: row.currency,
    variantLabel:
      row.variant_label,
    active:
      Boolean(row.active),
    featured:
      Boolean(row.featured),
    displayOrder:
      row.display_order ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,

    variants:
      visibleVariants,
    images,

    totalStock,
    availability:
      getProductAvailability(
        stockVariants
      ),
    primaryImage:
      images[0] ?? null,
  }
}

function toPublicProduct(
  product: StoreProduct
): PublicStoreProduct {
  const images = product.images.map(
    (image) => ({
      imageUrl: image.imageUrl,
      altText: image.altText,
    })
  )

  return {
    name: product.name,
    slug: product.slug,
    reference: product.reference,
    description: product.description,
    category: product.category,
    price: product.price,
    currency: product.currency,
    variantLabel:
      product.variantLabel,
    featured: product.featured,

    variants:
      product.variants.map(
        (variant) => ({
          name: variant.name,
          stockQuantity:
            variant.stockQuantity,
          priceOverride:
            variant.priceOverride,
        })
      ),

    images,

    totalStock:
      product.totalStock,
    availability:
      product.availability,
    primaryImage:
      images[0] ?? null,
  }
}

export async function getPublicProducts(
  options: ProductQueryOptions = {}
): Promise<PublicStoreProduct[]> {
  noStore()

  const supabase =
    getRequiredServiceClient()

  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("active", true)
    .order("display_order", {
      ascending: true,
    })
    .order("created_at", {
      ascending: false,
    })

  if (options.category) {
    query = query.eq(
      "category",
      options.category
    )
  }

  if (
    typeof options.featured ===
    "boolean"
  ) {
    query = query.eq(
      "featured",
      options.featured
    )
  }

  if (
    options.limit &&
    options.limit > 0
  ) {
    query = query.limit(
      options.limit
    )
  }

  const { data, error } =
    await query

  if (error) {
    console.error(
      "[PRODUCTS] Erro ao carregar produtos públicos:",
      error.message
    )

    throw new Error(
      "Não foi possível carregar os produtos"
    )
  }

  return (
    (
      data as
        | ProductWithRelationsRow[]
        | null
    ) ?? []
  ).map((row) =>
    toPublicProduct(
      mapProduct(row, {
        publicOnly: true,
      })
    )
  )
}

export async function getPublicProductBySlug(
  slug: string
): Promise<PublicStoreProduct | null> {
  noStore()

  const supabase =
    getRequiredServiceClient()

  const { data, error } =
    await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("slug", slug)
      .eq("active", true)
      .maybeSingle()

  if (error) {
    console.error(
      "[PRODUCTS] Erro ao carregar produto público:",
      error.message
    )

    throw new Error(
      "Não foi possível carregar o produto"
    )
  }

  if (!data) {
    return null
  }

  return toPublicProduct(
    mapProduct(
      data as ProductWithRelationsRow,
      {
        publicOnly: true,
      }
    )
  )
}

export async function getAdminProducts(): Promise<
  StoreProduct[]
> {
  const supabase =
    getRequiredServiceClient()

  const { data, error } =
    await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .order("display_order", {
        ascending: true,
      })
      .order("created_at", {
        ascending: false,
      })

  if (error) {
    console.error(
      "[PRODUCTS-ADMIN] Erro ao carregar produtos:",
      error.message
    )

    throw new Error(
      "Não foi possível carregar os produtos"
    )
  }

  return (
    (
      data as
        | ProductWithRelationsRow[]
        | null
    ) ?? []
  ).map((row) =>
    mapProduct(row)
  )
}

export async function getAdminProductById(
  id: string
): Promise<StoreProduct | null> {
  const supabase =
    getRequiredServiceClient()

  const { data, error } =
    await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("id", id)
      .maybeSingle()

  if (error) {
    console.error(
      "[PRODUCTS-ADMIN] Erro ao carregar produto:",
      error.message
    )

    throw new Error(
      "Não foi possível carregar o produto"
    )
  }

  if (!data) {
    return null
  }

  return mapProduct(
    data as ProductWithRelationsRow
  )
}

export async function productSlugExists(
  slug: string,
  excludeProductId?: string
) {
  const supabase =
    getRequiredServiceClient()

  let query = supabase
    .from("products")
    .select("id")
    .eq("slug", slug)

  if (excludeProductId) {
    query = query.neq(
      "id",
      excludeProductId
    )
  }

  const { data, error } =
    await query.limit(1)

  if (error) {
    throw new Error(
      `Erro ao verificar slug: ${error.message}`
    )
  }

  return Boolean(
    data?.length
  )
}

export async function productReferenceExists(
  reference: string,
  excludeProductId?: string
) {
  const supabase =
    getRequiredServiceClient()

  let query = supabase
    .from("products")
    .select("id")
    .eq(
      "reference",
      reference
    )

  if (excludeProductId) {
    query = query.neq(
      "id",
      excludeProductId
    )
  }

  const { data, error } =
    await query.limit(1)

  if (error) {
    throw new Error(
      `Erro ao verificar referência: ${error.message}`
    )
  }

  return Boolean(
    data?.length
  )
}