import { randomBytes, scrypt, timingSafeEqual } from "crypto"
import { promisify } from "util"

const scryptAsync = promisify(scrypt)

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex")
  const buf = (await scryptAsync(password, salt, 64)) as Buffer
  return `${buf.toString("hex")}.${salt}`
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  const [hashedPassword, salt] = hash.split(".")
  if (!hashedPassword || !salt) return false
  const hashBuffer = Buffer.from(hashedPassword, "hex")
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer
  return timingSafeEqual(hashBuffer, derivedKey)
}

export function generateOtp(length = 6): string {
  const digits = "0123456789"
  let otp = ""
  const bytes = randomBytes(length)
  for (let i = 0; i < length; i++) {
    otp += digits[(bytes[i] ?? 0) % 10]
  }
  return otp
}
