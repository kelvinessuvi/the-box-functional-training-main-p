import type { Language } from "@/lib/translations"

interface BuildWhatsAppOrderMessageInput {
  productName: string
  reference: string
  variantLabel?: string | null
  variantName?: string | null
  price: number
  currency?: string
  language: Language
}

export function normalizeWhatsAppNumber(value: string) {
  return value.replace(/\D/g, "")
}

export function formatOrderPrice(
  value: number,
  currency = "AOA",
  language: Language = "pt"
) {
  const locale = language === "pt" ? "pt-PT" : "en-US"
  const formattedValue = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }).format(value)

  if (currency === "AOA") {
    return `${formattedValue} Kz`
  }

  return `${formattedValue} ${currency}`
}

export function buildWhatsAppOrderMessage({
  productName,
  reference,
  variantLabel,
  variantName,
  price,
  currency = "AOA",
  language,
}: BuildWhatsAppOrderMessageInput) {
  const priceText = formatOrderPrice(
    price,
    currency,
    language
  )

  if (language === "en") {
    const lines = [
      "Hello, THE BOX!",
      "",
      "I would like to order the following product:",
      "",
      `Product: ${productName}`,
      `Reference: ${reference}`,
    ]

    if (variantLabel && variantName) {
      lines.push(`${variantLabel}: ${variantName}`)
    }

    lines.push(`Price: ${priceText}`)
    lines.push("")
    lines.push(
      "Could you confirm availability and the purchase process?"
    )

    return lines.join("\n")
  }

  const lines = [
    "Olá, THE BOX!",
    "",
    "Gostaria de encomendar o seguinte produto:",
    "",
    `Produto: ${productName}`,
    `Referência: ${reference}`,
  ]

  if (variantLabel && variantName) {
    lines.push(`${variantLabel}: ${variantName}`)
  }

  lines.push(`Preço: ${priceText}`)
  lines.push("")
  lines.push(
    "Podem confirmar a disponibilidade e o processo de compra?"
  )

  return lines.join("\n")
}

export function buildWhatsAppOrderUrl(
  whatsappNumber: string,
  message: string
) {
  const normalizedNumber =
    normalizeWhatsAppNumber(whatsappNumber)

  if (!normalizedNumber) {
    return null
  }

  return `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`
}
