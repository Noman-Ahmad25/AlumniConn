import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { vi, describe, test, expect, beforeEach } from "vitest"
import Topbar from "../layouts/AppShell/Topbar"
import DemoAccountPicker from "../features/auth/components/DemoAccountPicker"
import { adminManagementAPI } from "../features/admin/api/management"
import { getRoleHomePath } from "../features/auth/utils/auth"
import { TenantProvider } from "../providers/TenantProvider"

vi.mock("../features/admin/api/management", () => ({
  adminManagementAPI: {
    demoLogin: vi.fn(),
    getPlatformOverview: vi.fn(),
    getAdminColleges: vi.fn(),
    updateCollegeStatus: vi.fn(),
    deleteCollege: vi.fn(),
    getPlatformUsers: vi.fn(),
    getCollegeUsers: vi.fn(),
    updateUserStatus: vi.fn(),
    updateUserRole: vi.fn(),
    deleteUser: vi.fn(),
  },
}))

vi.mock("../features/notifications/api/notification", () => ({
  getUnreadNotificationCount: vi.fn().mockResolvedValue({ unread_count: 0 }),
}))

function tokenFor(userId: number, role: string, collegeId: number | null = null) {
  return `header.${window.btoa(JSON.stringify({ user_id: userId, role, college_id: collegeId }))}.sig`
}

const mockTenant = {
  id: 1,
  name: "National Institute of Technology Karnataka",
  slug: "nitk",
  domain: "nitk.edu.in",
  is_approved: true,
  is_active: true,
}

describe("Admin Management & Demo Login Experience Suite", () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  test("getRoleHomePath returns /super-admin/dashboard for super_admin and /admin/users for admin", () => {
    expect(getRoleHomePath("super_admin")).toBe("/super-admin/dashboard")
    expect(getRoleHomePath("admin")).toBe("/admin/users")
    expect(getRoleHomePath("alumni")).toBe("/feed")
    expect(getRoleHomePath("student")).toBe("/feed")
  })

  test("DemoAccountPicker renders all 4 roles and triggers demoLogin", async () => {
    vi.mocked(adminManagementAPI.demoLogin).mockResolvedValue({
      access_token: "mock-super-admin-token",
      token_type: "bearer",
      college_slug: null,
      role: "super_admin",
    })

    render(
      <MemoryRouter>
        <DemoAccountPicker />
      </MemoryRouter>
    )

    expect(screen.getByText("Super Admin")).toBeInTheDocument()
    expect(screen.getByText("College Admin")).toBeInTheDocument()
    expect(screen.getByText("Demo Alumni")).toBeInTheDocument()
    expect(screen.getByText("Demo Student")).toBeInTheDocument()

    const saButton = screen.getByRole("button", { name: /Sign in as Super Admin/i })
    fireEvent.click(saButton)

    await waitFor(() => {
      expect(adminManagementAPI.demoLogin).toHaveBeenCalledWith("super_admin")
    })
  })

  test("Topbar for Super Admin displays platform navigation tabs", () => {
    localStorage.setItem("access_token", tokenFor(1, "super_admin", null))

    render(
      <MemoryRouter initialEntries={["/super-admin/dashboard"]}>
        <Topbar />
      </MemoryRouter>
    )

    expect(screen.getAllByText("Dashboard").length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText("Universities")).toBeInTheDocument()
    expect(screen.getByText("Users")).toBeInTheDocument()
    expect(screen.getByText("College Requests")).toBeInTheDocument()
    // Should NOT show student/alumni-only tabs
    expect(screen.queryByText("Discover")).not.toBeInTheDocument()
    expect(screen.queryByText("Recommendations")).not.toBeInTheDocument()
  })

  test("Topbar for College Admin displays Manage Users and Alumni Requests", () => {
    localStorage.setItem("access_token", tokenFor(2, "admin", 1))

    render(
      <MemoryRouter initialEntries={["/c/nitk/admin/users"]}>
        <TenantProvider tenant={mockTenant}>
          <Topbar />
        </TenantProvider>
      </MemoryRouter>
    )

    expect(screen.getAllByText("Manage Users").length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText("Alumni Requests")).toBeInTheDocument()
    expect(screen.getByText("Feed")).toBeInTheDocument()
    expect(screen.getByText("Discover")).toBeInTheDocument()
  })
})
