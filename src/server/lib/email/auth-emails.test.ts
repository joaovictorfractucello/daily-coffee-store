import { describe, expect, it, vi } from "vitest";
import { escapeHtml, verificationEmail } from "./auth-emails";

vi.mock("@/env", () => ({ env: { APP_URL: "https://loja.test" } }));

describe("auth emails", () => {
  it("escapes HTML so a malicious name cannot inject a fake link", () => {
    expect(escapeHtml(`<a href="x">Ana</a> & 'eu'`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;Ana&lt;/a&gt; &amp; &#39;eu&#39;",
    );

    const email = verificationEmail(
      "ana@example.com",
      '<a href="https://mal.com">',
      "tok",
    );
    expect(email.html).not.toContain('<a href="https://mal.com">');
  });

  it("points the verification link to the configured site", () => {
    const email = verificationEmail("ana@example.com", "Ana", "abc");

    expect(email.text).toContain("https://loja.test/verificar-email?token=abc");
  });
});
