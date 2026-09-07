import { notFound } from "next/navigation"

import { ProductDetail } from "@/components/store/product-detail" 
import { getPublicProductBySlug } from "@/lib/products/queries"
import { normalizeProductSlug } from "@/lib/products/validation"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

export default async function ProductPage({
  params,
}: {
  params: {
    slug: string
  }
}) {
  const slug = normalizeProductSlug(
    params.slug
  )

  if (!slug) {
    notFound()
  }

  const product =
    await getPublicProductBySlug(slug)

  if (!product) {
    notFound()
  }

  return <ProductDetail product={product} />
}
