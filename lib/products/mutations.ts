import "server-only"

import {
  getServiceClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server"

import {
  TECHNICAL_SINGLE_VARIANT_NAME,
} from "./constants"

import {
  getAdminProductById,
} from "./queries"

import type {
  ProductVariant,
  StoreProduct,
} from "./types"

import type {
  ProductCreatePayload,
  ProductUpdatePayload,
  ProductVariantPayload,
} from "./validation"

import type {
  UploadedProductImage,
} from "./storage"

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

function prepareVariants(
  variantLabel: string | null,
  variants: ProductVariantPayload[]
) {
  if (!variants.length) {
    throw new Error(
      "O produto deve possuir pelo menos uma variante"
    )
  }

  if (!variantLabel) {
    const firstVariant = variants[0]

    return [
      {
        name:
          TECHNICAL_SINGLE_VARIANT_NAME,
        stock_quantity:
          firstVariant.stockQuantity,
        price_override:
          firstVariant.priceOverride ??
          null,
        active:
          firstVariant.active ?? true,
        display_order: 0,
      },
    ]
  }

  const usedNames = new Set<string>()

  return variants.map(
    (variant, index) => {
      const name = variant.name.trim()

      const normalizedName =
        name.toLocaleLowerCase("pt")

      if (
        usedNames.has(normalizedName)
      ) {
        throw new Error(
          `A variante "${name}" está repetida`
        )
      }

      usedNames.add(normalizedName)

      return {
        name,
        stock_quantity:
          variant.stockQuantity,
        price_override:
          variant.priceOverride ?? null,
        active:
          variant.active ?? true,
        display_order:
          variant.displayOrder ?? index,
      }
    }
  )
}

function mapCurrentVariantsForRestore(
  variants: ProductVariant[]
) {
  return variants.map((variant) => ({
    name: variant.name,
    stock_quantity:
      variant.stockQuantity,
    price_override:
      variant.priceOverride,
    active: variant.active,
    display_order:
      variant.displayOrder,
  }))
}

async function restoreVariants(
  productId: string,
  variants: ReturnType<
    typeof mapCurrentVariantsForRestore
  >
) {
  const supabase =
    getRequiredServiceClient()

  try {
    await supabase
      .from("product_variants")
      .delete()
      .eq("product_id", productId)

    if (variants.length) {
      const { error } =
        await supabase
          .from("product_variants")
          .insert(
            variants.map(
              (variant) => ({
                product_id: productId,
                ...variant,
              })
            )
          )

      if (error) {
        console.error(
          "[PRODUCTS] Falha ao restaurar variantes:",
          error.message
        )
      }
    }
  } catch (error) {
    console.error(
      "[PRODUCTS] Erro ao restaurar variantes:",
      error
    )
  }
}

export async function createProduct(
  input: ProductCreatePayload
): Promise<StoreProduct> {
  const supabase =
    getRequiredServiceClient()

  const { data: product, error } =
    await supabase
      .from("products")
      .insert({
        name: input.name,
        slug: input.slug,
        reference: input.reference,
        description:
          input.description || "",
        category: input.category,
        price: input.price,
        currency: input.currency,
        variant_label:
          input.variantLabel ?? null,
        active: input.active,
        featured: input.featured,
        display_order:
          input.displayOrder,
      })
      .select("id")
      .single()

  if (error || !product) {
    console.error(
      "[PRODUCTS] Erro ao criar produto:",
      error?.message
    )

    throw new Error(
      error?.message ||
        "Não foi possível criar o produto"
    )
  }

  const productId = product.id

  try {
    const variants =
      prepareVariants(
        input.variantLabel ?? null,
        input.variants
      )

    const { error: variantError } =
      await supabase
        .from("product_variants")
        .insert(
          variants.map((variant) => ({
            product_id: productId,
            ...variant,
          }))
        )

    if (variantError) {
      throw new Error(
        variantError.message
      )
    }

    const created =
      await getAdminProductById(
        productId
      )

    if (!created) {
      throw new Error(
        "Produto criado, mas não foi possível recuperá-lo"
      )
    }

    return created
  } catch (error) {
    await supabase
      .from("products")
      .delete()
      .eq("id", productId)

    throw error
  }
}

export async function updateProduct(
  productId: string,
  input: ProductUpdatePayload
): Promise<StoreProduct> {
  const supabase =
    getRequiredServiceClient()

  const current =
    await getAdminProductById(
      productId
    )

  if (!current) {
    throw new Error(
      "Produto não encontrado"
    )
  }

  const variantLabelChanged =
    input.variantLabel !== undefined &&
    input.variantLabel !==
      current.variantLabel

  if (
    variantLabelChanged &&
    !input.variants
  ) {
    throw new Error(
      "Ao alterar o tipo de variante, envie também as variantes do produto"
    )
  }

  const previousVariants =
    mapCurrentVariantsForRestore(
      current.variants
    )

  let variantsReplaced = false

  try {
    if (input.variants) {
      const nextVariantLabel =
        input.variantLabel !== undefined
          ? input.variantLabel
          : current.variantLabel

      const preparedVariants =
        prepareVariants(
          nextVariantLabel,
          input.variants
        )

      const { error: deleteError } =
        await supabase
          .from("product_variants")
          .delete()
          .eq(
            "product_id",
            productId
          )

      if (deleteError) {
        throw new Error(
          deleteError.message
        )
      }

      variantsReplaced = true

      const { error: insertError } =
        await supabase
          .from("product_variants")
          .insert(
            preparedVariants.map(
              (variant) => ({
                product_id:
                  productId,
                ...variant,
              })
            )
          )

      if (insertError) {
        await restoreVariants(
          productId,
          previousVariants
        )

        throw new Error(
          insertError.message
        )
      }
    }

    const productUpdate:
      Record<string, unknown> = {}

    if (input.name !== undefined) {
      productUpdate.name =
        input.name
    }

    if (input.slug !== undefined) {
      productUpdate.slug =
        input.slug
    }

    if (
      input.reference !== undefined
    ) {
      productUpdate.reference =
        input.reference
    }

    if (
      input.description !== undefined
    ) {
      productUpdate.description =
        input.description
    }

    if (
      input.category !== undefined
    ) {
      productUpdate.category =
        input.category
    }

    if (input.price !== undefined) {
      productUpdate.price =
        input.price
    }

    if (
      input.currency !== undefined
    ) {
      productUpdate.currency =
        input.currency
    }

    if (
      input.variantLabel !== undefined
    ) {
      productUpdate.variant_label =
        input.variantLabel
    }

    if (input.active !== undefined) {
      productUpdate.active =
        input.active
    }

    if (
      input.featured !== undefined
    ) {
      productUpdate.featured =
        input.featured
    }

    if (
      input.displayOrder !== undefined
    ) {
      productUpdate.display_order =
        input.displayOrder
    }

    if (
      Object.keys(productUpdate).length
    ) {
      const { error: updateError } =
        await supabase
          .from("products")
          .update(productUpdate)
          .eq("id", productId)

      if (updateError) {
        if (variantsReplaced) {
          await restoreVariants(
            productId,
            previousVariants
          )
        }

        throw new Error(
          updateError.message
        )
      }
    }

    const updated =
      await getAdminProductById(
        productId
      )

    if (!updated) {
      throw new Error(
        "Não foi possível recuperar o produto actualizado"
      )
    }

    return updated
  } catch (error) {
    throw error
  }
}

export async function addProductImages(
  productId: string,
  images: UploadedProductImage[],
  options?: {
    startingOrder?: number
    altBase?: string
  }
) {
  if (!images.length) {
    return []
  }

  const supabase =
    getRequiredServiceClient()

  const startingOrder =
    options?.startingOrder ?? 0

  const altBase =
    options?.altBase?.trim() ||
    "Produto THE BOX"

  const { data, error } =
    await supabase
      .from("product_images")
      .insert(
        images.map(
          (image, index) => ({
            product_id: productId,
            image_url:
              image.imageUrl,
            storage_path:
              image.storagePath,
            alt_text:
              `${altBase} - imagem ${startingOrder + index + 1}`,
            display_order:
              startingOrder + index,
          })
        )
      )
      .select(
        "id, storage_path"
      )

  if (error) {
    throw new Error(
      error.message
    )
  }

  return data ?? []
}

export async function removeProductImageRecords(
  productId: string,
  imageIds: string[]
) {
  if (!imageIds.length) {
    return
  }

  const supabase =
    getRequiredServiceClient()

  const { error } =
    await supabase
      .from("product_images")
      .delete()
      .eq("product_id", productId)
      .in("id", imageIds)

  if (error) {
    throw new Error(
      error.message
    )
  }
}

export async function deleteProductById(
  productId: string
) {
  const supabase =
    getRequiredServiceClient()

  const current =
    await getAdminProductById(
      productId
    )

  if (!current) {
    return {
      deleted: false,
      storagePaths: [] as string[],
    }
  }

  const storagePaths =
    current.images.map(
      (image) => image.storagePath
    )

  const { error } =
    await supabase
      .from("products")
      .delete()
      .eq("id", productId)

  if (error) {
    throw new Error(
      error.message
    )
  }

  return {
    deleted: true,
    storagePaths,
  }
}