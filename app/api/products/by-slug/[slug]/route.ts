import { NextResponse } from "next/server"

import {
  getPublicProductBySlug,
} from "@/lib/products/queries"

import {
  normalizeProductSlug,
} from "@/lib/products/validation"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

const PUBLIC_HEADERS = {
  "Cache-Control": "no-store, max-age=0, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
}

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: {
      slug: string
    }
  }
) {
  try {
    const slug = normalizeProductSlug(
      params.slug
    )

    if (!slug) {
      return NextResponse.json(
        {
          error: "Slug inválido",
        },
        {
          status: 400,
          headers: PUBLIC_HEADERS,
        }
      )
    }

    const product =
      await getPublicProductBySlug(slug)

    if (!product) {
      return NextResponse.json(
        {
          error: "Produto não encontrado",
        },
        {
          status: 404,
          headers: PUBLIC_HEADERS,
        }
      )
    }

    return NextResponse.json(
      {
        product,
      },
      {
        status: 200,
        headers: PUBLIC_HEADERS,
      }
    )
  } catch (error) {
    console.error(
      "[PRODUCT-BY-SLUG] Erro:",
      error
    )

    return NextResponse.json(
      {
        error:
          "Não foi possível carregar o produto",
      },
      {
        status: 500,
        headers: PUBLIC_HEADERS,
      }
    )
  }
}