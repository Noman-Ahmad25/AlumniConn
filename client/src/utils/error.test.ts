import { describe, it, expect } from "vitest"
import { getApiErrorMessage } from "./error"
import { AxiosError, AxiosHeaders } from "axios"

describe("getApiErrorMessage", () => {
  it("extracts and formats Pydantic array validation errors", () => {
    const error = new AxiosError(
      "Unprocessable Entity",
      "422",
      undefined,
      undefined,
      {
        data: {
          detail: [
            {
              loc: ["body", "password"],
              msg: "Value error, Password must contain at least one uppercase letter",
              type: "value_error",
            },
            {
              loc: ["body", "password"],
              msg: "Value error, Password must contain at least one special character",
              type: "value_error",
            },
          ],
        },
        status: 422,
        statusText: "Unprocessable Entity",
        headers: {},
        config: { headers: new AxiosHeaders() },
      }
    )

    const msg = getApiErrorMessage(error, "Fallback error")
    expect(msg).toBe(
      "Password must contain at least one uppercase letter. Password must contain at least one special character"
    )
  })

  it("handles string detail", () => {
    const error = new AxiosError(
      "Bad Request",
      "400",
      undefined,
      undefined,
      {
        data: { detail: "Invalid email or password" },
        status: 400,
        statusText: "Bad Request",
        headers: {},
        config: { headers: new AxiosHeaders() },
      }
    )

    const msg = getApiErrorMessage(error, "Fallback error")
    expect(msg).toBe("Invalid email or password")
  })

  it("returns fallback for non-axios error without message", () => {
    expect(getApiErrorMessage({}, "Default fallback")).toBe("Default fallback")
  })
})
