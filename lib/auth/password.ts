import crypto from "crypto";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export function generateTemporaryPassword(length = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const randomBytes = crypto.randomBytes(length);

  let password = "";
  for (let i = 0; i < length; i += 1) {
    password += chars[randomBytes[i] % chars.length];
  }

  return `Staff@${password}`;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}
