import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import RequestAlumniRole from "./RequestAlumniRole"
import { alumniRequestsAPI } from "../../admin/api/requests"

vi.mock("../../admin/api/requests", () => ({
  alumniRequestsAPI: {
    getMyAlumniRequest: vi.fn(),
    requestAlumniRole: vi.fn(),
  },
}))

describe("RequestAlumniRole component", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders pending review card when user has pending alumni status", async () => {
    vi.mocked(alumniRequestsAPI.getMyAlumniRequest).mockResolvedValue({
      id: 1,
      user_id: 10,
      username: "alumni_applicant",
      status: "pending",
      created_at: new Date().toISOString(),
    })

    render(<RequestAlumniRole />)

    expect(
      await screen.findByText(/Alumni Status Pending Review/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Your request has been submitted to your college administrator/i)
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: /Apply for Alumni Role/i })
    ).not.toBeInTheDocument()
  })

  it("renders apply button when user has not requested alumni status and submits request", async () => {
    vi.mocked(alumniRequestsAPI.getMyAlumniRequest).mockResolvedValue({
      id: 1,
      user_id: 10,
      username: "student_user",
      status: "not_requested",
      created_at: new Date().toISOString(),
    })

    vi.mocked(alumniRequestsAPI.requestAlumniRole).mockResolvedValue({
      id: 1,
      user_id: 10,
      username: "student_user",
      status: "pending",
      created_at: new Date().toISOString(),
    })

    render(<RequestAlumniRole />)

    const applyBtn = await screen.findByRole("button", { name: /Apply for Alumni Role/i })
    expect(applyBtn).toBeInTheDocument()

    // Click apply to show confirm
    fireEvent.click(applyBtn)

    const confirmBtn = screen.getByRole("button", { name: /Confirm/i })
    expect(confirmBtn).toBeInTheDocument()

    // Confirm request
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(alumniRequestsAPI.requestAlumniRole).toHaveBeenCalledTimes(1)
    })

    expect(
      await screen.findByText(/Alumni Status Pending Review/i)
    ).toBeInTheDocument()
  })

  it("renders nothing when user is already approved", async () => {
    vi.mocked(alumniRequestsAPI.getMyAlumniRequest).mockResolvedValue({
      id: 1,
      user_id: 10,
      username: "already_alumni",
      status: "approved",
      created_at: new Date().toISOString(),
    })

    const { container } = render(<RequestAlumniRole />)

    await waitFor(() => {
      expect(alumniRequestsAPI.getMyAlumniRequest).toHaveBeenCalled()
    })

    expect(container).toBeEmptyDOMElement()
  })
})
