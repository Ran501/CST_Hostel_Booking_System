import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export function isBcryptHash(value) {
  return typeof value === "string" && /^\$2[aby]\$\d{2}\$/.test(value);
}

export async function hashPassword(plain) {
  return bcrypt.hash(String(plain), SALT_ROUNDS);
}

/**
 * Verify a password against a stored value.
 * Supports bcrypt hashes and legacy plain-text values from manual DB entries.
 */
export async function verifyPassword(plain, stored) {
  if (!stored) {
    return { ok: false, needsRehash: false };
  }

  const input = String(plain);
  const storedValue = String(stored);

  if (isBcryptHash(storedValue)) {
    const ok = await bcrypt.compare(input, storedValue);
    return { ok, needsRehash: false };
  }

  const ok = input === storedValue;
  return { ok, needsRehash: ok };
}
