import { render, screen, waitFor } from "@testing-library/react"
import { vi } from "vitest"
import App from "./App"

vi.mock("./pages/Register", () => ({ default: () => <div>Register Page</div> }))
vi.mock("./pages/Login", () => ({ default: () => <div>Login Page</div> }))
vi.mock("./pages/Feed", () => ({ default: () => <div>Feed Page</div> }))
vi.mock("./pages/Connections", () => ({ default: () => <div>Connections Page</div> }))
vi.mock("./pages/Profile", () => ({ default: () => <div>Profile Page</div> }))
vi.mock("./pages/CreateProfile", () => ({ default: () => <div>Create Profile Page</div> }))

test("protected routes redirect to login without token", async () => {
  window.history.pushState({}, "", "/feed")

  render(<App />)

  await waitFor(() => expect(screen.getByText("Login Page")).toBeInTheDocument())
})
