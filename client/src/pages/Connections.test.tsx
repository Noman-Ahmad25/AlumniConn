import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { vi } from "vitest"
import Connections from "./Connections"
import {
  acceptRequest,
  getConnections,
  getDiscoverUsers,
  getRequests,
  rejectRequest,
  sendRequest,
} from "../api/connection"

vi.mock("../api/connection", () => ({
  getDiscoverUsers: vi.fn(),
  getRequests: vi.fn(),
  getConnections: vi.fn(),
  sendRequest: vi.fn(),
  acceptRequest: vi.fn(),
  rejectRequest: vi.fn(),
}))

function renderConnections() {
  return render(
    <MemoryRouter initialEntries={["/connections"]}>
      <Routes>
        <Route path="/connections" element={<Connections />} />
        <Route path="/profile/:userId" element={<div>Profile Target</div>} />
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.mocked(getDiscoverUsers).mockResolvedValue([
    { id: 2, username: "rahul", profile_picture: null, connection_status: "none" },
    { id: 3, username: "sara", profile_picture: null, connection_status: "pending_sent" },
    { id: 4, username: "nina", profile_picture: null, connection_status: "pending_received" },
  ])
  vi.mocked(getRequests).mockResolvedValue([
    { id: 40, status: "pending", user: { id: 4, username: "nina", profile_pic_url: null } },
  ])
  vi.mocked(getConnections).mockResolvedValue([
    { id: 50, status: "accepted", user: { id: 5, username: "omar", profile_pic_url: null } },
  ])
  vi.mocked(sendRequest).mockResolvedValue({
    id: 20,
    status: "pending",
    user: { id: 2, username: "rahul", profile_pic_url: null },
  })
  vi.mocked(acceptRequest).mockResolvedValue({
    id: 40,
    status: "accepted",
    user: { id: 4, username: "nina", profile_pic_url: null },
  })
  vi.mocked(rejectRequest).mockResolvedValue({
    id: 40,
    status: "rejected",
    user: { id: 4, username: "nina", profile_pic_url: null },
  })
})

test("renders discover, pending, and connected states from backend", async () => {
  renderConnections()

  expect(await screen.findByText("rahul")).toBeInTheDocument()
  expect(screen.getByText("Request Sent")).toBeInTheDocument()
  expect(screen.getAllByRole("button", { name: "Accept" }).length).toBeGreaterThan(0)
  expect(screen.getAllByText("Already Connected").length).toBeGreaterThan(0)
})

test("send request updates discover state without full reload", async () => {
  renderConnections()

  fireEvent.click(await screen.findByRole("button", { name: "Connect" }))

  await waitFor(() => expect(screen.getAllByText("Request Sent")).toHaveLength(2))
  expect(sendRequest).toHaveBeenCalledWith(2)
})

test("accept moves user into connections and removes pending request", async () => {
  renderConnections()

  fireEvent.click((await screen.findAllByRole("button", { name: "Accept" }))[0])

  await waitFor(() => expect(acceptRequest).toHaveBeenCalledWith(40))
  expect(screen.getAllByText("Already Connected").length).toBeGreaterThan(1)
})

test("clicking user card navigates to profile without button clicks navigating", async () => {
  renderConnections()

  fireEvent.click(await screen.findByText("rahul"))

  expect(await screen.findByText("Profile Target")).toBeInTheDocument()
})
