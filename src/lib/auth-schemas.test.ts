import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema, tokenSchema } from "./auth-schemas";

const validRegistration = {
  name: "Ana",
  email: "ana@example.com",
  password: "cafe com pao",
};

describe("registerSchema", () => {
  it("normalizes the email (spaces and capital letters) and trims the name", () => {
    const parsed = registerSchema.parse({
      ...validRegistration,
      name: "  Ana  ",
      email: "  Ana@Example.COM ",
    });

    expect(parsed).toEqual({ ...validRegistration, email: "ana@example.com" });
  });

  it("drops extra fields such as a role (no mass assignment)", () => {
    const parsed = registerSchema.parse({
      ...validRegistration,
      role: "ADMIN",
    });

    expect(parsed).not.toHaveProperty("role");
  });

  it("accepts passwords from 8 to 128 characters without composition rules", () => {
    expect(
      registerSchema.safeParse({ ...validRegistration, password: "abcdefgh" })
        .success,
    ).toBe(true);
    expect(
      registerSchema.safeParse({
        ...validRegistration,
        password: "a".repeat(128),
      }).success,
    ).toBe(true);
  });

  it.each([
    ["password too short", { password: "1234567" }],
    ["password too long", { password: "a".repeat(129) }],
    ["invalid email", { email: "ana@" }],
    ["empty name", { name: " " }],
  ])("rejects %s", (_, override) => {
    expect(
      registerSchema.safeParse({ ...validRegistration, ...override }).success,
    ).toBe(false);
  });
});

describe("loginSchema", () => {
  it("does not apply the minimum length to existing passwords, but keeps the maximum", () => {
    expect(
      loginSchema.safeParse({ email: "ana@example.com", password: "123" })
        .success,
    ).toBe(true);
    expect(
      loginSchema.safeParse({
        email: "ana@example.com",
        password: "a".repeat(129),
      }).success,
    ).toBe(false);
  });
});

describe("tokenSchema", () => {
  it("accepts only the 43-character base64url token format", () => {
    expect(tokenSchema.safeParse({ token: "a".repeat(43) }).success).toBe(true);
    expect(tokenSchema.safeParse({ token: "a".repeat(42) }).success).toBe(
      false,
    );
    expect(tokenSchema.safeParse({ token: `${"a".repeat(42)}'` }).success).toBe(
      false,
    );
  });
});
