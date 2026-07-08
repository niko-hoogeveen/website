/**
 * Client-side password gate for the /fantasy section
 *
 * IMPORTANT: This is NOT real security. The site is a static export with no
 * backend to validate secrets server-side, so this only compares a SHA-256
 * hash of the entered password against a hash baked into the client bundle
 * at build time (NEXT_PUBLIC_FANTASY_PASSWORD_HASH). A technical visitor
 * could find this hash in the page source. This is an accepted tradeoff
 * (see PRD.md) — it deters casual access to private league content, nothing
 * more.
 */

const STORAGE_KEY = "fantasy-unlocked";

/**
 * Hash a string using SHA-256 (Web Crypto API, available in all browsers)
 */
async function sha256Hex(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Check whether the given password matches the configured hash
 * (NEXT_PUBLIC_FANTASY_PASSWORD_HASH, set at build time)
 */
export async function verifyPassword(input: string): Promise<boolean> {
  const expectedHash = process.env.NEXT_PUBLIC_FANTASY_PASSWORD_HASH;

  if (!expectedHash) {
    console.error(
      "NEXT_PUBLIC_FANTASY_PASSWORD_HASH is not configured — the fantasy password gate cannot be unlocked."
    );
    return false;
  }

  const inputHash = await sha256Hex(input);
  return inputHash === expectedHash.toLowerCase();
}

/**
 * Whether the /fantasy section has already been unlocked in this browser
 */
export function isUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) === "true";
}

/**
 * Mark the /fantasy section as unlocked in this browser
 */
export function setUnlocked(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, "true");
}

/**
 * Lock the /fantasy section again in this browser (e.g., a "log out" action)
 */
export function clearUnlocked(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
