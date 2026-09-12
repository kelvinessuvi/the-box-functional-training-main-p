import type { STORE_CATEGORIES } from "./constants"

export type ProductCategory =
  (typeof STORE_CATEGORIES)[number]

export type ProductAvailability =
  | "in_stock"
  | "low_stock"
  | "out_of_stock"

export interface ProductVariantRow {
  id: string
  product_id: string
  name: string
  stock_quantity: number | string
  price_override: number | string | null
  active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface ProductImageRow {
  id: string
  product_id: string
  image_url: string
  storage_path: string
  alt_text: string | null
  display_order: number
  created_at: string
}

export interface ProductRow {
  id: string
  name: string
  slug: string
  reference: string
  description: string
  category: ProductCategory
  price: number | string
  currency: string
  variant_label: string | null
  active: boolean
  featured: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface ProductVariant {
  id: string
  productId: string
  name: string
  stockQuantity: number
  priceOverride: number | null
  active: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export interface ProductImage {
  id: string
  productId: string
  imageUrl: string
  storagePath: string
  altText: string | null
  displayOrder: number
  createdAt: string
}

export interface StoreProduct {
  id: string
  name: string
  slug: string
  reference: string
  description: string
  category: ProductCategory
  price: number
  currency: string
  variantLabel: string | null
  active: boolean
  featured: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string

  variants: ProductVariant[]
  images: ProductImage[]

  totalStock: number
  availability: ProductAvailability
  primaryImage: ProductImage | null
}

export interface PublicProductVariant {
  name: string
  stockQuantity: number
  priceOverride: number | null
}

export interface PublicProductImage {
  imageUrl: string
  altText: string | null
}

export interface PublicStoreProduct {
  name: string
  slug: string
  reference: string
  description: string
  category: ProductCategory
  price: number
  currency: string
  variantLabel: string | null
  featured: boolean

  variants: PublicProductVariant[]
  images: PublicProductImage[]

  totalStock: number
  availability: ProductAvailability
  primaryImage: PublicProductImage | null
}

export interface ProductVariantInput {
  name: string
  stockQuantity: number
  priceOverride?: number | null
  active?: boolean
  displayOrder?: number
}

export interface ProductCreateInput {
  name: string
  slug: string
  reference: string
  description?: string
  category: ProductCategory
  price: number
  currency?: string
  variantLabel?: string | null
  active?: boolean
  featured?: boolean
  displayOrder?: number
  variants: ProductVariantInput[]
}

export interface ProductUpdateInput {
  name?: string
  slug?: string
  reference?: string
  description?: string
  category?: ProductCategory
  price?: number
  currency?: string
  variantLabel?: string | null
  active?: boolean
  featured?: boolean
  displayOrder?: number
  variants?: ProductVariantInput[]
}

export interface ProductQueryOptions {
  category?: ProductCategory
  featured?: boolean
  limit?: number
}

export interface ProductWithRelationsRow
  extends ProductRow {
  product_variants?: ProductVariantRow[] | null
  product_images?: ProductImageRow[] | null
}