import {
    type NextRequest,
    NextResponse,
  } from "next/server"

  import {
    getAuthenticatedAdmin,
  } from "@/lib/auth/auth-utils"

  import {
    addProductImages,
    deleteProductById,
    removeProductImageRecords,
    updateProduct,
  } from "@/lib/products/mutations"

  import {
    getAdminProductById,
    productReferenceExists,
    productSlugExists,
  } from "@/lib/products/queries"

  import {
    removeProductStorageFiles,
    uploadProductImages,
  } from "@/lib/products/storage"

  import type {
    StoreProduct,
  } from "@/lib/products/types"

  import {
    normalizeProductReference,
    normalizeProductSlug,
    parseProductUpdateInput,
    type ProductUpdatePayload,
  } from "@/lib/products/validation"

  export const dynamic = "force-dynamic"
  export const runtime = "nodejs"

  const PRIVATE_HEADERS = {
    "Cache-Control":
      "no-cache, no-store, must-revalidate, private",
    Pragma: "no-cache",
    Expires: "0",
  }

  function getErrorMessage(
    error: unknown
  ) {
    return error instanceof Error
      ? error.message
      : "Erro desconhecido"
  }

  function isUniqueViolation(
    message: string
  ) {
    const normalized =
      message.toLowerCase()

    return (
      message.includes("23505") ||
      normalized.includes(
        "duplicate key"
      ) ||
      normalized.includes(
        "unique constraint"
      )
    )
  }

  function getImageFiles(
    formData: FormData
  ) {
    return formData
      .getAll("images")
      .filter(
        (value): value is File =>
          value instanceof File &&
          value.size > 0
      )
  }

  function parsePayload(
    formData: FormData
  ): Record<string, unknown> {
    const rawPayload =
      formData.get("payload")

    if (rawPayload === null) {
      return {}
    }

    if (
      typeof rawPayload !== "string"
    ) {
      throw new Error(
        "Payload do produto inválido"
      )
    }

    let parsed: unknown

    try {
      parsed = JSON.parse(rawPayload)
    } catch {
      throw new Error(
        "Payload JSON inválido"
      )
    }

    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      throw new Error(
        "Payload do produto inválido"
      )
    }

    return parsed as Record<
      string,
      unknown
    >
  }

  function parseRemoveImageIds(
    formData: FormData
  ) {
    const raw =
      formData.get(
        "removeImageIds"
      )

    if (raw === null) {
      return [] as string[]
    }

    if (typeof raw !== "string") {
      throw new Error(
        "Lista de imagens a remover inválida"
      )
    }

    let parsed: unknown

    try {
      parsed = JSON.parse(raw)
    } catch {
      throw new Error(
        "Lista de imagens a remover inválida"
      )
    }

    if (
      !Array.isArray(parsed) ||
      !parsed.every(
        (value) =>
          typeof value === "string" &&
          value.trim().length > 0
      )
    ) {
      throw new Error(
        "Lista de imagens a remover inválida"
      )
    }

    return [
      ...new Set(
        parsed.map(
          (value) =>
            value.trim()
        )
      ),
    ]
  }

  function buildRollbackPayload(
    product: StoreProduct
  ): ProductUpdatePayload {
    return {
      name: product.name,
      slug: product.slug,
      reference:
        product.reference,
      description:
        product.description,
      category:
        product.category,
      price:
        product.price,
      currency:
        product.currency,
      variantLabel:
        product.variantLabel,
      active:
        product.active,
      featured:
        product.featured,
      displayOrder:
        product.displayOrder,

      variants:
        product.variants.map(
          (variant) => ({
            name:
              variant.name,

            stockQuantity:
              variant.stockQuantity,

            priceOverride:
              variant.priceOverride,

            active:
              variant.active,

            displayOrder:
              variant.displayOrder,
          })
        ),
    }
  }

  export async function GET(
    request: NextRequest,
    {
      params,
    }: {
      params: {
        id: string
      }
    }
  ) {
    try {
      const admin =
        await getAuthenticatedAdmin()

      if (!admin) {
        return NextResponse.json(
          {
            error: "Não autorizado",
          },
          {
            status: 401,
            headers: PRIVATE_HEADERS,
          }
        )
      }

      const product =
        await getAdminProductById(
          params.id
        )

      if (!product) {
        return NextResponse.json(
          {
            error:
              "Produto não encontrado",
          },
          {
            status: 404,
            headers: PRIVATE_HEADERS,
          }
        )
      }

      return NextResponse.json(
        {
          product,
        },
        {
          status: 200,
          headers: PRIVATE_HEADERS,
        }
      )
    } catch (error) {
      console.error(
        "[PRODUCT-ADMIN-GET] Erro:",
        error
      )

      return NextResponse.json(
        {
          error:
            "Não foi possível carregar o produto",
        },
        {
          status: 500,
          headers: PRIVATE_HEADERS,
        }
      )
    }
  }

  export async function PUT(
    request: NextRequest,
    {
      params,
    }: {
      params: {
        id: string
      }
    }
  ) {
    let uploadedPaths:
      string[] = []

    let addedImageIds:
      string[] = []

    let originalProduct:
      StoreProduct | null = null

    let coreUpdated = false

    try {
      const admin =
        await getAuthenticatedAdmin()

      if (!admin) {
        return NextResponse.json(
          {
            error: "Não autorizado",
          },
          {
            status: 401,
            headers: PRIVATE_HEADERS,
          }
        )
      }

      const productId =
        params.id

      originalProduct =
        await getAdminProductById(
          productId
        )

      if (!originalProduct) {
        return NextResponse.json(
          {
            error:
              "Produto não encontrado",
          },
          {
            status: 404,
            headers: PRIVATE_HEADERS,
          }
        )
      }

      const formData =
        await request.formData()

      const payload =
        parsePayload(formData)

      const normalizedPayload:
        Record<string, unknown> = {
          ...payload,
        }

      if (
        typeof payload.slug ===
        "string"
      ) {
        normalizedPayload.slug =
          normalizeProductSlug(
            payload.slug
          )
      }

      if (
        typeof payload.reference ===
        "string"
      ) {
        normalizedPayload.reference =
          normalizeProductReference(
            payload.reference
          )
      }

      const parsed =
        parseProductUpdateInput(
          normalizedPayload
        )

      if (!parsed.success) {
        return NextResponse.json(
          {
            error:
              parsed.error.issues[0]
                ?.message ||
              "Dados do produto inválidos",

            issues:
              parsed.error.issues,
          },
          {
            status: 400,
            headers: PRIVATE_HEADERS,
          }
        )
      }

      if (
        parsed.data.slug
      ) {
        const slugExists =
          await productSlugExists(
            parsed.data.slug,
            productId
          )

        if (slugExists) {
          return NextResponse.json(
            {
              error:
                "Já existe outro produto com este slug",
            },
            {
              status: 409,
              headers: PRIVATE_HEADERS,
            }
          )
        }
      }

      if (
        parsed.data.reference
      ) {
        const referenceExists =
          await productReferenceExists(
            parsed.data.reference,
            productId
          )

        if (referenceExists) {
          return NextResponse.json(
            {
              error:
                "Já existe outro produto com esta referência",
            },
            {
              status: 409,
              headers: PRIVATE_HEADERS,
            }
          )
        }
      }

      const removeImageIds =
        parseRemoveImageIds(
          formData
        )

      const imageById =
        new Map(
          originalProduct.images.map(
            (image) => [
              image.id,
              image,
            ]
          )
        )

      for (
        const imageId of
        removeImageIds
      ) {
        if (
          !imageById.has(
            imageId
          )
        ) {
          return NextResponse.json(
            {
              error:
                "Uma das imagens seleccionadas não pertence a este produto",
            },
            {
              status: 400,
              headers: PRIVATE_HEADERS,
            }
          )
        }
      }

      const imageFiles =
        getImageFiles(formData)

      let uploaded:
        Awaited<
          ReturnType<
            typeof uploadProductImages
          >
        > = []

      if (imageFiles.length) {
        uploaded =
          await uploadProductImages(
            productId,
            imageFiles
          )

        uploadedPaths =
          uploaded.map(
            (image) =>
              image.storagePath
          )
      }

      const updatedCore =
        await updateProduct(
          productId,
          parsed.data
        )

      coreUpdated = true

      if (uploaded.length) {
        const remainingImages =
          originalProduct.images.filter(
            (image) =>
              !removeImageIds.includes(
                image.id
              )
          )

        const maxOrder =
          remainingImages.reduce(
            (maximum, image) =>
              Math.max(
                maximum,
                image.displayOrder
              ),
            -1
          )

        const inserted =
          await addProductImages(
            productId,
            uploaded,
            {
              startingOrder:
                maxOrder + 1,

              altBase:
                updatedCore.name,
            }
          )

        addedImageIds =
          inserted.map(
            (image) =>
              image.id
          )
      }

      if (
        removeImageIds.length
      ) {
        await removeProductImageRecords(
          productId,
          removeImageIds
        )
      }

      const removedStoragePaths =
        removeImageIds
          .map(
            (imageId) =>
              imageById.get(
                imageId
              )?.storagePath
          )
          .filter(
            (
              path
            ): path is string =>
              Boolean(path)
          )

      let storageWarning:
        string | null = null

      if (
        removedStoragePaths.length
      ) {
        const cleanup =
          await removeProductStorageFiles(
            removedStoragePaths
          )

        if (
          cleanup.failed.length
        ) {
          storageWarning =
            "O produto foi actualizado, mas alguns ficheiros antigos não puderam ser removidos do Storage."
        }
      }

      let completeProduct:
        StoreProduct | null = null

      try {
        completeProduct =
          await getAdminProductById(
            productId
          )
      } catch (fetchError) {
        console.error(
          "[PRODUCT-ADMIN-PUT] Produto actualizado, mas a leitura final falhou:",
          fetchError
        )
      }

      return NextResponse.json(
        {
          product:
            completeProduct ||
            updatedCore,

          warning:
            storageWarning,
        },
        {
          status: 200,
          headers: PRIVATE_HEADERS,
        }
      )
    } catch (error) {
      console.error(
        "[PRODUCT-ADMIN-PUT] Erro:",
        error
      )

      if (
        addedImageIds.length &&
        originalProduct
      ) {
        try {
          await removeProductImageRecords(
            originalProduct.id,
            addedImageIds
          )
        } catch (cleanupError) {
          console.error(
            "[PRODUCT-ADMIN-PUT] Falha ao remover registos das novas imagens:",
            cleanupError
          )
        }
      }

      if (
        uploadedPaths.length
      ) {
        await removeProductStorageFiles(
          uploadedPaths
        )
      }

      if (
        coreUpdated &&
        originalProduct
      ) {
        try {
          await updateProduct(
            originalProduct.id,
            buildRollbackPayload(
              originalProduct
            )
          )
        } catch (rollbackError) {
          console.error(
            "[PRODUCT-ADMIN-PUT] Falha no rollback do produto:",
            rollbackError
          )
        }
      }

      const message =
        getErrorMessage(error)

      return NextResponse.json(
        {
          error:
            isUniqueViolation(
              message
            )
              ? "Já existe outro produto com o mesmo slug ou referência"
              : message,
        },
        {
          status:
            isUniqueViolation(
              message
            )
              ? 409
              : 500,
          headers: PRIVATE_HEADERS,
        }
      )
    }
  }

  export async function DELETE(
    request: NextRequest,
    {
      params,
    }: {
      params: {
        id: string
      }
    }
  ) {
    try {
      const admin =
        await getAuthenticatedAdmin()

      if (!admin) {
        return NextResponse.json(
          {
            error: "Não autorizado",
          },
          {
            status: 401,
            headers: PRIVATE_HEADERS,
          }
        )
      }

      const result =
        await deleteProductById(
          params.id
        )

      if (!result.deleted) {
        return NextResponse.json(
          {
            error:
              "Produto não encontrado",
          },
          {
            status: 404,
            headers: PRIVATE_HEADERS,
          }
        )
      }

      const cleanup =
        await removeProductStorageFiles(
          result.storagePaths
        )

      return NextResponse.json(
        {
          success: true,

          warning:
            cleanup.failed.length
              ? "O produto foi eliminado, mas alguns ficheiros não puderam ser removidos do Storage."
              : null,
        },
        {
          status: 200,
          headers: PRIVATE_HEADERS,
        }
      )
    } catch (error) {
      console.error(
        "[PRODUCT-ADMIN-DELETE] Erro:",
        error
      )

      return NextResponse.json(
        {
          error:
            getErrorMessage(error),
        },
        {
          status: 500,
          headers: PRIVATE_HEADERS,
        }
      )
    }
  }
