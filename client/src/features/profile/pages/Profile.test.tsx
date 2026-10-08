import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { vi, beforeEach } from "vitest"
import Profile from "./Profile"
import { getMyProfile, getUserProfile } from "../api/profile"
import { getUserPosts } from "../../feed/api/post"
import { alumniRequestsAPI } from "../../admin/api/requests"

vi.mock("../api/profile", () => ({
  getMyProfile: vi.fn(),
  getUserProfile: vi.fn(),
  updateProfile: vi.fn(),
}))

vi.mock("../../feed/api/post", () => ({
  getUserPosts: vi.fn(),
  toggleLike: vi.fn(),
}))

vi.mock("../../admin/api/requests", () => ({
  alumniRequestsAPI: {
    getMyAlumniRequest: vi.fn(),
    requestAlumniRole: vi.fn(),
  },
}))

function tokenFor(userId: number, role = "student") {
  return `header.${window.btoa(JSON.stringify({ user_id: userId, role, college_id: 1 }))}.sig`
}

beforeEach(() => {
  vi.clearAllMocks()
})

test("profile page displays backend identity and connected state", async () => {
  localStorage.setItem("access_token", tokenFor(1, "alumni"))
  vi.mocked(getUserProfile).mockResolvedValue({
    id: 10,
    user_id: 2,
    username: "rahul",
    full_name: "Rahul Sharma",
    profile_picture: null,
    bio: "Connected profile",
    connection_status: "connected",
  })
  vi.mocked(getUserPosts).mockResolvedValue([])

  render(
    <MemoryRouter initialEntries={["/profile/2"]}>
      <Routes>
        <Route path="/profile/:userId" element={<Profile />} />
      </Routes>
    </MemoryRouter>
  )

  expect(await screen.findByText("Rahul Sharma")).toBeInTheDocument()
  expect(screen.getByText("@rahul")).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "Connected" })).toBeInTheDocument()
  expect(screen.queryByText("Academic Status")).not.toBeInTheDocument()
})

test("own profile route renders edit profile instead of connect", async () => {
  localStorage.setItem("access_token", tokenFor(1, "alumni"))
  vi.mocked(getMyProfile).mockResolvedValue({
    id: 11,
    user_id: 1,
    username: "alice",
    full_name: null,
    profile_picture: null,
    bio: null,
    connection_status: "self",
  })
  vi.mocked(getUserPosts).mockResolvedValue([])

  render(
    <MemoryRouter initialEntries={["/profile/1"]}>
      <Routes>
        <Route path="/profile/:userId" element={<Profile />} />
      </Routes>
    </MemoryRouter>
  )

  expect(await screen.findByText("alice")).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "Edit Profile" })).toBeInTheDocument()
  expect(screen.queryByRole("button", { name: "Connect" })).not.toBeInTheDocument()
})

test("student own profile displays Academic Status section and Apply for Alumni Status button", async () => {
  localStorage.setItem("access_token", tokenFor(1, "student"))
  vi.mocked(getMyProfile).mockResolvedValue({
    id: 12,
    user_id: 1,
    username: "student_sam",
    full_name: "Sam Student",
    profile_picture: null,
    bio: "Looking to graduate soon",
    connection_status: "self",
  })
  vi.mocked(getUserPosts).mockResolvedValue([])
  vi.mocked(alumniRequestsAPI.getMyAlumniRequest).mockResolvedValue({
    id: 1,
    user_id: 1,
    username: "student_sam",
    status: "not_requested",
    created_at: new Date().toISOString(),
  })

  render(
    <MemoryRouter initialEntries={["/profile/1"]}>
      <Routes>
        <Route path="/profile/:userId" element={<Profile />} />
      </Routes>
    </MemoryRouter>
  )

  expect(await screen.findByText("Academic Status")).toBeInTheDocument()
  expect(screen.getByText("Student")).toBeInTheDocument()
  const applyBtn = screen.getByRole("button", { name: "Apply for Alumni Status" })
  expect(applyBtn).toBeInTheDocument()

  // Clicking the button opens the modal dialog
  fireEvent.click(applyBtn)
  expect(await screen.findByRole("dialog")).toBeInTheDocument()
})

test("student with pending alumni request shows pending state instead of allowing another request", async () => {
  localStorage.setItem("access_token", tokenFor(1, "student"))
  vi.mocked(getMyProfile).mockResolvedValue({
    id: 12,
    user_id: 1,
    username: "student_sam",
    full_name: "Sam Student",
    profile_picture: null,
    bio: "Graduation request pending",
    connection_status: "self",
  })
  vi.mocked(getUserPosts).mockResolvedValue([])
  vi.mocked(alumniRequestsAPI.getMyAlumniRequest).mockResolvedValue({
    id: 1,
    user_id: 1,
    username: "student_sam",
    status: "pending",
    created_at: new Date().toISOString(),
  })

  render(
    <MemoryRouter initialEntries={["/profile/1"]}>
      <Routes>
        <Route path="/profile/:userId" element={<Profile />} />
      </Routes>
    </MemoryRouter>
  )

  expect(await screen.findByText("Academic Status")).toBeInTheDocument()
  expect(screen.getByText(/Alumni Status Pending Review/i)).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "View Status" })).toBeInTheDocument()
  expect(screen.queryByRole("button", { name: "Apply for Alumni Status" })).not.toBeInTheDocument()
})
