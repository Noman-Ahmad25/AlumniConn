import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import DemoEmailInbox from "../features/auth/components/DemoEmailInbox"
import Login from "../features/auth/pages/Login"
import SuperAdminLogin from "../features/admin/pages/SuperAdminLogin"
import * as authApi from "../features/auth/api/auth"
import * as tenantProvider from "../providers/TenantProvider"

describe("Demo Accounts and Email Interception Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(tenantProvider, "useTenant").mockReturnValue({
      tenant: {
        id: 1,
        name: "National Institute of Technology Karnataka",
        slug: "nitk",
        domain: "nitk.edu.in",
        location: "Surathkal",
        is_approved: true,
        is_active: true,
        branding: null,
      },
      loading: false,
      error: null,
    } as any)
  })

  it("Login page has a clean professional form and subtle demo link, not the full picker", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    expect(screen.getByText("Welcome to National Institute of Technology Karnataka")).toBeInTheDocument()
    expect(screen.getByLabelText("Email or Username")).toBeInTheDocument()
    expect(screen.getByLabelText("Password")).toBeInTheDocument()
    // Should NOT have prominent demo evaluation header in Login card
    expect(screen.queryByText("Instant 1-Click Demo Evaluation")).not.toBeInTheDocument()
    // Should have subtle link to demo
    expect(screen.getByText(/Explore the live demo/i)).toBeInTheDocument()
  })

  it("SuperAdminLogin supports username_or_email and subtle demo link, not the full picker", () => {
    render(
      <MemoryRouter>
        <SuperAdminLogin />
      </MemoryRouter>
    )

    expect(screen.getByText("Super admin login")).toBeInTheDocument()
    expect(screen.getByLabelText("Email or Username")).toBeInTheDocument()
    expect(screen.getByLabelText("Password")).toBeInTheDocument()
    expect(screen.queryByText("Instant 1-Click Demo Evaluation")).not.toBeInTheDocument()
    expect(screen.getByText(/Explore the live demo/i)).toBeInTheDocument()
  })

  it("DemoEmailInbox renders intercepted emails with direct 1-click action buttons in demo mode", async () => {
    vi.spyOn(authApi, "getEmailMode").mockResolvedValue({ email_mode: "demo" })
    vi.spyOn(authApi, "getDemoEmails").mockResolvedValue({
      total: 1,
      emails: [
        {
          id: "demo_email_1",
          to_email: "test.student@nitk.edu.in",
          subject: "Verify your AlumniConn account",
          html_body: "<p>Click below to verify</p>",
          action_type: "user_verification",
          action_url: "/c/nitk/verify-email?token=valid_token_123",
          created_at: new Date().toISOString(),
        },
      ],
    })

    render(
      <MemoryRouter>
        <DemoEmailInbox />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText("Demo Email Delivery Inbox")).toBeInTheDocument()
    })

    expect(screen.getByText("EMAIL_MODE=demo")).toBeInTheDocument()
    expect(screen.getByText("Verify your AlumniConn account")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Verify Email/i })).toBeInTheDocument()
  })

  it("DemoEmailInbox renders nothing when EMAIL_MODE is real", async () => {
    vi.spyOn(authApi, "getEmailMode").mockResolvedValue({ email_mode: "real" })

    const { container } = render(
      <MemoryRouter>
        <DemoEmailInbox />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(container.firstChild).toBeNull()
    })
  })
})
