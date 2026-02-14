import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Cron Secret Verification", () => {
  beforeEach(() => {
    vi.stubEnv("CRON_SECRET", "test-secret-123");
  });

  it("should accept valid secret", () => {
    const secret = "test-secret-123";
    const isValid = secret === process.env.CRON_SECRET;
    expect(isValid).toBe(true);
  });

  it("should reject invalid secret", () => {
    const secret = "wrong-secret";
    const isValid = secret === process.env.CRON_SECRET;
    expect(isValid).toBe(false);
  });

  it("should reject missing secret", () => {
    const secret = null;
    const isValid = secret === process.env.CRON_SECRET;
    expect(isValid).toBe(false);
  });
});
