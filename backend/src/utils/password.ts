/**
 * Password hashing utilities using Argon2
 * Bun has native support for password hashing with Argon2
 */

export async function hashPassword(password: string): Promise<string> {
  return await Bun.password.hash(password, {
    algorithm: 'argon2id',
    memoryCost: 65536, // 64 MB
    timeCost: 3,
  });
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await Bun.password.verify(password, hash);
}
