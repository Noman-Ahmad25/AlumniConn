import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import CreatePost from "./CreatePost"
import { createPost } from "../api/post"
import * as authUtils from "../../auth/utils/auth"

vi.mock("../api/post", () => ({
  createPost: vi.fn(),
}))

describe("CreatePost component", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("shows opportunity toggle to alumni role and includes is_opportunity when checked", async () => {
    vi.spyOn(authUtils, "getCurrentUserRoleFromToken").mockReturnValue("alumni")
    const mockPostCreated = vi.fn()
    vi.mocked(createPost).mockResolvedValue({
      id: 99,
      user_id: 1,
      username: "alumni_user",
      profile_picture: null,
      content: "Hiring software engineers!",
      image_url: null,
      is_opportunity: true,
      likes_count: 0,
      liked_by_current_user: false,
      comments_count: 0,
      created_at: new Date().toISOString(),
      connection_status: "self",
    })

    render(<CreatePost onPostCreated={mockPostCreated} />)

    // Verify opportunity checkbox is shown to alumni
    const opportunityCheckbox = screen.getByRole("checkbox", {
      name: /Mark as Opportunity/i,
    })
    expect(opportunityCheckbox).toBeInTheDocument()
    expect(opportunityCheckbox).not.toBeChecked()

    // Fill in content
    const textarea = screen.getByPlaceholderText(/Share your ideas/i)
    fireEvent.change(textarea, { target: { value: "Hiring software engineers!" } })

    // Check opportunity
    fireEvent.click(opportunityCheckbox)
    expect(opportunityCheckbox).toBeChecked()

    // Submit
    fireEvent.click(screen.getByRole("button", { name: "Post" }))

    await waitFor(() => {
      expect(createPost).toHaveBeenCalledWith({
        content: "Hiring software engineers!",
        is_opportunity: true,
        image_file: null,
      })
    })

    expect(mockPostCreated).toHaveBeenCalled()
  })

  it("does not show opportunity toggle to student role", () => {
    vi.spyOn(authUtils, "getCurrentUserRoleFromToken").mockReturnValue("student")
    const mockPostCreated = vi.fn()

    render(<CreatePost onPostCreated={mockPostCreated} />)

    expect(
      screen.queryByRole("checkbox", { name: /Mark as Opportunity/i })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(/Mark as Opportunity \/ Job Opening/i)
    ).not.toBeInTheDocument()
  })

  it("renders nothing when isOpen is false", () => {
    const mockPostCreated = vi.fn()
    const mockClose = vi.fn()

    render(
      <CreatePost
        isOpen={false}
        onClose={mockClose}
        onPostCreated={mockPostCreated}
      />
    )

    expect(
      screen.queryByPlaceholderText(/Share your ideas/i)
    ).not.toBeInTheDocument()
    expect(screen.queryByText("Create a Post")).not.toBeInTheDocument()
  })

  it("renders modal when isOpen is true with onClose and closes on X button click", () => {
    const mockPostCreated = vi.fn()
    const mockClose = vi.fn()

    render(
      <CreatePost
        isOpen={true}
        onClose={mockClose}
        onPostCreated={mockPostCreated}
      />
    )

    expect(screen.getByText("Create a Post")).toBeInTheDocument()
    const closeBtn = screen.getByRole("button", { name: "Close" })
    expect(closeBtn).toBeInTheDocument()

    fireEvent.click(closeBtn)
    expect(mockClose).toHaveBeenCalledTimes(1)
  })

  it("closes modal when clicking outside on the backdrop", () => {
    const mockPostCreated = vi.fn()
    const mockClose = vi.fn()

    render(
      <CreatePost
        isOpen={true}
        onClose={mockClose}
        onPostCreated={mockPostCreated}
      />
    )

    const dialogBackdrop = screen.getByRole("dialog")
    fireEvent.click(dialogBackdrop)

    expect(mockClose).toHaveBeenCalledTimes(1)
  })

  it("closes modal when pressing Escape key", () => {
    const mockPostCreated = vi.fn()
    const mockClose = vi.fn()

    render(
      <CreatePost
        isOpen={true}
        onClose={mockClose}
        onPostCreated={mockPostCreated}
      />
    )

    fireEvent.keyDown(window, { key: "Escape" })
    expect(mockClose).toHaveBeenCalledTimes(1)
  })

  it("closes modal when clicking Cancel button in footer", () => {
    const mockPostCreated = vi.fn()
    const mockClose = vi.fn()

    render(
      <CreatePost
        isOpen={true}
        onClose={mockClose}
        onPostCreated={mockPostCreated}
      />
    )

    const cancelBtn = screen.getByRole("button", { name: "Cancel" })
    fireEvent.click(cancelBtn)

    expect(mockClose).toHaveBeenCalledTimes(1)
  })

  it("calls onClose automatically after successful post creation", async () => {
    const mockPostCreated = vi.fn()
    const mockClose = vi.fn()
    vi.mocked(createPost).mockResolvedValue({
      id: 101,
      user_id: 1,
      username: "student_user",
      profile_picture: null,
      content: "Hello campus!",
      image_url: null,
      is_opportunity: false,
      likes_count: 0,
      liked_by_current_user: false,
      comments_count: 0,
      created_at: new Date().toISOString(),
      connection_status: "self",
    })

    render(
      <CreatePost
        isOpen={true}
        onClose={mockClose}
        onPostCreated={mockPostCreated}
      />
    )

    const textarea = screen.getByPlaceholderText(/Share your ideas/i)
    fireEvent.change(textarea, { target: { value: "Hello campus!" } })

    fireEvent.click(screen.getByRole("button", { name: "Post" }))

    await waitFor(() => {
      expect(createPost).toHaveBeenCalled()
      expect(mockPostCreated).toHaveBeenCalled()
      expect(mockClose).toHaveBeenCalledTimes(1)
    })
  })
})
