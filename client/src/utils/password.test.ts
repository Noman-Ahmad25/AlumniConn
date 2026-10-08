import { describe, it, expect } from "vitest"
import { validatePasswordComplexity } from "./password"

describe("validatePasswordComplexity", () => {
  it("rejects password shorter than 8 characters", () => {
    expect(validatePasswordComplexity("Ab1!")).toBe("Password must be at least 8 characters long")
  })

  it("rejects password without uppercase letter", () => {
    expect(validatePasswordComplexity("password123!")).toBe("Password must contain at least one uppercase letter")
  })

  it("rejects password without lowercase letter", () => {
    expect(validatePasswordComplexity("PASSWORD123!")).toBe("Password must contain at least one lowercase letter")
  })

  it("rejects password without digit", () => {
    expect(validatePasswordComplexity("Password!@#")).toBe("Password must contain at least one digit")
  })

  it("rejects password without special character", () => {
    expect(validatePasswordComplexity("Password123")).toBe("Password must contain at least one special character")
  })

  it("accepts valid complex password", () => {
    expect(validatePasswordComplexity("ValidPass123!")).toBeNull()
  })
})
