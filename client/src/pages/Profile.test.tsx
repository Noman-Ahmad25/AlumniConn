import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { vi } from "vitest"
import Profile from "./Profile"
import { getMyProfile, getUserProfile } from "../api/profile"
import { getUserPosts } from "../api/post"

vi.mock("../api/profile", () => ({
  getMyProfile: vi.fn(),
  getUserProfile: vi.fn(),
  updateProfile: vi.fn(),
}))

vi.mock("../api/post", () => ({
  getUserPosts: vi.fn(),
  toggleLike: vi.fn(),
}))

function tokenFor(userId: number) {
  return `header.${window.btoa(JSON.stringify({ user_id: userId }))}.sig`
}

test("profile page displays backend identity and connected state", async () => {
  localStorage.setItem("access_token", tokenFor(1))
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
})

test("own profile route renders edit profile instead of connect", async () => {
  localStorage.setItem("access_token", tokenFor(1))
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
