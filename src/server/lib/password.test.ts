import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("produces an argon2id hash that only matches the original password", async () => {
    const passwordHash = await hashPassword("cafe com pao");

    expect(passwordHash).toMatch(/^\$argon2id\$/);
    expect(passwordHash).not.toContain("cafe com pao");
    await expect(verifyPassword(passwordHash, "cafe com pao")).resolves.toBe(
      true,
    );
    await expect(verifyPassword(passwordHash, "cafe com pão")).resolves.toBe(
      false,
    );
  });

  it("uses a random salt: the same password gives different hashes", async () => {
    const [first, second] = await Promise.all([
      hashPassword("cafe com pao"),
      hashPassword("cafe com pao"),
    ]);

    expect(first).not.toBe(second);
  });

  it("returns false without a stored hash (unknown email or Google-only account)", async () => {
    await expect(verifyPassword(null, "qualquer")).resolves.toBe(false);
    await expect(verifyPassword(undefined, "qualquer")).resolves.toBe(false);
  });
});
