import { SignJWT, jwtVerify, type JWTPayload } from "jose"

type Signable = Record<string, unknown>

function getSecretKey() {
  // In dev, fall back to a local secret so previews don't fail.
  const secret = process.env.JWT_SECRET || "dev-only-secret-change-me"
  return new TextEncoder().encode(secret)
}

/**
 * Sign a JWT with HS256.
 */
export async function signJWT(payload: Signable, expiresInSeconds = 60 * 60 * 24 * 7) {
  const secret = getSecretKey()
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds

  return await new SignJWT(payload as JWTPayload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(secret)
}

/**
 * Verify a JWT and return the payload or null if invalid/expired.
 */
export async function verifyJWT<T = any>(token: string): Promise<T | null> {
  try {
    const secret = getSecretKey()
    const { payload } = await jwtVerify(token, secret)
    return payload as T
  } catch {
    return null
  }
}
