export const STORE_CATEGORIES = [
    "vestuario",
    "equipamento",
    "acessorios",
  ] as const
  
  export const STORE_CATEGORY_LABELS = {
    pt: {
      vestuario: "Vestuário",
      equipamento: "Equipamento",
      acessorios: "Acessórios",
    },
    en: {
      vestuario: "Apparel",
      equipamento: "Equipment",
      acessorios: "Accessories",
    },
  } as const
  
  export const DEFAULT_STORE_CURRENCY = "AOA"
  
  export const LOW_STOCK_THRESHOLD = 5
  
  export const TECHNICAL_SINGLE_VARIANT_NAME = "Único"
  
  export const PRODUCT_REFERENCE_PREFIX = "TBX"
  
  export const STORE_STORAGE_BUCKET = "images"
  
  export const STORE_STORAGE_FOLDER = "products"
  
  export const PRODUCT_SLUG_PATTERN =
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  
  export const PRODUCT_REFERENCE_PATTERN =
    /^[A-Za-z0-9][A-Za-z0-9._/-]*$/