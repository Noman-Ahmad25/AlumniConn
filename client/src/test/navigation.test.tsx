import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom"
import { vi, describe, test, expect, beforeEach } from "vitest"
import Discover from "../features/connections/pages/Discover"
import Feed from "../features/feed/pages/Feed"
import Recommendations from "../features/recommendations/pages/Recommendations"
import Notifications from "../features/notifications/pages/Notifications"
import Profile from "../features/profile/pages/Profile"
import Connections from "../features/connections/pages/Connections"
import { TenantProvider } from "../providers/TenantProvider"
import Topbar from "../layouts/AppShell/Topbar"
import Footer from "../layouts/AppShell/Footer"
import * as connectionApi from "../features/connections/api/connection"
import * as postApi from "../features/feed/api/post"
import * as recommendationApi from "../features/recommendations/api/recommendation"
import * as notificationApi from "../features/notifications/api/notification"
import * as profileApi from "../features/profile/api/profile"

vi.mock("../features/connections/api/connection", () => ({
  getDiscoverUsers: vi.fn(),
  getRequests: vi.fn(),
  getConnections: vi.fn(),
  sendRequest: vi.fn(),
  acceptRequest: vi.fn(),
  rejectRequest: vi.fn(),
  withdrawRequest: vi.fn(),
  disconnect: vi.fn(),
}))

vi.mock("../features/feed/api/post", () => ({
  getFeed: vi.fn(),
  getUserPosts: vi.fn(),
  getMyPosts: vi.fn(),
  createPost: vi.fn(),
  toggleLike: vi.fn(),
  deletePost: vi.fn(),
}))

vi.mock("../features/recommendations/api/recommendation", () => ({
  getRecommendations: vi.fn(),
}))

vi.mock("../features/notifications/api/notification", () => ({
  getNotifications: vi.fn(),
  getUnreadNotificationCount: vi.fn(),
  markNotificationAsRead: vi.fn(),
  markAllNotificationsAsRead: vi.fn(),
  deleteNotification: vi.fn(),
}))

vi.mock("../features/profile/api/profile", () => ({
  getMyProfile: vi.fn(),
  getUserProfile: vi.fn(),
  updateProfile: vi.fn(),
  createProfile: vi.fn(),
}))

const mockTenant = {
  id: 1,
  name: "NITK Surathkal",
  slug: "nitk",
  domain: "nitk.edu.in",
  created_at: "2026-01-01T00:00:00Z",
}

function tokenFor(userId: number, role = "alumni") {
  return `header.${window.btoa(JSON.stringify({ user_id: userId, role, college_id: 1 }))}.sig`
}

function LocationTracker() {
  const location = useLocation()
  return <div data-testid="location-display">{location.pathname}</div>
}

describe("College-Scoped Navigation & Integration Regression Suite", () => {
  beforeEach(() => {
    localStorage.setItem("access_token", tokenFor(1, "alumni"))
    vi.clearAllMocks()
    vi.mocked(notificationApi.getUnreadNotificationCount).mockResolvedValue({ unread_count: 0 })
  })

  // ── Test A: College Discover → Profile ──
  test("Test A: clicking user on /c/nitk/discover navigates to /c/nitk/profile/:userId", async () => {
    vi.mocked(connectionApi.getDiscoverUsers).mockResolvedValue([
      {
        id: 42,
        username: "vikram_rao",
        full_name: "Vikramaditya Rao",
        job_title: "Cloud Architect",
        company: "Google",
        location: "Bengaluru",
        profile_picture: null,
        connection_status: "none",
      },
    ])

    render(
      <MemoryRouter initialEntries={["/c/nitk/discover"]}>
        <TenantProvider tenant={mockTenant}>
          <LocationTracker />
          <Routes>
            <Route path="/c/:collegeSlug/discover" element={<Discover />} />
            <Route path="/c/:collegeSlug/profile/:userId" element={<div>Target Profile Page</div>} />
            <Route path="/" element={<div>Global Root Page</div>} />
          </Routes>
        </TenantProvider>
      </MemoryRouter>
    )

    expect(await screen.findByText("Vikramaditya Rao")).toBeInTheDocument()
    fireEvent.click(screen.getByText("Vikramaditya Rao"))

    await waitFor(() => {
      expect(screen.getByTestId("location-display").textContent).toBe("/c/nitk/profile/42")
    })
    expect(screen.getByText("Target Profile Page")).toBeInTheDocument()
    expect(screen.queryByText("Global Root Page")).not.toBeInTheDocument()
  })

  // ── Test B: College Feed → Profile ──
  test("Test B: clicking post author on /c/nitk/feed navigates to /c/nitk/profile/:userId", async () => {
    vi.mocked(postApi.getFeed).mockResolvedValue([
      {
        id: 101,
        user_id: 55,
        username: "arvind_swami",
        profile_picture: null,
        content: "Excited to share our new backend microservice!",
        image_url: null,
        is_opportunity: false,
        created_at: "2026-10-01T10:00:00Z",
        likes_count: 5,
        comments_count: 2,
        liked_by_current_user: false,
        connection_status: "none",
      },
    ])

    render(
      <MemoryRouter initialEntries={["/c/nitk/feed"]}>
        <TenantProvider tenant={mockTenant}>
          <LocationTracker />
          <Routes>
            <Route path="/c/:collegeSlug/feed" element={<Feed />} />
            <Route path="/c/:collegeSlug/profile/:userId" element={<div>Target Profile Page</div>} />
            <Route path="/" element={<div>Global Root Page</div>} />
          </Routes>
        </TenantProvider>
      </MemoryRouter>
    )

    expect(await screen.findByText("arvind_swami")).toBeInTheDocument()
    fireEvent.click(screen.getByText("arvind_swami"))

    await waitFor(() => {
      expect(screen.getByTestId("location-display").textContent).toBe("/c/nitk/profile/55")
    })
    expect(screen.getByText("Target Profile Page")).toBeInTheDocument()
    expect(screen.queryByText("Global Root Page")).not.toBeInTheDocument()
  })

  // ── Test C: College Recommendations → Profile ──
  test("Test C: clicking recommended candidate on /c/nitk/recommendations navigates to /c/nitk/profile/:userId", async () => {
    vi.mocked(recommendationApi.getRecommendations).mockResolvedValue({
      items: [
        {
          id: 301,
          user_id: 77,
          username: "priya_nair",
          full_name: "Priya Nair",
          job_title: "Senior ML Engineer",
          company: "Microsoft",
          location: "Hyderabad",
          skills: ["Python", "PyTorch", "Transformers"],
          interests: ["AI", "Open Source"],
          grad_year: 2021,
          major: "Computer Science",
          match_score: 0.88,
          explanation: "Both studied Computer Science and share skills in Python",
          connection_status: "none",
        },
      ],
      next_cursor: null,
    })

    render(
      <MemoryRouter initialEntries={["/c/nitk/recommendations"]}>
        <TenantProvider tenant={mockTenant}>
          <LocationTracker />
          <Routes>
            <Route path="/c/:collegeSlug/recommendations" element={<Recommendations />} />
            <Route path="/c/:collegeSlug/profile/:userId" element={<div>Target Profile Page</div>} />
            <Route path="/" element={<div>Global Root Page</div>} />
          </Routes>
        </TenantProvider>
      </MemoryRouter>
    )

    expect(await screen.findByText("Priya Nair")).toBeInTheDocument()
    expect(screen.getByText("88% Match")).toBeInTheDocument()
    expect(screen.getByText("Both studied Computer Science and share skills in Python")).toBeInTheDocument()

    fireEvent.click(screen.getByText("Priya Nair"))

    await waitFor(() => {
      expect(screen.getByTestId("location-display").textContent).toBe("/c/nitk/profile/77")
    })
    expect(screen.getByText("Target Profile Page")).toBeInTheDocument()
    expect(screen.queryByText("Global Root Page")).not.toBeInTheDocument()
  })

  // ── Test D: College Notifications → Target ──
  test("Test D: clicking connection notification on /c/nitk/notifications navigates to /c/nitk/connections", async () => {
    vi.mocked(notificationApi.getNotifications).mockResolvedValue({
      items: [
        {
          id: 501,
          notification_type: "CONNECTION_RECEIVED",
          title: "New Connection Request",
          message: "Kavita sent you a connection request.",
          is_read: false,
          created_at: "2026-10-05T12:00:00Z",
          metadata_: { connection_id: 25 },
        },
      ],
      next_cursor: null,
    })
    vi.mocked(notificationApi.markNotificationAsRead).mockResolvedValue({ message: "ok" })

    render(
      <MemoryRouter initialEntries={["/c/nitk/notifications"]}>
        <TenantProvider tenant={mockTenant}>
          <LocationTracker />
          <Routes>
            <Route path="/c/:collegeSlug/notifications" element={<Notifications />} />
            <Route path="/c/:collegeSlug/connections" element={<div>College Connections Page</div>} />
            <Route path="/" element={<div>Global Root Page</div>} />
          </Routes>
        </TenantProvider>
      </MemoryRouter>
    )

    expect(await screen.findByText("New Connection Request")).toBeInTheDocument()
    fireEvent.click(screen.getByText("New Connection Request"))

    await waitFor(() => {
      expect(screen.getByTestId("location-display").textContent).toBe("/c/nitk/connections")
    })
    expect(screen.getByText("College Connections Page")).toBeInTheDocument()
    expect(screen.queryByText("Global Root Page")).not.toBeInTheDocument()
  })

  // ── Test E: Connections page user click does NOT escape to / ──
  test("Test E: clicking user in Connections page navigates to /c/nitk/profile/:userId and NOT /", async () => {
    vi.mocked(connectionApi.getDiscoverUsers).mockResolvedValue([
      { id: 99, username: "sneha_k", profile_picture: null, connection_status: "none" },
    ])
    vi.mocked(connectionApi.getRequests).mockResolvedValue([])
    vi.mocked(connectionApi.getConnections).mockResolvedValue([])

    render(
      <MemoryRouter initialEntries={["/c/nitk/connections"]}>
        <TenantProvider tenant={mockTenant}>
          <LocationTracker />
          <Routes>
            <Route path="/c/:collegeSlug/connections" element={<Connections />} />
            <Route path="/c/:collegeSlug/profile/:userId" element={<div>Scoped Profile Page</div>} />
            <Route path="/" element={<div>Global Root Page</div>} />
          </Routes>
        </TenantProvider>
      </MemoryRouter>
    )

    expect(await screen.findByText("sneha_k")).toBeInTheDocument()
    fireEvent.click(screen.getByText("sneha_k"))

    await waitFor(() => {
      expect(screen.getByTestId("location-display").textContent).toBe("/c/nitk/profile/99")
    })
    expect(screen.getByText("Scoped Profile Page")).toBeInTheDocument()
    expect(screen.queryByText("Global Root Page")).not.toBeInTheDocument()
  })

  // ── Test F: Profile Page loads selected user A data vs authenticated user ──
  test("Test F: visiting /c/nitk/profile/88 loads target user 88 data instead of authenticated user 1", async () => {
    vi.mocked(profileApi.getUserProfile).mockResolvedValue({
      id: 880,
      user_id: 88,
      username: "ananya_singh",
      full_name: "Ananya Singh",
      profile_picture: null,
      bio: "Product Manager @ Flipkart",
      company: "Flipkart",
      job_title: "Lead PM",
      location: "Bengaluru",
      connection_status: "none",
    })
    vi.mocked(postApi.getUserPosts).mockResolvedValue([])

    render(
      <MemoryRouter initialEntries={["/c/nitk/profile/88"]}>
        <TenantProvider tenant={mockTenant}>
          <LocationTracker />
          <Routes>
            <Route path="/c/:collegeSlug/profile/:userId" element={<Profile />} />
          </Routes>
        </TenantProvider>
      </MemoryRouter>
    )

    expect(await screen.findByText("Ananya Singh")).toBeInTheDocument()
    expect(screen.getByText("@ananya_singh")).toBeInTheDocument()
    expect(screen.getByText("Product Manager @ Flipkart")).toBeInTheDocument()
    expect(profileApi.getUserProfile).toHaveBeenCalledWith(88)
    expect(profileApi.getMyProfile).not.toHaveBeenCalled()
  })

  // ── Test G: Responsive Mobile Navigation Expand / Collapse & Link Click ──
  test("Test G: mobile navigation menu expands, shows active state, and navigates on link click", async () => {
    render(
      <MemoryRouter initialEntries={["/c/nitk/feed"]}>
        <TenantProvider tenant={mockTenant}>
          <LocationTracker />
          <Topbar />
          <Routes>
            <Route path="/c/:collegeSlug/feed" element={<div>Feed Content</div>} />
            <Route path="/c/:collegeSlug/discover" element={<div>Discover Content</div>} />
          </Routes>
        </TenantProvider>
      </MemoryRouter>
    )

    // Initially dropdown should be collapsed
    expect(screen.queryByTestId("mobile-nav-dropdown")).not.toBeInTheDocument()

    // Find the toggle button
    const menuToggle = screen.getByRole("button", { name: /Open navigation menu/i })
    expect(menuToggle).toBeInTheDocument()
    expect(menuToggle).toHaveAttribute("aria-expanded", "false")

    // Click to open menu
    fireEvent.click(menuToggle)

    expect(screen.getByTestId("mobile-nav-dropdown")).toBeInTheDocument()
    expect(menuToggle).toHaveAttribute("aria-expanded", "true")

    // The dropdown contains links
    const mobileDropdown = screen.getByTestId("mobile-nav-dropdown")
    expect(mobileDropdown).toHaveTextContent("Feed")
    expect(mobileDropdown).toHaveTextContent("Discover")
    expect(mobileDropdown).toHaveTextContent("Recommendations")
    expect(mobileDropdown).toHaveTextContent("Connections")
    expect(mobileDropdown).toHaveTextContent("Messages")
    expect(mobileDropdown).toHaveTextContent("Profile")
    // Regular alumni should not see Alumni Requests
    expect(mobileDropdown).not.toHaveTextContent("Alumni Requests")

    // Click Discover link inside mobile dropdown
    const discoverLink = mobileDropdown.querySelector('a[href="/c/nitk/discover"]')
    expect(discoverLink).toBeInTheDocument()
    fireEvent.click(discoverLink!)

    await waitFor(() => {
      expect(screen.getByTestId("location-display").textContent).toBe("/c/nitk/discover")
    })
    // Dropdown auto-closes on route transition/click
    expect(screen.queryByTestId("mobile-nav-dropdown")).not.toBeInTheDocument()
  })

  // ── Test H: Admin Mobile Navigation includes Alumni Requests ──
  test("Test H: admin role renders Alumni Requests in mobile navigation menu", async () => {
    localStorage.setItem("access_token", tokenFor(1, "admin"))

    render(
      <MemoryRouter initialEntries={["/c/nitk/feed"]}>
        <TenantProvider tenant={mockTenant}>
          <Topbar />
          <Routes>
            <Route path="/c/:collegeSlug/feed" element={<div>Feed Content</div>} />
          </Routes>
        </TenantProvider>
      </MemoryRouter>
    )

    const menuToggle = await screen.findByRole("button", { name: /Open navigation menu/i })
    fireEvent.click(menuToggle)

    await waitFor(() => {
      const mobileDropdown = screen.getByTestId("mobile-nav-dropdown")
      expect(mobileDropdown).toHaveTextContent("Alumni Requests")
    })
  })

  // ── Test I: Layout Footer contains secondary/informational links ──
  test("Test I: footer presents secondary informational links without cluttering top navigation", async () => {
    render(
      <MemoryRouter initialEntries={["/c/nitk/feed"]}>
        <TenantProvider tenant={mockTenant}>
          <div className="flex min-h-screen flex-col">
            <Topbar />
            <main className="flex-1">Feed Content</main>
            <Footer />
          </div>
        </TenantProvider>
      </MemoryRouter>
    )

    await waitFor(() => {
      // Footer is rendered
      expect(screen.getAllByText(/NITK Surathkal/i).length).toBeGreaterThan(0)
      expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument()
      expect(screen.getByText("Privacy Policy")).toBeInTheDocument()
      expect(screen.getByText("Terms of Service")).toBeInTheDocument()
      expect(screen.getByText("Contact Support")).toBeInTheDocument()
      expect(screen.getByText("About")).toBeInTheDocument()
      expect(screen.getByText("Powered by")).toBeInTheDocument()

      // Primary application navigation remains strictly in Topbar
      expect(screen.getByRole("navigation")).toBeInTheDocument()
    })
  })
})



