import {
    type NextRequest,
    NextResponse,
  } from "next/server"

  import {
    getAuthenticatedAdmin,
  } from "@/lib/auth/auth-utils"

  import {
    addProductImages,
    createProduct,
    deleteProductById,
  } from "@/lib/products/mutations"

  import {
    getAdminProductById,
    getAdminProducts,
    productReferenceExists,
    productSlugExists,
  } from "@/lib/products/queries"

  import {
    removeProductStorageFiles,
    uploadProductImages,
  } from "@/lib/products/storage"

  import {
    normalizeProductReference,
    normalizeProductSlug,
    parseProductCreateInput,
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

    if (
      typeof rawPayload !== "string"
    ) {
      throw new Error(
        "Payload do produto em falta"
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

  export async function GET() {
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

      const products =
        await getAdminProducts()

      return NextResponse.json(
        {
          products,
        },
        {
          status: 200,
          headers: PRIVATE_HEADERS,
        }
      )
    } catch (error) {
      console.error(
        "[PRODUCTS-ADMIN-GET] Erro:",
        error
      )

      return NextResponse.json(
        {
          error:
            "Não foi possível carregar os produtos",
        },
        {
          status: 500,
          headers: PRIVATE_HEADERS,
        }
      )
    }
  }

  export async function POST(
    request: NextRequest
  ) {
    let createdProductId:
      | string
      | null = null

    let uploadedPaths:
      string[] = []

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

      const formData =
        await request.formData()

      const payload =
        parsePayload(formData)

      const nameValue =
        typeof payload.name === "string"
          ? payload.name
          : ""

      const slugValue =
        typeof payload.slug === "string" &&
        payload.slug.trim()
          ? payload.slug
          : nameValue

      const referenceValue =
        typeof payload.reference === "string"
          ? payload.reference
          : ""

      const normalizedPayload = {
        ...payload,

        slug:
          normalizeProductSlug(
            slugValue
          ),

        reference:
          normalizeProductReference(
            referenceValue
          ),
      }

      const parsed =
        parseProductCreateInput(
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

      const slugExists =
        await productSlugExists(
          parsed.data.slug
        )

      if (slugExists) {
        return NextResponse.json(
          {
            error:
              "Já existe um produto com este slug",
          },
          {
            status: 409,
            headers: PRIVATE_HEADERS,
          }
        )
      }

      const referenceExists =
        await productReferenceExists(
          parsed.data.reference
        )

      if (referenceExists) {
        return NextResponse.json(
          {
            error:
              "Já existe um produto com esta referência",
          },
          {
            status: 409,
            headers: PRIVATE_HEADERS,
          }
        )
      }

      const imageFiles =
        getImageFiles(formData)

      const created =
        await createProduct(
          parsed.data
        )

      createdProductId =
        created.id

      if (imageFiles.length) {
        const uploaded =
          await uploadProductImages(
            created.id,
            imageFiles
          )

        uploadedPaths =
          uploaded.map(
            (image) =>
              image.storagePath
          )

        await addProductImages(
          created.id,
          uploaded,
          {
            startingOrder: 0,
            altBase: created.name,
          }
        )
      }

      const completeProduct =
        await getAdminProductById(
          created.id
        )

      if (!completeProduct) {
        throw new Error(
          "Produto criado, mas não foi possível recuperá-lo"
        )
      }

      return NextResponse.json(
        {
          product:
            completeProduct,
        },
        {
          status: 201,
          headers: PRIVATE_HEADERS,
        }
      )
    } catch (error) {
      console.error(
        "[PRODUCTS-ADMIN-POST] Erro:",
        error
      )

      if (createdProductId) {
        try {
          const deletion =
            await deleteProductById(
              createdProductId
            )

          const storagePaths = [
            ...uploadedPaths,
            ...deletion.storagePaths,
          ]

          if (storagePaths.length) {
            await removeProductStorageFiles(
              storagePaths
            )
          }
        } catch (cleanupError) {
          console.error(
            "[PRODUCTS-ADMIN-POST] Falha no rollback:",
            cleanupError
          )

          if (
            uploadedPaths.length
          ) {
            await removeProductStorageFiles(
              uploadedPaths
            )
          }
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
              ? "Já existe um produto com o mesmo slug ou referência"
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
