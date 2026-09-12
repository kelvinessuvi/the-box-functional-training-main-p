import { StoreCatalog } from "@/components/store/store-catalog"
import { getPublicProducts } from "@/lib/products/queries"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

export default async function LojaPage() {
  const products = await getPublicProducts()

  return (
    <div className="min-h-screen bg-black pt-24 text-white">
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#D4AF37] sm:text-sm">
            THE BOX
          </p>

          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Loja
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#929292] sm:text-base">
            Equipamento, vestuário e acessórios THE BOX para acompanhar o teu treino dentro e fora da academia.
          </p>
        </div>
      </section>

      <div className="pt-6 sm:pt-8">
        <StoreCatalog products={products} />
      </div>
    </div>
  )
}
