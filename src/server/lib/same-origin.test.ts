import { describe, expect, it } from "vitest";
import { isCrossSiteWrite } from "./same-origin";

const host = "daily-coffee-store.vercel.app";

describe("isCrossSiteWrite", () => {
  it("blocks writes coming from another site", () => {
    expect(isCrossSiteWrite("POST", "https://site-do-mal.com", host)).toBe(
      true,
    );
    expect(isCrossSiteWrite("delete", "https://site-do-mal.com", host)).toBe(
      true,
    );
    expect(
      isCrossSiteWrite("POST", `https://${host}.site-do-mal.com`, host),
    ).toBe(true);
    expect(isCrossSiteWrite("POST", "null", host)).toBe(true);
  });

  it("allows writes from our own site, including the dev server opened by the network IP", () => {
    expect(isCrossSiteWrite("POST", `https://${host}`, host)).toBe(false);
    expect(
      isCrossSiteWrite("POST", "http://192.168.0.88:3000", "192.168.0.88:3000"),
    ).toBe(false);
  });

  it("allows requests without Origin (Postman, curl) and reads from anywhere", () => {
    expect(isCrossSiteWrite("POST", null, host)).toBe(false);
    expect(isCrossSiteWrite("GET", "https://site-do-mal.com", host)).toBe(
      false,
    );
  });

  it("fails closed when the request has no Host", () => {
    expect(isCrossSiteWrite("POST", `https://${host}`, null)).toBe(true);
  });
});
