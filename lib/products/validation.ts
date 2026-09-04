import { z } from "zod"

import {
  DEFAULT_STORE_CURRENCY,
  PRODUCT_REFERENCE_PATTERN,
  PRODUCT_SLUG_PATTERN,
  STORE_CATEGORIES,
} from "./constants"

export const productCategorySchema =
  z.enum(STORE_CATEGORIES)

export const productSlugSchema = z
  .string()
  .trim()
  .min(1, "Slug é obrigatório")
  .max(160, "Slug demasiado longo")
  .regex(
    PRODUCT_SLUG_PATTERN,
    "Slug inválido. Utilize apenas letras minúsculas, números e hífens."
  )

export const productReferenceSchema = z
  .string()
  .trim()
  .min(2, "Referência é obrigatória")
  .max(80, "Referência demasiado longa")
  .regex(
    PRODUCT_REFERENCE_PATTERN,
    "Referência contém caracteres inválidos"
  )

export const productVariantInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nome da variante é obrigatório")
    .max(100, "Nome da variante demasiado longo"),

  stockQuantity: z.coerce
    .number()
    .int("Stock deve ser um número inteiro")
    .min(0, "Stock não pode ser negativo"),

  priceOverride: z
    .union([
      z.coerce.number().min(
        0,
        "Preço da variante não pode ser negativo"
      ),
      z.null(),
    ])
    .optional(),

  active: z.boolean().optional().default(true),

  displayOrder: z.coerce
    .number()
    .int()
    .min(0)
    .optional()
    .default(0),
})

export const productCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nome do produto é obrigatório")
    .max(160, "Nome do produto demasiado longo"),

  slug: productSlugSchema,

  reference: productReferenceSchema,

  description: z
    .string()
    .trim()
    .max(5000, "Descrição demasiado longa")
    .optional()
    .default(""),

  category: productCategorySchema,

  price: z.coerce
    .number()
    .min(0, "Preço não pode ser negativo"),

  currency: z
    .string()
    .trim()
    .length(3, "Moeda deve utilizar 3 caracteres")
    .transform((value) => value.toUpperCase())
    .default(DEFAULT_STORE_CURRENCY),

  variantLabel: z
    .union([
      z
        .string()
        .trim()
        .min(1)
        .max(80),
      z.null(),
    ])
    .optional()
    .default(null),

  active: z.boolean().optional().default(true),

  featured: z.boolean().optional().default(false),

  displayOrder: z.coerce
    .number()
    .int()
    .min(0)
    .optional()
    .default(0),

  variants: z
    .array(productVariantInputSchema)
    .min(
      1,
      "O produto deve possuir pelo menos uma variante"
    ),
})

export const productUpdateSchema =
  productCreateSchema.partial().extend({
    variants: z
      .array(productVariantInputSchema)
      .min(
        1,
        "O produto deve possuir pelo menos uma variante"
      )
      .optional(),
  })

export type ProductCreatePayload =
  z.infer<typeof productCreateSchema>

export type ProductUpdatePayload =
  z.infer<typeof productUpdateSchema>

export type ProductVariantPayload =
  z.infer<typeof productVariantInputSchema>

export function normalizeProductSlug(
  value: string
) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function normalizeProductReference(
  value: string
) {
  return value
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "-")
}

export function parseProductCreateInput(
  value: unknown
) {
  return productCreateSchema.safeParse(value)
}

export function parseProductUpdateInput(
  value: unknown
) {
  return productUpdateSchema.safeParse(value)
}