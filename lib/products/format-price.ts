import { DEFAULT_STORE_CURRENCY } from "./constants"

export function normalizePrice(
  value: number | string | null | undefined
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0
  }

  const parsed = Number(value)

  if (!Number.isFinite(parsed)) {
    return 0
  }

  return parsed
}

export function formatStorePrice(
  value: number | string,
  currency = DEFAULT_STORE_CURRENCY,
  locale = "pt-AO"
) {
  const amount = normalizePrice(value)

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits:
        Number.isInteger(amount) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${amount.toLocaleString(
      "pt-PT"
    )} Kz`
  }
}

export function formatKwanza(
  value: number | string
) {
  const amount = normalizePrice(value)

  return `${amount.toLocaleString("pt-PT", {
    minimumFractionDigits:
      Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  })} Kz`
}