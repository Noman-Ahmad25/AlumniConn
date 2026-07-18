import { render, screen, waitFor } from "@testing-library/react"
import { vi } from "vitest"
import App from "./App"

vi.mock("../features/auth/pages/Register", () => ({ default: () => <div>Register Page</div> }))
vi.mock("../features/auth/pages/Login", () => ({ default: () => <div>Login Page</div> }))
vi.mock("../features/feed/pages/Feed", () => ({ default: () => <div>Feed Page</div> }))
vi.mock("../features/connections/pages/Connections", () => ({ default: () => <div>Connections Page</div> }))
vi.mock("../features/profile/pages/Profile", () => ({ default: () => <div>Profile Page</div> }))
vi.mock("../features/profile/pages/CreateProfile", () => ({ default: () => <div>Create Profile Page</div> }))

vi.mock("../features/college/api/college", () => ({
  getCollegeBySlug: vi.fn(() => Promise.resolve({
    id: 1,
    name: "MIT",
    slug: "mit",
    branding: {
      primary_color: "#2563eb",
      accent_color: "#0f766e",
      logo_url: null,
      banner_url: null,
      welcome_message: "Welcome to MIT"
    }
  }))
}))

test("protected routes redirect to login without token", async () => {
  window.history.pushState({}, "", "/c/mit/feed")

  render(<App />)

  await waitFor(() => expect(screen.getByText("Login Page")).toBeInTheDocument())
})
