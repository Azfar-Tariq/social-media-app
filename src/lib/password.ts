import { scryptSync, randomBytes, timingSafeEqual } from "crypto";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hashedPassword = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hashedPassword}`;
}

export function verifyPassword(password: string, combinedHash: string): boolean {
  if (!combinedHash || !combinedHash.includes(":")) return false;
  const [salt, storedHash] = combinedHash.split(":");
  const hashedPassword = scryptSync(password, salt, 64).toString("hex");
  
  const bufferStored = Buffer.from(storedHash, "hex");
  const bufferHashed = Buffer.from(hashedPassword, "hex");
  
  if (bufferStored.length !== bufferHashed.length) return false;
  return timingSafeEqual(bufferStored, bufferHashed);
}
