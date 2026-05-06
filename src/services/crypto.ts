/**
 * Zero-Knowledge Crypto Service for FocusDoList
 * Uses Web Crypto API (AES-GCM, PBKDF2)
 */

const ENCRYPTION_ALGO = "AES-GCM"
const PBKDF2_ITERATIONS = 100000
const KEY_LEN = 256
const SALT = new TextEncoder().encode("focusdolist-salt-v1")

export async function deriveKey(password: string): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  )

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: SALT,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: ENCRYPTION_ALGO, length: KEY_LEN },
    false,
    ["encrypt", "decrypt"]
  )
}

/**
 * Encrypts plaintext using a derived key.
 * Allows passing an IV for multi-field encryption consistency.
 */
export async function encrypt(plaintext: string, key: CryptoKey, providedIv?: Uint8Array): Promise<{ ciphertext: string, iv: string }> {
  const iv = providedIv || crypto.getRandomValues(new Uint8Array(12))
  const enc = new TextEncoder()
  const encrypted = await crypto.subtle.encrypt(
    { name: ENCRYPTION_ALGO, iv },
    key,
    enc.encode(plaintext)
  )

  return {
    ciphertext: bufToBase64(encrypted),
    iv: bufToBase64(iv)
  }
}

export async function decrypt(ciphertextBase64: string, ivBase64: string, key: CryptoKey): Promise<string> {
  try {
    const iv = base64ToBuf(ivBase64)
    const data = base64ToBuf(ciphertextBase64)
    
    const decrypted = await crypto.subtle.decrypt(
      { name: ENCRYPTION_ALGO, iv },
      key,
      data
    )

    return new TextDecoder().decode(decrypted)
  } catch (e) {
    throw new Error("FAILED_TO_DECRYPT")
  }
}

function bufToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToBuf(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}
