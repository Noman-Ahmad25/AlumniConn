import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import RequestCollegeForm from "./RequestCollegeForm"
import { collegeRequestsAPI } from "../../admin/api/requests"
import { BrowserRouter } from "react-router-dom"

vi.mock("../../admin/api/requests", () => ({
  collegeRequestsAPI: {
    requestCollege: vi.fn(),
  },
}))

vi.mock("../../../features/auth/api/auth", () => ({
  getEmailMode: vi.fn().mockResolvedValue({ email_mode: "demo" }),
  getDemoEmails: vi.fn().mockResolvedValue({
    emails: [
      {
        id: "email-1",
        to_email: "admin@apex.edu",
        subject: "Verify your email for Apex Institute",
        action_type: "college_verification",
        action_url: "http://localhost:5173/verify-college-email?token=test-token-123",
        created_at: new Date().toISOString(),
      },
    ],
  }),
  clearDemoEmails: vi.fn().mockResolvedValue({ message: "Cleared" }),
}))

describe("RequestCollegeForm component", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("validates password complexity before sending request", async () => {
    render(
      <BrowserRouter>
        <RequestCollegeForm />
      </BrowserRouter>
    )

    fireEvent.change(screen.getByLabelText(/College Name \*/i), {
      target: { value: "Apex Tech" },
    })
    fireEvent.change(screen.getByLabelText(/Admin Name \*/i), {
      target: { value: "Admin User" },
    })
    fireEvent.change(screen.getByLabelText(/College Domain \*/i), {
      target: { value: "apex.edu" },
    })
    fireEvent.change(screen.getByLabelText(/Location \*/i), {
      target: { value: "Mumbai" },
    })
    fireEvent.change(screen.getByLabelText(/Established Year \*/i), {
      target: { value: "2000" },
    })
    fireEvent.change(screen.getByLabelText(/Admin Email \*/i), {
      target: { value: "admin@apex.edu" },
    })

    // Weak password without numbers/special chars
    fireEvent.change(screen.getByLabelText(/Admin Password \*/i), {
      target: { value: "simplepassword" },
    })
    fireEvent.change(screen.getByLabelText(/Confirm Password \*/i), {
      target: { value: "simplepassword" },
    })

    fireEvent.click(screen.getByRole("button", { name: /Submit College Request/i }))

    expect(
      await screen.findByText(/Password must contain at least one uppercase letter/i)
    ).toBeInTheDocument()
    expect(collegeRequestsAPI.requestCollege).not.toHaveBeenCalled()
  })

  it("successfully submits when password is valid and renders DemoEmailInbox", async () => {
    vi.mocked(collegeRequestsAPI.requestCollege).mockResolvedValueOnce({
      id: 1,
      name: "Apex Tech",
      domain: "apex.edu",
      admin_name: "Admin User",
      admin_email: "admin@apex.edu",
      status: "pending",
      created_at: new Date().toISOString(),
    })

    render(
      <BrowserRouter>
        <RequestCollegeForm />
      </BrowserRouter>
    )

    fireEvent.change(screen.getByLabelText(/College Name \*/i), {
      target: { value: "Apex Tech" },
    })
    fireEvent.change(screen.getByLabelText(/Admin Name \*/i), {
      target: { value: "Admin User" },
    })
    fireEvent.change(screen.getByLabelText(/College Domain \*/i), {
      target: { value: "apex.edu" },
    })
    fireEvent.change(screen.getByLabelText(/Location \*/i), {
      target: { value: "Mumbai" },
    })
    fireEvent.change(screen.getByLabelText(/Established Year \*/i), {
      target: { value: "2000" },
    })
    fireEvent.change(screen.getByLabelText(/Admin Email \*/i), {
      target: { value: "admin@apex.edu" },
    })

    // Strong password satisfying all rules
    fireEvent.change(screen.getByLabelText(/Admin Password \*/i), {
      target: { value: "StrongPass123!" },
    })
    fireEvent.change(screen.getByLabelText(/Confirm Password \*/i), {
      target: { value: "StrongPass123!" },
    })

    fireEvent.click(screen.getByRole("button", { name: /Submit College Request/i }))

    await waitFor(() => {
      expect(collegeRequestsAPI.requestCollege).toHaveBeenCalledTimes(1)
    })

    expect(
      await screen.findByText(/College request submitted successfully!/i)
    ).toBeInTheDocument()

    // Verify DemoEmailInbox is rendered with Verify College action
    expect(await screen.findByText(/Admin Verification Email/i)).toBeInTheDocument()
    expect(await screen.findByText(/Verify College/i)).toBeInTheDocument()
  })
})
