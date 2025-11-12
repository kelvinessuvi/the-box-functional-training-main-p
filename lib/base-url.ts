/**
 * Retorna a URL base do app em qualquer ambiente (server ou client).
 * Ordem de resolução:
 * 1) process.env.NEXT_PUBLIC_BASE_URL (recomendado definir em produção)
 * 2) Cliente: window.location.origin
 * 3) Servidor: deriva de cabeçalhos X-Forwarded-* / Host
 * 4) Fallback local
 *
 * Observação: NEXT_PUBLIC_* fica disponível no cliente por ser embutida no bundle do build [^4][^5].
 */
export function getBaseUrl(headers?: Headers | Record<string, string | undefined>): string {
  // 1) Se a env estiver definida, use-a sempre
  if (process.env.NEXT_PUBLIC_BASE_URL && process.env.NEXT_PUBLIC_BASE_URL.length > 0) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  // 2) Em ambiente de navegador
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // 3) Em ambiente de servidor (Route Handler, Server Component com headers)
  const get = (key: string) => {
    if (!headers) return undefined;
    // Headers Web API
    if (typeof (headers as any).get === "function") {
      return (headers as Headers).get(key) ?? undefined;
    }
    // Objeto simples
    return (headers as Record<string, string | undefined>)[key];
  };

  const proto = get("x-forwarded-proto") ?? "http";
  const host =
    get("x-forwarded-host") ??
    get("host") ??
    "localhost:3000";

  return `${proto}://${host}`;
}

// Exporta o valor “cru” da env (embutido no build para o cliente)
export const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "";
