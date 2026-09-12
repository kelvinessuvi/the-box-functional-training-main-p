import { type NextRequest, NextResponse } from "next/server"

import { getPublicProducts } from "@/lib/products/queries"
import { productCategorySchema } from "@/lib/products/validation"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

const PUBLIC_HEADERS = {
  "Cache-Control": "no-store, max-age=0, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const categoryParam = searchParams.get("category")
    const featuredParam = searchParams.get("featured")
    const limitParam = searchParams.get("limit")

    let category:
      | "vestuario"
      | "equipamento"
      | "acessorios"
      | undefined

    if (categoryParam) {
      const categoryResult =
        productCategorySchema.safeParse(categoryParam)

      if (!categoryResult.success) {
        return NextResponse.json(
          {
            error: "Categoria de produto inválida",
          },
          {
            status: 400,
            headers: PUBLIC_HEADERS,
          }
        )
      }

      category = categoryResult.data
    }

    let featured: boolean | undefined

    if (featuredParam !== null) {
      if (
        featuredParam !== "true" &&
        featuredParam !== "false"
      ) {
        return NextResponse.json(
          {
            error:
              "O parâmetro featured deve ser true ou false",
          },
          {
            status: 400,
            headers: PUBLIC_HEADERS,
          }
        )
      }

      featured = featuredParam === "true"
    }

    let limit: number | undefined

    if (limitParam !== null) {
      const parsedLimit = Number(limitParam)

      if (
        !Number.isInteger(parsedLimit) ||
        parsedLimit < 1 ||
        parsedLimit > 100
      ) {
        return NextResponse.json(
          {
            error:
              "O parâmetro limit deve ser um número inteiro entre 1 e 100",
          },
          {
            status: 400,
            headers: PUBLIC_HEADERS,
          }
        )
      }

      limit = parsedLimit
    }

    const products = await getPublicProducts({
      category,
      featured,
      limit,
    })

    return NextResponse.json(
      {
        products,
      },
      {
        status: 200,
        headers: PUBLIC_HEADERS,
      }
    )
  } catch (error) {
    console.error(
      "[PRODUCTS-PUBLIC] Erro:",
      error
    )

    return NextResponse.json(
      {
        error:
          "Não foi possível carregar os produtos",
      },
      {
        status: 500,
        headers: PUBLIC_HEADERS,
      }
    )
  }
}