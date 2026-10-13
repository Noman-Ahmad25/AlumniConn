import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { vi, describe, test, expect, beforeEach, afterEach } from "vitest"
import Topbar from "../layouts/AppShell/Topbar"
import CollegeAdminBranding from "../features/admin/pages/CollegeAdminBranding"
import TenantResolver from "../features/college/pages/TenantResolver"
import { TenantProvider } from "../providers/TenantProvider"
import * as collegeApi from "../features/college/api/college"

vi.mock("../features/college/api/college", () => ({
  getCollegeBySlug: vi.fn(),
  updateCollege: vi.fn(),
}))

vi.mock("../features/notifications/api/notification", () => ({
  getUnreadNotificationCount: vi.fn().mockResolvedValue({ unread_count: 0 }),
}))

function tokenFor(userId: number, role: string, collegeId: number | null = 1) {
  return `header.${window.btoa(JSON.stringify({ user_id: userId, role, college_id: collegeId }))}.sig`
}

const customCollege: collegeApi.CollegePublicResponse = {
  id: 10,
  name: "Solaris Tech",
  slug: "solaris-tech",
  description: "Advanced engineering campus.",
  branding: {
    logo_url: "https://example.com/solaris-logo.png",
    banner_url: "https://example.com/solaris-banner.jpg",
    primary_color: "#7c3aed",
    secondary_color: "#a78bfa",
    accent_color: "#f59e0b",
    welcome_message: "Welcome to Solaris Tech",
    motto: "Pioneering the Future",
  },
}

const defaultCollege: collegeApi.CollegePublicResponse = {
  id: 20,
  name: "Apex Institute",
  slug: "apex-institute",
  branding: null,
}

describe("College Branding Verification & Customization Suite", () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    document.documentElement.style.removeProperty("--primary")
    document.documentElement.style.removeProperty("--accent")
    document.documentElement.style.removeProperty("--text-on-primary")
    document.documentElement.style.removeProperty("--text-on-accent")
    document.title = "AlumniConn"
  })

  afterEach(() => {
    document.documentElement.style.removeProperty("--primary")
    document.documentElement.style.removeProperty("--accent")
    document.documentElement.style.removeProperty("--text-on-primary")
    document.documentElement.style.removeProperty("--text-on-accent")
    document.title = "AlumniConn"
  })

  test("1. Global context without tenant renders default AlumniConn branding", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Topbar />
      </MemoryRouter>
    )

    expect(screen.getByText("AlumniConn")).toBeInTheDocument()
    expect(screen.queryByAltText(/Logo/i)).not.toBeInTheDocument()
  })

  test("2. College-scoped Topbar displays college name and logo if available", () => {
    localStorage.setItem("access_token", tokenFor(1, "student", 10))

    render(
      <MemoryRouter initialEntries={["/c/solaris-tech/feed"]}>
        <TenantProvider tenant={customCollege}>
          <Topbar />
        </TenantProvider>
      </MemoryRouter>
    )

    // Displays Solaris Tech name instead of hardcoded AlumniConn
    expect(screen.getByText("Solaris Tech")).toBeInTheDocument()
    // Displays custom logo
    const logo = screen.getByAltText("Solaris Tech Logo")
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute("src", "https://example.com/solaris-logo.png")
  })

  test("3. Missing branding values retain default fallback appearance (graduation icon)", () => {
    localStorage.setItem("access_token", tokenFor(1, "student", 20))

    render(
      <MemoryRouter initialEntries={["/c/apex-institute/feed"]}>
        <TenantProvider tenant={defaultCollege}>
          <Topbar />
        </TenantProvider>
      </MemoryRouter>
    )

    expect(screen.getByText("Apex Institute")).toBeInTheDocument()
    // Logo image is not rendered when branding is null
    expect(screen.queryByAltText(/Logo/i)).not.toBeInTheDocument()
    // Brand mark fallback is present
    expect(document.querySelector(".brand-mark")).toBeInTheDocument()
  })

  test("4. TenantResolver injects CSS custom properties and updates document title", async () => {
    vi.mocked(collegeApi.getCollegeBySlug).mockResolvedValue(customCollege)

    render(
      <MemoryRouter initialEntries={["/c/solaris-tech/feed"]}>
        <Routes>
          <Route path="/c/:collegeSlug" element={<TenantResolver />}>
            <Route path="feed" element={<div>Campus Feed Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText("Campus Feed Content")).toBeInTheDocument()
    })

    const root = document.documentElement
    expect(root.style.getPropertyValue("--primary")).toBe("#7c3aed")
    expect(root.style.getPropertyValue("--accent")).toBe("#f59e0b")
    expect(root.style.getPropertyValue("--text-on-primary")).toBeTruthy()
    expect(document.title).toContain("Solaris Tech")
  })

  test("5. Unmounting TenantResolver resets CSS variables to prevent cross-college style leakage", async () => {
    vi.mocked(collegeApi.getCollegeBySlug).mockResolvedValue(customCollege)

    const { unmount } = render(
      <MemoryRouter initialEntries={["/c/solaris-tech/feed"]}>
        <Routes>
          <Route path="/c/:collegeSlug" element={<TenantResolver />}>
            <Route path="feed" element={<div>Campus Feed Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(document.documentElement.style.getPropertyValue("--primary")).toBe("#7c3aed")
    })

    unmount()

    // Cleaned up
    expect(document.documentElement.style.getPropertyValue("--primary")).toBe("")
    expect(document.documentElement.style.getPropertyValue("--accent")).toBe("")
    expect(document.title).toBe("AlumniConn")
  })

  test("6. College Admin sees Branding link in navigation", () => {
    localStorage.setItem("access_token", tokenFor(2, "admin", 10))

    render(
      <MemoryRouter initialEntries={["/c/solaris-tech/feed"]}>
        <TenantProvider tenant={customCollege}>
          <Topbar />
        </TenantProvider>
      </MemoryRouter>
    )

    expect(screen.getByText("Branding")).toBeInTheDocument()
    expect(screen.getByText("Manage Users")).toBeInTheDocument()
    expect(screen.getByText("Alumni Requests")).toBeInTheDocument()
  })

  test("7. CollegeAdminBranding loads existing values and saves modifications via authorized API", async () => {
    const refreshTenant = vi.fn().mockResolvedValue(undefined)
    vi.mocked(collegeApi.updateCollege).mockResolvedValue({
      ...customCollege,
      name: "Solaris Institute of Technology",
    })

    render(
      <MemoryRouter initialEntries={["/c/solaris-tech/admin/branding"]}>
        <TenantProvider tenant={customCollege} refreshTenant={refreshTenant}>
          <CollegeAdminBranding />
        </TenantProvider>
      </MemoryRouter>
    )

    // Form inputs loaded with tenant values
    const nameInput = screen.getByLabelText(/College Name/i) as HTMLInputElement
    expect(nameInput.value).toBe("Solaris Tech")

    const primaryColorInput = screen.getByLabelText(/Primary Brand Color picker/i) as HTMLInputElement
    expect(primaryColorInput.value).toBe("#7c3aed")

    // Update college name
    fireEvent.change(nameInput, { target: { value: "Solaris Institute of Technology" } })
    expect(nameInput.value).toBe("Solaris Institute of Technology")

    // Submit form
    const saveButton = screen.getByRole("button", { name: /Save Branding Changes/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(collegeApi.updateCollege).toHaveBeenCalledWith(
        10,
        expect.objectContaining({
          name: "Solaris Institute of Technology",
          branding: expect.objectContaining({
            primary_color: "#7c3aed",
            logo_url: "https://example.com/solaris-logo.png",
          }),
        })
      )
      expect(refreshTenant).toHaveBeenCalled()
      expect(screen.getByText("College branding updated successfully.")).toBeInTheDocument()
    })
  })
})
