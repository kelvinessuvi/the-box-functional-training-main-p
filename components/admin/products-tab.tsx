"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  AlertTriangle,
  CheckCircle2,
  Edit3,
  ImageIcon,
  Package,
  Plus,
  RefreshCw,
  Search,
  Star,
  Trash2,
  Upload,
  X,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

type ProductCategory =
  | "vestuario"
  | "equipamento"
  | "acessorios"

type ProductAvailability =
  | "in_stock"
  | "low_stock"
  | "out_of_stock"

interface AdminProductVariant {
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

interface AdminProductImage {
  id: string
  productId: string
  imageUrl: string
  storagePath: string
  altText: string | null
  displayOrder: number
  createdAt: string
}

interface AdminProduct {
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
  variants: AdminProductVariant[]
  images: AdminProductImage[]
  totalStock: number
  availability: ProductAvailability
  primaryImage: AdminProductImage | null
}

interface VariantFormValue {
  name: string
  stockQuantity: string
  priceOverride: string
  active: boolean
  displayOrder: number
}

interface ProductFormValue {
  name: string
  slug: string
  reference: string
  description: string
  category: ProductCategory
  price: string
  active: boolean
  featured: boolean
  displayOrder: string
  hasVariants: boolean
  variantLabel: string
  singleStock: string
  variants: VariantFormValue[]
}

const CATEGORY_LABELS: Record<
  ProductCategory,
  string
> = {
  vestuario: "Vestuário",
  equipamento: "Equipamento",
  acessorios: "Acessórios",
}

const CATEGORY_OPTIONS: Array<{
  value: ProductCategory
  label: string
}> = [
  {
    value: "vestuario",
    label: "Vestuário",
  },
  {
    value: "equipamento",
    label: "Equipamento",
  },
  {
    value: "acessorios",
    label: "Acessórios",
  },
]

const EMPTY_VARIANT: VariantFormValue = {
  name: "",
  stockQuantity: "0",
  priceOverride: "",
  active: true,
  displayOrder: 0,
}

const EMPTY_FORM: ProductFormValue = {
  name: "",
  slug: "",
  reference: "",
  description: "",
  category: "vestuario",
  price: "",
  active: true,
  featured: false,
  displayOrder: "0",
  hasVariants: false,
  variantLabel: "",
  singleStock: "0",
  variants: [{ ...EMPTY_VARIANT }],
}

function normalizeSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function normalizeReference(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "-")
}

function formatPrice(
  value: number,
  currency = "AOA"
) {
  try {
    return new Intl.NumberFormat(
      "pt-AO",
      {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }
    ).format(value)
  } catch {
    return `${Math.round(value).toLocaleString(
      "pt-PT"
    )} Kz`
  }
}

function getActiveStock(
  product: AdminProduct
) {
  return product.variants
    .filter((variant) => variant.active)
    .reduce(
      (total, variant) =>
        total +
        Math.max(
          0,
          Number(
            variant.stockQuantity
          ) || 0
        ),
      0
    )
}

function getAvailabilityFromStock(
  stock: number
): ProductAvailability {
  if (stock <= 0) {
    return "out_of_stock"
  }

  if (stock <= 5) {
    return "low_stock"
  }

  return "in_stock"
}

function getAvailabilityMeta(
  availability: ProductAvailability
) {
  if (
    availability === "out_of_stock"
  ) {
    return {
      label: "Sem stock",
      className:
        "border-red-500/40 bg-red-500/10 text-red-300",
      icon: XCircle,
    }
  }

  if (
    availability === "low_stock"
  ) {
    return {
      label: "Stock baixo",
      className:
        "border-amber-500/40 bg-amber-500/10 text-amber-300",
      icon: AlertTriangle,
    }
  }

  return {
    label: "Em stock",
    className:
      "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    icon: CheckCircle2,
  }
}

function safeInteger(
  value: string,
  fallback = 0
) {
  const parsed = Number(value)

  if (
    !Number.isFinite(parsed) ||
    parsed < 0
  ) {
    return fallback
  }

  return Math.trunc(parsed)
}

function safePrice(
  value: string
) {
  const parsed = Number(value)

  if (
    !Number.isFinite(parsed) ||
    parsed < 0
  ) {
    return null
  }

  return parsed
}

export default function ProductsTab() {
  const [products, setProducts] =
    useState<AdminProduct[]>([])
  const [isLoading, setIsLoading] =
    useState(true)
  const [
    isRefreshing,
    setIsRefreshing,
  ] = useState(false)
  const [search, setSearch] =
    useState("")
  const [
    categoryFilter,
    setCategoryFilter,
  ] = useState<
    ProductCategory | "all"
  >("all")
  const [
    availabilityFilter,
    setAvailabilityFilter,
  ] = useState<
    ProductAvailability | "all"
  >("all")
  const [
    statusFilter,
    setStatusFilter,
  ] = useState<
    "all" | "active" | "inactive"
  >("all")

  const [
    dialogOpen,
    setDialogOpen,
  ] = useState(false)
  const [
    editingProduct,
    setEditingProduct,
  ] = useState<AdminProduct | null>(
    null
  )
  const [form, setForm] =
    useState<ProductFormValue>({
      ...EMPTY_FORM,
      variants: [
        { ...EMPTY_VARIANT },
      ],
    })
  const [
    slugWasEdited,
    setSlugWasEdited,
  ] = useState(false)
  const [
    selectedImages,
    setSelectedImages,
  ] = useState<File[]>([])
  const [
    removeImageIds,
    setRemoveImageIds,
  ] = useState<string[]>([])
  const [isSaving, setIsSaving] =
    useState(false)
  const [
    deletingProductId,
    setDeletingProductId,
  ] = useState<string | null>(null)

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    )

  const loadProducts = async (
    showRefresh = false
  ) => {
    if (showRefresh) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }

    try {
      const response = await fetch(
        "/api/admin/products",
        {
          cache: "no-store",
          credentials:
            "same-origin",
          headers: {
            "Cache-Control":
              "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        }
      )

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Não foi possível carregar os produtos"
        )
      }

      setProducts(
        Array.isArray(data?.products)
          ? data.products
          : []
      )
    } catch (error) {
      console.error(
        "[PRODUCTS-TAB] Erro ao carregar produtos:",
        error
      )

      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os produtos"
      )
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    void loadProducts()
  }, [])

  const resetForm = () => {
    setEditingProduct(null)
    setForm({
      ...EMPTY_FORM,
      variants: [
        { ...EMPTY_VARIANT },
      ],
    })
    setSlugWasEdited(false)
    setSelectedImages([])
    setRemoveImageIds([])

    if (fileInputRef.current) {
      fileInputRef.current.value =
        ""
    }
  }

  const openCreateDialog = () => {
    resetForm()
    setDialogOpen(true)
  }

  const openEditDialog = (
    product: AdminProduct
  ) => {
    const hasVariants =
      Boolean(product.variantLabel)

    const firstVariant =
      product.variants[0]

    setEditingProduct(product)
    setForm({
      name: product.name,
      slug: product.slug,
      reference:
        product.reference,
      description:
        product.description || "",
      category:
        product.category,
      price:
        String(product.price),
      active:
        product.active,
      featured:
        product.featured,
      displayOrder:
        String(
          product.displayOrder
        ),
      hasVariants,
      variantLabel:
        product.variantLabel || "",
      singleStock: String(
        firstVariant?.stockQuantity ??
          0
      ),
      variants: hasVariants
        ? product.variants.map(
            (variant) => ({
              name: variant.name,
              stockQuantity:
                String(
                  variant.stockQuantity
                ),
              priceOverride:
                variant.priceOverride ===
                null
                  ? ""
                  : String(
                      variant.priceOverride
                    ),
              active:
                variant.active,
              displayOrder:
                variant.displayOrder,
            })
          )
        : [{ ...EMPTY_VARIANT }],
    })
    setSlugWasEdited(true)
    setSelectedImages([])
    setRemoveImageIds([])

    if (fileInputRef.current) {
      fileInputRef.current.value =
        ""
    }

    setDialogOpen(true)
  }

  const closeDialog = () => {
    if (isSaving) {
      return
    }

    setDialogOpen(false)
    resetForm()
  }

  const updateForm = <
    K extends keyof ProductFormValue,
  >(
    key: K,
    value: ProductFormValue[K]
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const handleNameChange = (
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      name: value,
      slug:
        slugWasEdited
          ? current.slug
          : normalizeSlug(value),
    }))
  }

  const handleSlugChange = (
    value: string
  ) => {
    setSlugWasEdited(true)
    updateForm(
      "slug",
      normalizeSlug(value)
    )
  }

  const handleReferenceChange = (
    value: string
  ) => {
    updateForm(
      "reference",
      normalizeReference(value)
    )
  }

  const handleHasVariantsChange = (
    checked: boolean
  ) => {
    setForm((current) => ({
      ...current,
      hasVariants: checked,
      variantLabel:
        checked &&
        !current.variantLabel
          ? "Tamanho"
          : current.variantLabel,
      variants:
        checked &&
        current.variants.length ===
          0
          ? [{ ...EMPTY_VARIANT }]
          : current.variants,
    }))
  }

  const updateVariant = (
    index: number,
    field: keyof VariantFormValue,
    value:
      | string
      | boolean
      | number
  ) => {
    setForm((current) => ({
      ...current,
      variants:
        current.variants.map(
          (variant, variantIndex) =>
            variantIndex === index
              ? {
                  ...variant,
                  [field]: value,
                }
              : variant
        ),
    }))
  }

  const addVariant = () => {
    setForm((current) => ({
      ...current,
      variants: [
        ...current.variants,
        {
          ...EMPTY_VARIANT,
          displayOrder:
            current.variants.length,
        },
      ],
    }))
  }

  const removeVariant = (
    index: number
  ) => {
    setForm((current) => {
      if (
        current.variants.length <=
        1
      ) {
        return current
      }

      return {
        ...current,
        variants:
          current.variants
            .filter(
              (
                _variant,
                variantIndex
              ) =>
                variantIndex !==
                index
            )
            .map(
              (
                variant,
                variantIndex
              ) => ({
                ...variant,
                displayOrder:
                  variantIndex,
              })
            ),
      }
    })
  }

  const handleImageSelection = (
    files: FileList | null
  ) => {
    if (!files) {
      return
    }

    const incoming =
      Array.from(files)

    const allowedTypes =
      new Set([
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
      ])

    const validFiles =
      incoming.filter((file) => {
        if (
          !allowedTypes.has(
            file.type
          )
        ) {
          toast.error(
            `${file.name}: formato não permitido`
          )
          return false
        }

        if (
          file.size >
          10 * 1024 * 1024
        ) {
          toast.error(
            `${file.name}: máximo de 10MB`
          )
          return false
        }

        return true
      })

    setSelectedImages(
      (current) => {
        const next = [
          ...current,
          ...validFiles,
        ]

        if (next.length > 8) {
          toast.error(
            "É permitido enviar no máximo 8 imagens de cada vez."
          )
        }

        return next.slice(0, 8)
      }
    )

    if (fileInputRef.current) {
      fileInputRef.current.value =
        ""
    }
  }

  const removeSelectedImage = (
    index: number
  ) => {
    setSelectedImages(
      (current) =>
        current.filter(
          (_file, fileIndex) =>
            fileIndex !== index
        )
    )
  }

  const toggleExistingImageRemoval =
    (imageId: string) => {
      setRemoveImageIds(
        (current) =>
          current.includes(imageId)
            ? current.filter(
                (id) =>
                  id !== imageId
              )
            : [
                ...current,
                imageId,
              ]
      )
    }

  const validateForm = () => {
    if (form.name.trim().length < 2) {
      return "Indique o nome do produto."
    }

    if (!form.slug.trim()) {
      return "Indique o slug do produto."
    }

    if (
      form.reference.trim().length <
      2
    ) {
      return "Indique a referência do produto."
    }

    const price =
      safePrice(form.price)

    if (price === null) {
      return "Indique um preço válido."
    }

    if (
      form.hasVariants &&
      !form.variantLabel.trim()
    ) {
      return "Indique o nome do tipo de variante, por exemplo Tamanho ou Cor."
    }

    if (
      form.hasVariants
    ) {
      if (
        form.variants.length === 0
      ) {
        return "Adicione pelo menos uma variante."
      }

      const names = new Set<string>()

      for (
        const variant of
        form.variants
      ) {
        const name =
          variant.name.trim()

        if (!name) {
          return "Todas as variantes precisam de um nome."
        }

        const normalizedName =
          name.toLocaleLowerCase(
            "pt"
          )

        if (
          names.has(
            normalizedName
          )
        ) {
          return `A variante "${name}" está repetida.`
        }

        names.add(normalizedName)

        const stock =
          Number(
            variant.stockQuantity
          )

        if (
          !Number.isInteger(
            stock
          ) ||
          stock < 0
        ) {
          return `O stock da variante "${name}" é inválido.`
        }

        if (
          variant.priceOverride !==
            "" &&
          safePrice(
            variant.priceOverride
          ) === null
        ) {
          return `O preço específico da variante "${name}" é inválido.`
        }
      }
    } else {
      const stock =
        Number(form.singleStock)

      if (
        !Number.isInteger(stock) ||
        stock < 0
      ) {
        return "Indique um stock válido."
      }
    }

    return null
  }

  const buildPayload = () => {
    const variants =
      form.hasVariants
        ? form.variants.map(
            (variant, index) => ({
              name:
                variant.name.trim(),
              stockQuantity:
                safeInteger(
                  variant.stockQuantity
                ),
              priceOverride:
                variant.priceOverride ===
                ""
                  ? null
                  : safePrice(
                      variant.priceOverride
                    ),
              active:
                variant.active,
              displayOrder:
                index,
            })
          )
        : [
            {
              name: "Único",
              stockQuantity:
                safeInteger(
                  form.singleStock
                ),
              priceOverride: null,
              active: true,
              displayOrder: 0,
            },
          ]

    return {
      name: form.name.trim(),
      slug: normalizeSlug(
        form.slug
      ),
      reference:
        normalizeReference(
          form.reference
        ),
      description:
        form.description.trim(),
      category:
        form.category,
      price:
        safePrice(form.price) ??
        0,
      currency: "AOA",
      variantLabel:
        form.hasVariants
          ? form.variantLabel.trim()
          : null,
      active: form.active,
      featured: form.featured,
      displayOrder:
        safeInteger(
          form.displayOrder
        ),
      variants,
    }
  }

  const handleSubmit = async () => {
    const validationError =
      validateForm()

    if (validationError) {
      toast.error(validationError)
      return
    }

    setIsSaving(true)

    try {
      const formData =
        new FormData()

      formData.append(
        "payload",
        JSON.stringify(
          buildPayload()
        )
      )

      for (const file of selectedImages) {
        formData.append(
          "images",
          file
        )
      }

      const isEditing =
        Boolean(editingProduct)

      if (
        isEditing &&
        removeImageIds.length
      ) {
        formData.append(
          "removeImageIds",
          JSON.stringify(
            removeImageIds
          )
        )
      }

      const endpoint =
        editingProduct
          ? `/api/admin/products/${editingProduct.id}`
          : "/api/admin/products"

      const response =
        await fetch(endpoint, {
          method:
            editingProduct
              ? "PUT"
              : "POST",
          body: formData,
          credentials:
            "same-origin",
          cache: "no-store",
        })

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Não foi possível guardar o produto"
        )
      }

      if (data?.warning) {
        toast.warning(
          data.warning
        )
      }

      toast.success(
        editingProduct
          ? "Produto actualizado com sucesso."
          : "Produto criado com sucesso."
      )

      setDialogOpen(false)
      resetForm()
      await loadProducts(true)
    } catch (error) {
      console.error(
        "[PRODUCTS-TAB] Erro ao guardar produto:",
        error
      )

      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível guardar o produto"
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteProduct =
    async (product: AdminProduct) => {
      const confirmed =
        window.confirm(
          `Eliminar "${product.name}"?\n\nEsta acção remove o produto, variantes e imagens associadas.`
        )

      if (!confirmed) {
        return
      }

      setDeletingProductId(
        product.id
      )

      try {
        const response =
          await fetch(
            `/api/admin/products/${product.id}`,
            {
              method: "DELETE",
              credentials:
                "same-origin",
              cache: "no-store",
            }
          )

        const data =
          await response.json()

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Não foi possível eliminar o produto"
          )
        }

        if (data?.warning) {
          toast.warning(
            data.warning
          )
        }

        setProducts(
          (current) =>
            current.filter(
              (item) =>
                item.id !==
                product.id
            )
        )

        toast.success(
          "Produto eliminado com sucesso."
        )
      } catch (error) {
        console.error(
          "[PRODUCTS-TAB] Erro ao eliminar produto:",
          error
        )

        toast.error(
          error instanceof Error
            ? error.message
            : "Não foi possível eliminar o produto"
        )
      } finally {
        setDeletingProductId(
          null
        )
      }
    }

  const productsWithComputedState =
    useMemo(
      () =>
        products.map((product) => {
          const activeStock =
            getActiveStock(product)

          return {
            product,
            activeStock,
            availability:
              getAvailabilityFromStock(
                activeStock
              ),
          }
        }),
      [products]
    )

  const filteredProducts =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLocaleLowerCase(
            "pt"
          )

      return productsWithComputedState.filter(
        ({
          product,
          availability,
        }) => {
          const matchesSearch =
            !normalizedSearch ||
            product.name
              .toLocaleLowerCase(
                "pt"
              )
              .includes(
                normalizedSearch
              ) ||
            product.reference
              .toLocaleLowerCase(
                "pt"
              )
              .includes(
                normalizedSearch
              ) ||
            product.slug
              .toLocaleLowerCase(
                "pt"
              )
              .includes(
                normalizedSearch
              )

          const matchesCategory =
            categoryFilter ===
              "all" ||
            product.category ===
              categoryFilter

          const matchesAvailability =
            availabilityFilter ===
              "all" ||
            availability ===
              availabilityFilter

          const matchesStatus =
            statusFilter ===
              "all" ||
            (statusFilter ===
              "active" &&
              product.active) ||
            (statusFilter ===
              "inactive" &&
              !product.active)

          return (
            matchesSearch &&
            matchesCategory &&
            matchesAvailability &&
            matchesStatus
          )
        }
      )
    }, [
      productsWithComputedState,
      search,
      categoryFilter,
      availabilityFilter,
      statusFilter,
    ])

  const stats = useMemo(() => {
    return {
      total:
        productsWithComputedState.length,
      active:
        productsWithComputedState.filter(
          ({ product }) =>
            product.active
        ).length,
      lowStock:
        productsWithComputedState.filter(
          ({ availability }) =>
            availability ===
            "low_stock"
        ).length,
      outOfStock:
        productsWithComputedState.filter(
          ({ availability }) =>
            availability ===
            "out_of_stock"
        ).length,
    }
  }, [productsWithComputedState])

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#D4AF37]">
            Loja THE BOX
          </p>
          <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
            Gestão de Produtos
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-[#8E8E8E]">
            Gerencie catálogo, stock,
            variantes, imagens e
            visibilidade dos produtos
            apresentados na Loja.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              void loadProducts(true)
            }
            disabled={isRefreshing}
            className="min-h-11 border-[#262626] bg-transparent text-white hover:border-[#D4AF37] hover:bg-[#121212] hover:text-[#D4AF37]"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                isRefreshing
                  ? "animate-spin"
                  : ""
              }`}
            />
            Actualizar
          </Button>

          <Button
            type="button"
            onClick={openCreateDialog}
            className="min-h-11 bg-[#D4AF37] font-semibold text-black hover:bg-[#B8941F]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="border-[#1A1A1A] bg-[#0A0A0A]">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-[#8E8E8E]">
                  Total de Produtos
                </p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {stats.total}
                </p>
              </div>
              <div className="rounded-lg border border-[#252525] bg-[#141414] p-2 text-[#D4AF37]">
                <Package className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#1A1A1A] bg-[#0A0A0A]">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-[#8E8E8E]">
                  Produtos Activos
                </p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {stats.active}
                </p>
              </div>
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#1A1A1A] bg-[#0A0A0A]">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-[#8E8E8E]">
                  Stock Baixo
                </p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {stats.lowStock}
                </p>
              </div>
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-2 text-amber-300">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#1A1A1A] bg-[#0A0A0A]">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-[#8E8E8E]">
                  Sem Stock
                </p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {stats.outOfStock}
                </p>
              </div>
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-300">
                <XCircle className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#1A1A1A] bg-[#0A0A0A]">
        <CardContent className="p-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_190px_190px_160px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666]" />
              <Input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Pesquisar nome, referência ou slug..."
                className="min-h-11 border-[#252525] bg-[#141414] pl-9 text-white placeholder:text-[#666] focus-visible:ring-[#D4AF37]"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(
                  event.target.value as
                    | ProductCategory
                    | "all"
                )
              }
              className="min-h-11 rounded-md border border-[#252525] bg-[#141414] px-3 text-sm text-white outline-none focus:border-[#D4AF37]"
            >
              <option value="all">
                Todas as categorias
              </option>
              {CATEGORY_OPTIONS.map(
                (option) => (
                  <option
                    key={
                      option.value
                    }
                    value={
                      option.value
                    }
                  >
                    {option.label}
                  </option>
                )
              )}
            </select>

            <select
              value={
                availabilityFilter
              }
              onChange={(event) =>
                setAvailabilityFilter(
                  event.target.value as
                    | ProductAvailability
                    | "all"
                )
              }
              className="min-h-11 rounded-md border border-[#252525] bg-[#141414] px-3 text-sm text-white outline-none focus:border-[#D4AF37]"
            >
              <option value="all">
                Todo o stock
              </option>
              <option value="in_stock">
                Em stock
              </option>
              <option value="low_stock">
                Stock baixo
              </option>
              <option value="out_of_stock">
                Sem stock
              </option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                    | "all"
                    | "active"
                    | "inactive"
                )
              }
              className="min-h-11 rounded-md border border-[#252525] bg-[#141414] px-3 text-sm text-white outline-none focus:border-[#D4AF37]"
            >
              <option value="all">
                Todos
              </option>
              <option value="active">
                Activos
              </option>
              <option value="inactive">
                Inactivos
              </option>
            </select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card className="border-[#1A1A1A] bg-[#0A0A0A]">
          <CardContent className="flex min-h-[280px] items-center justify-center">
            <div className="text-center">
              <RefreshCw className="mx-auto h-7 w-7 animate-spin text-[#D4AF37]" />
              <p className="mt-3 text-sm text-[#8E8E8E]">
                A carregar produtos...
              </p>
            </div>
          </CardContent>
        </Card>
      ) : filteredProducts.length ===
        0 ? (
        <Card className="border-[#1A1A1A] bg-[#0A0A0A]">
          <CardContent className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <div className="rounded-full border border-[#252525] bg-[#141414] p-4 text-[#777]">
              <Package className="h-7 w-7" />
            </div>

            <h3 className="mt-4 text-base font-semibold text-white">
              {products.length === 0
                ? "Nenhum produto cadastrado"
                : "Nenhum produto encontrado"}
            </h3>

            <p className="mt-2 max-w-md text-sm text-[#8E8E8E]">
              {products.length === 0
                ? "Crie o primeiro produto para começar a construir o catálogo da Loja THE BOX."
                : "Ajuste os filtros ou a pesquisa para encontrar outros produtos."}
            </p>

            {products.length === 0 && (
              <Button
                type="button"
                onClick={
                  openCreateDialog
                }
                className="mt-5 bg-[#D4AF37] font-semibold text-black hover:bg-[#B8941F]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Produto
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredProducts.map(
            ({
              product,
              activeStock,
              availability,
            }) => {
              const availabilityMeta =
                getAvailabilityMeta(
                  availability
                )
              const AvailabilityIcon =
                availabilityMeta.icon

              return (
                <Card
                  key={product.id}
                  className="overflow-hidden border-[#1A1A1A] bg-[#0A0A0A] transition-colors hover:border-[#2A2A2A]"
                >
                  <CardContent className="p-0">
                    <div className="flex min-h-[180px] flex-col sm:flex-row">
                      <div className="relative min-h-[190px] w-full shrink-0 overflow-hidden border-b border-[#1A1A1A] bg-[#121212] sm:min-h-0 sm:w-44 sm:border-b-0 sm:border-r">
                        {product
                          .primaryImage
                          ?.imageUrl ? (
                          <img
                            src={
                              product
                                .primaryImage
                                .imageUrl
                            }
                            alt={
                              product
                                .primaryImage
                                .altText ||
                              product.name
                            }
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full min-h-[190px] items-center justify-center">
                            <ImageIcon className="h-9 w-9 text-[#444]" />
                          </div>
                        )}

                        {product.featured && (
                          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full border border-[#D4AF37]/50 bg-black/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#D4AF37] backdrop-blur">
                            <Star className="h-3 w-3 fill-current" />
                            Destaque
                          </div>
                        )}
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="truncate text-base font-semibold text-white">
                                {
                                  product.name
                                }
                              </h3>

                              <span
                                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                                  product.active
                                    ? "border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37]"
                                    : "border-[#333] bg-[#171717] text-[#777]"
                                }`}
                              >
                                {product.active
                                  ? "Activo"
                                  : "Inactivo"}
                              </span>
                            </div>

                            <p className="mt-1 text-xs text-[#777]">
                              {
                                product.reference
                              }
                              {" · "}
                              {
                                CATEGORY_LABELS[
                                  product
                                    .category
                                ]
                              }
                            </p>
                          </div>

                          <p className="shrink-0 text-sm font-bold text-[#D4AF37]">
                            {formatPrice(
                              product.price,
                              product.currency
                            )}
                          </p>
                        </div>

                        {product.description && (
                          <p className="mt-3 line-clamp-2 text-xs leading-5 text-[#8E8E8E]">
                            {
                              product.description
                            }
                          </p>
                        )}

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${availabilityMeta.className}`}
                          >
                            <AvailabilityIcon className="h-3.5 w-3.5" />
                            {
                              availabilityMeta.label
                            }
                          </span>

                          <span className="rounded-full border border-[#262626] bg-[#141414] px-2.5 py-1 text-xs text-[#A0A0A0]">
                            Stock:{" "}
                            <strong className="text-white">
                              {
                                activeStock
                              }
                            </strong>
                          </span>

                          {product.variantLabel && (
                            <span className="rounded-full border border-[#262626] bg-[#141414] px-2.5 py-1 text-xs text-[#A0A0A0]">
                              {
                                product.variantLabel
                              }
                              :{" "}
                              {
                                product
                                  .variants
                                  .length
                              }
                            </span>
                          )}

                          {product.images.length >
                            0 && (
                            <span className="rounded-full border border-[#262626] bg-[#141414] px-2.5 py-1 text-xs text-[#A0A0A0]">
                              {
                                product
                                  .images
                                  .length
                              }{" "}
                              {product.images
                                .length ===
                              1
                                ? "imagem"
                                : "imagens"}
                            </span>
                          )}
                        </div>

                        <div className="mt-auto flex items-center justify-end gap-2 border-t border-[#1A1A1A] pt-4">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              openEditDialog(
                                product
                              )
                            }
                            className="min-h-10 border-[#252525] bg-transparent text-white hover:border-[#D4AF37] hover:bg-[#151515] hover:text-[#D4AF37]"
                          >
                            <Edit3 className="mr-2 h-4 w-4" />
                            Editar
                          </Button>

                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={
                              deletingProductId ===
                              product.id
                            }
                            onClick={() =>
                              void handleDeleteProduct(
                                product
                              )
                            }
                            className="min-h-10 border-[#252525] bg-transparent text-[#B3B3B3] hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-300"
                          >
                            {deletingProductId ===
                            product.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            }
          )}
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (open) {
            setDialogOpen(true)
          } else {
            closeDialog()
          }
        }}
      >
        <DialogContent className="max-h-[92vh] w-[calc(100vw-24px)] max-w-5xl overflow-y-auto border-[#262626] bg-[#0A0A0A] p-0 text-white">
          <DialogHeader className="border-b border-[#1A1A1A] px-5 py-5 sm:px-6">
            <DialogTitle className="text-xl text-white">
              {editingProduct
                ? "Editar Produto"
                : "Novo Produto"}
            </DialogTitle>
            <DialogDescription className="text-[#8E8E8E]">
              {editingProduct
                ? "Actualize os dados, stock, variantes e imagens deste produto."
                : "Adicione um novo produto ao catálogo da Loja THE BOX."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-7 px-5 py-5 sm:px-6">
            <section className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-white">
                  Informação principal
                </p>
                <p className="mt-1 text-xs text-[#777]">
                  Identificação, descrição
                  e organização do produto.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="product-name"
                    className="text-[#BDBDBD]"
                  >
                    Nome *
                  </Label>
                  <Input
                    id="product-name"
                    value={form.name}
                    onChange={(event) =>
                      handleNameChange(
                        event.target.value
                      )
                    }
                    placeholder="Ex.: T-Shirt THE BOX Classic"
                    className="min-h-11 border-[#252525] bg-[#141414] text-white placeholder:text-[#555] focus-visible:ring-[#D4AF37]"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="product-reference"
                    className="text-[#BDBDBD]"
                  >
                    Referência *
                  </Label>
                  <Input
                    id="product-reference"
                    value={
                      form.reference
                    }
                    onChange={(event) =>
                      handleReferenceChange(
                        event.target.value
                      )
                    }
                    placeholder="TBX-TS-001"
                    className="min-h-11 border-[#252525] bg-[#141414] font-mono text-white placeholder:text-[#555] focus-visible:ring-[#D4AF37]"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="product-slug"
                    className="text-[#BDBDBD]"
                  >
                    Slug *
                  </Label>
                  <Input
                    id="product-slug"
                    value={form.slug}
                    onChange={(event) =>
                      handleSlugChange(
                        event.target.value
                      )
                    }
                    placeholder="t-shirt-the-box-classic"
                    className="min-h-11 border-[#252525] bg-[#141414] font-mono text-white placeholder:text-[#555] focus-visible:ring-[#D4AF37]"
                  />
                  <p className="text-[11px] text-[#666]">
                    Usado no endereço
                    público do produto.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="product-category"
                    className="text-[#BDBDBD]"
                  >
                    Categoria *
                  </Label>
                  <select
                    id="product-category"
                    value={form.category}
                    onChange={(event) =>
                      updateForm(
                        "category",
                        event.target
                          .value as ProductCategory
                      )
                    }
                    className="min-h-11 w-full rounded-md border border-[#252525] bg-[#141414] px-3 text-sm text-white outline-none focus:border-[#D4AF37]"
                  >
                    {CATEGORY_OPTIONS.map(
                      (option) => (
                        <option
                          key={
                            option.value
                          }
                          value={
                            option.value
                          }
                        >
                          {
                            option.label
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label
                    htmlFor="product-description"
                    className="text-[#BDBDBD]"
                  >
                    Descrição
                  </Label>
                  <Textarea
                    id="product-description"
                    value={
                      form.description
                    }
                    onChange={(event) =>
                      updateForm(
                        "description",
                        event.target.value
                      )
                    }
                    rows={4}
                    placeholder="Descrição curta e objectiva do produto..."
                    className="resize-y border-[#252525] bg-[#141414] text-white placeholder:text-[#555] focus-visible:ring-[#D4AF37]"
                  />
                </div>
              </div>
            </section>

            <div className="h-px bg-[#1A1A1A]" />

            <section className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-white">
                  Preço e publicação
                </p>
                <p className="mt-1 text-xs text-[#777]">
                  Configure o preço base
                  e a disponibilidade no
                  catálogo.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label
                    htmlFor="product-price"
                    className="text-[#BDBDBD]"
                  >
                    Preço (Kz) *
                  </Label>
                  <Input
                    id="product-price"
                    type="number"
                    min="0"
                    step="1"
                    value={form.price}
                    onChange={(event) =>
                      updateForm(
                        "price",
                        event.target.value
                      )
                    }
                    placeholder="15000"
                    className="min-h-11 border-[#252525] bg-[#141414] text-white placeholder:text-[#555] focus-visible:ring-[#D4AF37]"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="product-order"
                    className="text-[#BDBDBD]"
                  >
                    Ordem de exibição
                  </Label>
                  <Input
                    id="product-order"
                    type="number"
                    min="0"
                    step="1"
                    value={
                      form.displayOrder
                    }
                    onChange={(event) =>
                      updateForm(
                        "displayOrder",
                        event.target.value
                      )
                    }
                    className="min-h-11 border-[#252525] bg-[#141414] text-white focus-visible:ring-[#D4AF37]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex min-h-11 items-center justify-between rounded-md border border-[#252525] bg-[#141414] px-3">
                    <Label
                      htmlFor="product-active"
                      className="cursor-pointer text-xs text-[#BDBDBD]"
                    >
                      Activo
                    </Label>
                    <Switch
                      id="product-active"
                      checked={form.active}
                      onCheckedChange={(
                        checked
                      ) =>
                        updateForm(
                          "active",
                          checked
                        )
                      }
                    />
                  </div>

                  <div className="flex min-h-11 items-center justify-between rounded-md border border-[#252525] bg-[#141414] px-3">
                    <Label
                      htmlFor="product-featured"
                      className="cursor-pointer text-xs text-[#BDBDBD]"
                    >
                      Destaque
                    </Label>
                    <Switch
                      id="product-featured"
                      checked={
                        form.featured
                      }
                      onCheckedChange={(
                        checked
                      ) =>
                        updateForm(
                          "featured",
                          checked
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            </section>

            <div className="h-px bg-[#1A1A1A]" />

            <section className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Stock e variantes
                  </p>
                  <p className="mt-1 text-xs text-[#777]">
                    O stock é actualizado
                    manualmente no painel.
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 rounded-md border border-[#252525] bg-[#141414] px-3 py-2.5">
                  <Label
                    htmlFor="has-variants"
                    className="cursor-pointer text-sm text-[#BDBDBD]"
                  >
                    Produto com variantes
                  </Label>
                  <Switch
                    id="has-variants"
                    checked={
                      form.hasVariants
                    }
                    onCheckedChange={
                      handleHasVariantsChange
                    }
                  />
                </div>
              </div>

              {!form.hasVariants ? (
                <div className="max-w-sm space-y-2">
                  <Label
                    htmlFor="single-stock"
                    className="text-[#BDBDBD]"
                  >
                    Stock disponível *
                  </Label>
                  <Input
                    id="single-stock"
                    type="number"
                    min="0"
                    step="1"
                    value={
                      form.singleStock
                    }
                    onChange={(event) =>
                      updateForm(
                        "singleStock",
                        event.target.value
                      )
                    }
                    className="min-h-11 border-[#252525] bg-[#141414] text-white focus-visible:ring-[#D4AF37]"
                  />
                  <p className="text-[11px] text-[#666]">
                    Internamente será
                    criada uma variante
                    técnica “Único”, que
                    não aparece ao
                    visitante.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="max-w-sm space-y-2">
                    <Label
                      htmlFor="variant-label"
                      className="text-[#BDBDBD]"
                    >
                      Tipo de variante *
                    </Label>
                    <Input
                      id="variant-label"
                      value={
                        form.variantLabel
                      }
                      onChange={(event) =>
                        updateForm(
                          "variantLabel",
                          event.target.value
                        )
                      }
                      placeholder="Ex.: Tamanho, Cor"
                      className="min-h-11 border-[#252525] bg-[#141414] text-white placeholder:text-[#555] focus-visible:ring-[#D4AF37]"
                    />
                  </div>

                  <div className="space-y-3">
                    {form.variants.map(
                      (
                        variant,
                        index
                      ) => (
                        <div
                          key={index}
                          className="rounded-lg border border-[#222] bg-[#111] p-4"
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
                              Variante{" "}
                              {index + 1}
                            </p>

                            {form
                              .variants
                              .length >
                              1 && (
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  removeVariant(
                                    index
                                  )
                                }
                                className="h-8 w-8 p-0 text-[#777] hover:bg-red-500/10 hover:text-red-300"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr_0.8fr_auto]">
                            <div className="space-y-2">
                              <Label className="text-xs text-[#999]">
                                Nome *
                              </Label>
                              <Input
                                value={
                                  variant.name
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateVariant(
                                    index,
                                    "name",
                                    event
                                      .target
                                      .value
                                  )
                                }
                                placeholder="Ex.: M"
                                className="min-h-10 border-[#252525] bg-[#171717] text-white placeholder:text-[#555] focus-visible:ring-[#D4AF37]"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs text-[#999]">
                                Stock *
                              </Label>
                              <Input
                                type="number"
                                min="0"
                                step="1"
                                value={
                                  variant.stockQuantity
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateVariant(
                                    index,
                                    "stockQuantity",
                                    event
                                      .target
                                      .value
                                  )
                                }
                                className="min-h-10 border-[#252525] bg-[#171717] text-white focus-visible:ring-[#D4AF37]"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs text-[#999]">
                                Preço próprio
                              </Label>
                              <Input
                                type="number"
                                min="0"
                                step="1"
                                value={
                                  variant.priceOverride
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateVariant(
                                    index,
                                    "priceOverride",
                                    event
                                      .target
                                      .value
                                  )
                                }
                                placeholder="Opcional"
                                className="min-h-10 border-[#252525] bg-[#171717] text-white placeholder:text-[#555] focus-visible:ring-[#D4AF37]"
                              />
                            </div>

                            <div className="flex items-end">
                              <div className="flex min-h-10 items-center gap-2 rounded-md border border-[#252525] bg-[#171717] px-3">
                                <Switch
                                  checked={
                                    variant.active
                                  }
                                  onCheckedChange={(
                                    checked
                                  ) =>
                                    updateVariant(
                                      index,
                                      "active",
                                      checked
                                    )
                                  }
                                />
                                <span className="text-xs text-[#999]">
                                  Activa
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={addVariant}
                      className="min-h-10 border-dashed border-[#333] bg-transparent text-[#B3B3B3] hover:border-[#D4AF37] hover:bg-[#141414] hover:text-[#D4AF37]"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Variante
                    </Button>
                  </div>
                </div>
              )}
            </section>

            <div className="h-px bg-[#1A1A1A]" />

            <section className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-white">
                  Imagens do produto
                </p>
                <p className="mt-1 text-xs text-[#777]">
                  JPG, PNG, WEBP ou GIF.
                  Máximo de 10MB por
                  imagem e 8 novos
                  ficheiros por envio.
                </p>
              </div>

              {editingProduct &&
                editingProduct.images
                  .length > 0 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {editingProduct.images.map(
                      (image) => {
                        const marked =
                          removeImageIds.includes(
                            image.id
                          )

                        return (
                          <div
                            key={
                              image.id
                            }
                            className={`relative overflow-hidden rounded-lg border ${
                              marked
                                ? "border-red-500/50 opacity-50"
                                : "border-[#252525]"
                            }`}
                          >
                            <div className="aspect-square bg-[#121212]">
                              <img
                                src={
                                  image.imageUrl
                                }
                                alt={
                                  image.altText ||
                                  editingProduct.name
                                }
                                className="h-full w-full object-cover"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                toggleExistingImageRemoval(
                                  image.id
                                )
                              }
                              className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur ${
                                marked
                                  ? "border-[#D4AF37]/60 bg-black/80 text-[#D4AF37]"
                                  : "border-white/10 bg-black/70 text-white hover:border-red-400/50 hover:text-red-300"
                              }`}
                              title={
                                marked
                                  ? "Manter imagem"
                                  : "Remover imagem ao guardar"
                              }
                            >
                              {marked ? (
                                <RefreshCw className="h-3.5 w-3.5" />
                              ) : (
                                <X className="h-4 w-4" />
                              )}
                            </button>

                            {marked && (
                              <div className="absolute inset-x-0 bottom-0 bg-red-500/80 px-2 py-1 text-center text-[10px] font-semibold text-white">
                                A remover
                              </div>
                            )}
                          </div>
                        )
                      }
                    )}
                  </div>
                )}

              <div className="rounded-lg border border-dashed border-[#333] bg-[#111] p-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  onChange={(event) =>
                    handleImageSelection(
                      event.target.files
                    )
                  }
                  className="hidden"
                  id="product-images"
                />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg border border-[#282828] bg-[#171717] p-2.5 text-[#D4AF37]">
                      <Upload className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        Adicionar imagens
                      </p>
                      <p className="text-xs text-[#777]">
                        A primeira imagem
                        será usada como
                        principal.
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="min-h-10 border-[#2A2A2A] bg-transparent text-white hover:border-[#D4AF37] hover:text-[#D4AF37]"
                  >
                    Seleccionar
                  </Button>
                </div>

                {selectedImages.length >
                  0 && (
                  <div className="mt-4 space-y-2">
                    {selectedImages.map(
                      (file, index) => (
                        <div
                          key={`${file.name}-${file.lastModified}-${index}`}
                          className="flex items-center justify-between gap-3 rounded-md border border-[#242424] bg-[#171717] px-3 py-2"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <ImageIcon className="h-4 w-4 shrink-0 text-[#D4AF37]" />
                            <div className="min-w-0">
                              <p className="truncate text-xs text-white">
                                {
                                  file.name
                                }
                              </p>
                              <p className="text-[10px] text-[#666]">
                                {(
                                  file.size /
                                  1024 /
                                  1024
                                ).toFixed(
                                  2
                                )}{" "}
                                MB
                              </p>
                            </div>
                          </div>

                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              removeSelectedImage(
                                index
                              )
                            }
                            className="h-8 w-8 shrink-0 p-0 text-[#777] hover:bg-red-500/10 hover:text-red-300"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>

          <DialogFooter className="border-t border-[#1A1A1A] bg-[#0D0D0D] px-5 py-4 sm:px-6">
            <Button
              type="button"
              variant="outline"
              onClick={closeDialog}
              disabled={isSaving}
              className="min-h-11 border-[#292929] bg-transparent text-white hover:bg-[#171717]"
            >
              Cancelar
            </Button>

            <Button
              type="button"
              onClick={() =>
                void handleSubmit()
              }
              disabled={isSaving}
              className="min-h-11 bg-[#D4AF37] font-semibold text-black hover:bg-[#B8941F]"
            >
              {isSaving && (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editingProduct
                ? "Guardar Alterações"
                : "Criar Produto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
