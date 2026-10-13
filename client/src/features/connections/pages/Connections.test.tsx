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
  disconnect,
} from "../api/connection"

vi.mock("../api/connection", () => ({
  getDiscoverUsers: vi.fn(),
  getRequests: vi.fn(),
  getConnections: vi.fn(),
  sendRequest: vi.fn(),
  acceptRequest: vi.fn(),
  rejectRequest: vi.fn(),
  disconnect: vi.fn(),
}))

function renderConnections(initialPath = "/connections") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
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
  vi.mocked(disconnect).mockResolvedValue({
    detail: "Disconnected",
    connection_id: 50,
  })
})

test("renders discover, pending, and connected states from backend", async () => {
  renderConnections()

  expect(await screen.findByText("rahul")).toBeInTheDocument()
  expect(screen.getByText("Request Sent")).toBeInTheDocument()
  expect(screen.getAllByRole("button", { name: "Accept" }).length).toBeGreaterThan(0)
  expect(screen.getAllByText("Connected").length).toBeGreaterThan(0)
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
  expect(screen.getAllByText("Connected").length).toBeGreaterThan(1)
})

test("clicking user card navigates to profile without button clicks navigating", async () => {
  renderConnections()

  fireEvent.click(await screen.findByText("rahul"))

  expect(await screen.findByText("Profile Target")).toBeInTheDocument()
})

test("displays three columns with headings and count badges", async () => {
  renderConnections()

  expect(await screen.findByRole("heading", { name: "Discover People" })).toBeInTheDocument()
  expect(screen.getByRole("heading", { name: "Pending Requests" })).toBeInTheDocument()
  expect(screen.getByRole("heading", { name: "My Network" })).toBeInTheDocument()

  // All 3 sections are in the document
  expect(screen.getByTestId("section-discover")).toBeInTheDocument()
  expect(screen.getByTestId("section-requests")).toBeInTheDocument()
  expect(screen.getByTestId("section-network")).toBeInTheDocument()
})

test("mobile segmented selector switches visible section and preserves counts", async () => {
  renderConnections()

  await screen.findByText("rahul")

  const tabs = screen.getAllByRole("tab")
  expect(tabs).toHaveLength(3)

  const discoverTab = tabs[0]
  const requestsTab = tabs[1]
  const networkTab = tabs[2]

  expect(discoverTab).toHaveTextContent("Discover")
  expect(discoverTab).toHaveAttribute("aria-selected", "true")
  expect(requestsTab).toHaveTextContent("Requests")
  expect(networkTab).toHaveTextContent("My Network")

  // Click Requests tab
  fireEvent.click(requestsTab)
  expect(requestsTab).toHaveAttribute("aria-selected", "true")
  expect(discoverTab).toHaveAttribute("aria-selected", "false")

  // Requests section is now active
  const requestsSection = screen.getByTestId("section-requests")
  expect(requestsSection.className).toContain("flex")
  const discoverSection = screen.getByTestId("section-discover")
  expect(discoverSection.className).toContain("hidden")

  // Click Network tab
  fireEvent.click(networkTab)
  expect(networkTab).toHaveAttribute("aria-selected", "true")
  const networkSection = screen.getByTestId("section-network")
  expect(networkSection.className).toContain("flex")
})

test("action maintains selected tab without resetting to default", async () => {
  renderConnections("/connections?tab=requests")

  await screen.findByText("Pending Requests")

  const requestsTab = screen.getAllByRole("tab")[1]
  expect(requestsTab).toHaveAttribute("aria-selected", "true")

  // Accept request while on requests tab
  const acceptButton = (await screen.findAllByRole("button", { name: "Accept" }))[0]
  fireEvent.click(acceptButton)

  await waitFor(() => expect(acceptRequest).toHaveBeenCalledWith(40))

  // User remains on requests tab
  expect(requestsTab).toHaveAttribute("aria-selected", "true")
  expect(screen.getByTestId("section-requests").className).toContain("flex")
})

test("disconnecting from My Network remains on network tab and updates list", async () => {
  renderConnections("/connections?tab=network")

  await screen.findByText("My Network")

  const networkTab = screen.getAllByRole("tab")[2]
  expect(networkTab).toHaveAttribute("aria-selected", "true")

  const disconnectBtn = screen.getByRole("button", { name: "Disconnect" })
  fireEvent.click(disconnectBtn)

  await waitFor(() => expect(disconnect).toHaveBeenCalledWith(50))
  // Disconnected connection removed
  await waitFor(() => expect(screen.queryByText("omar")).not.toBeInTheDocument())
  expect(networkTab).toHaveAttribute("aria-selected", "true")
})

