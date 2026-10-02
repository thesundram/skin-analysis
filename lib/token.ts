// Edge-compatible session token utility (uses only Web Crypto API)
// Safe to import in Next.js middleware and Edge runtime

export const AUTH_COOKIE_NAME = "auth-token";

export interface TokenPayload {
  userId: string;
  email: string;
  fullName: string;
  exp: number;
}

function getSecret(): string {
  return (
    process.env.AUTH_SECRET ||
    "skin_analysis_mongo_secure_session_secret_2026_xyz"
  );
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlToBytes(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getHmacKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(getSecret()) as unknown as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createSessionToken(
  user: { id: string; email: string; fullName: string },
  expiresInSeconds = 60 * 60 * 24 * 7 // 7 days
): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    exp,
  };

  const enc = new TextEncoder();
  const payloadJson = JSON.stringify(payload);
  const payloadB64 = bytesToBase64Url(enc.encode(payloadJson));

  const key = await getHmacKey();
  const signatureBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(payloadB64) as unknown as BufferSource
  );
  const signatureB64 = bytesToBase64Url(new Uint8Array(signatureBytes));

  return `${payloadB64}.${signatureB64}`;
}

export async function verifySessionToken(
  token?: string | null
): Promise<TokenPayload | null> {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, signatureB64] = parts;

  try {
    const key = await getHmacKey();
    const enc = new TextEncoder();
    const sigBytes = base64UrlToBytes(signatureB64);

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes as unknown as BufferSource,
      enc.encode(payloadB64) as unknown as BufferSource
    );

    if (!isValid) return null;

    const payloadJson = new TextDecoder().decode(base64UrlToBytes(payloadB64));
    const payload: TokenPayload = JSON.parse(payloadJson);

    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}
