import "server-only"

import { randomUUID } from "crypto"

import {
  getServiceClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server"

import {
  STORE_STORAGE_BUCKET,
  STORE_STORAGE_FOLDER,
} from "./constants"

const MAX_PRODUCT_IMAGE_SIZE =
  10 * 1024 * 1024

const MAX_IMAGES_PER_REQUEST = 8

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
])

export interface UploadedProductImage {
  imageUrl: string
  storagePath: string
  originalName: string
}

export interface StorageCleanupResult {
  removed: string[]
  failed: string[]
}

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

function sanitizeFileName(
  fileName: string
) {
  const safeName = fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")

  return safeName || "product-image.jpg"
}

export function validateProductImage(
  file: File
) {
  if (!file || file.size <= 0) {
    return "Imagem inválida"
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return "Formato de imagem não permitido"
  }

  if (
    file.size > MAX_PRODUCT_IMAGE_SIZE
  ) {
    return "Cada imagem deve ter no máximo 10MB"
  }

  return null
}

function validateProductImages(
  files: File[]
) {
  if (
    files.length >
    MAX_IMAGES_PER_REQUEST
  ) {
    throw new Error(
      `É permitido enviar no máximo ${MAX_IMAGES_PER_REQUEST} imagens de cada vez`
    )
  }

  for (const file of files) {
    const error =
      validateProductImage(file)

    if (error) {
      throw new Error(
        `${file.name || "Imagem"}: ${error}`
      )
    }
  }
}

export async function uploadProductImages(
  productId: string,
  files: File[]
): Promise<UploadedProductImage[]> {
  if (!files.length) {
    return []
  }

  validateProductImages(files)

  const supabase =
    getRequiredServiceClient()

  const uploaded: UploadedProductImage[] =
    []

  try {
    for (
      let index = 0;
      index < files.length;
      index += 1
    ) {
      const file = files[index]

      const safeName =
        sanitizeFileName(file.name)

      const uniquePart =
        randomUUID().slice(0, 8)

      const fileName =
        `${Date.now()}-${index}-${uniquePart}-${safeName}`

      const storagePath =
        `${STORE_STORAGE_FOLDER}/${productId}/${fileName}`

      const arrayBuffer =
        await file.arrayBuffer()

      const { error: uploadError } =
        await supabase.storage
          .from(STORE_STORAGE_BUCKET)
          .upload(
            storagePath,
            arrayBuffer,
            {
              contentType: file.type,
              cacheControl: "3600",
              upsert: false,
            }
          )

      if (uploadError) {
        throw new Error(
          `Falha no upload de ${file.name}: ${uploadError.message}`
        )
      }

      const { data: publicUrlData } =
        supabase.storage
          .from(STORE_STORAGE_BUCKET)
          .getPublicUrl(storagePath)

      uploaded.push({
        imageUrl:
          publicUrlData.publicUrl,
        storagePath,
        originalName: file.name,
      })
    }

    return uploaded
  } catch (error) {
    const uploadedPaths =
      uploaded.map(
        (item) => item.storagePath
      )

    if (uploadedPaths.length) {
      await removeProductStorageFiles(
        uploadedPaths
      )
    }

    throw error
  }
}

export async function removeProductStorageFiles(
  paths: string[]
): Promise<StorageCleanupResult> {
  const uniquePaths = [
    ...new Set(
      paths
        .map((path) => path.trim())
        .filter(Boolean)
        .filter((path) =>
          path.startsWith(
            `${STORE_STORAGE_FOLDER}/`
          )
        )
    ),
  ]

  if (!uniquePaths.length) {
    return {
      removed: [],
      failed: [],
    }
  }

  const supabase =
    getRequiredServiceClient()

  const { error } =
    await supabase.storage
      .from(STORE_STORAGE_BUCKET)
      .remove(uniquePaths)

  if (error) {
    console.warn(
      "[PRODUCTS-STORAGE] Falha ao remover ficheiros:",
      error.message
    )

    return {
      removed: [],
      failed: uniquePaths,
    }
  }

  return {
    removed: uniquePaths,
    failed: [],
  }
}