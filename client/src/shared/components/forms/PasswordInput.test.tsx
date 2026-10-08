import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import PasswordInput from "./PasswordInput"

describe("PasswordInput component", () => {
  it("renders with default type='password' and toggles to 'text' when eye clicked", () => {
    const handleChange = vi.fn()
    render(
      <PasswordInput
        label="Password"
        name="password"
        value="Secret123!"
        onChange={handleChange}
      />
    )

    const input = screen.getByLabelText("Password") as HTMLInputElement
    expect(input.type).toBe("password")

    const toggleBtn = screen.getByRole("button", { name: /show password/i })
    expect(toggleBtn).toBeInTheDocument()

    // Click to show password
    fireEvent.click(toggleBtn)
    expect(input.type).toBe("text")
    expect(screen.getByRole("button", { name: /hide password/i })).toBeInTheDocument()

    // Click again to hide password
    fireEvent.click(screen.getByRole("button", { name: /hide password/i }))
    expect(input.type).toBe("password")
  })

  it("displays helper text and error message appropriately", () => {
    const { rerender } = render(
      <PasswordInput
        label="Password"
        value=""
        onChange={() => {}}
        helperText="Must be 8 characters"
      />
    )
    expect(screen.getByText("Must be 8 characters")).toBeInTheDocument()

    rerender(
      <PasswordInput
        label="Password"
        value=""
        onChange={() => {}}
        helperText="Must be 8 characters"
        error="Password must contain at least one uppercase letter"
      />
    )
    expect(screen.getByText("Password must contain at least one uppercase letter")).toBeInTheDocument()
    expect(screen.queryByText("Must be 8 characters")).not.toBeInTheDocument()
  })
})
