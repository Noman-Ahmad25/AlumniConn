import { render } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import {
  Skeleton,
  PostCardSkeleton,
  RecommendationCardSkeleton,
  UserCardSkeleton,
  NotificationSkeleton,
  ProfileSkeleton,
  InboxListSkeleton,
  ChatMessagesSkeleton,
  TableSkeleton,
  StatCardsSkeleton,
  PageFallbackSkeleton,
} from "../shared/components/skeletons"

describe("Skeleton Loading Components", () => {
  it("renders basic Skeleton primitive with animate-pulse and aria-hidden", () => {
    const { container } = render(<Skeleton className="h-4 w-32" />)
    const element = container.querySelector(".animate-pulse")
    expect(element).toBeInTheDocument()
    expect(element).toHaveAttribute("aria-hidden", "true")
    expect(element?.className).toContain("h-4")
    expect(element?.className).toContain("w-32")
  })

  it("renders PostCardSkeleton with avatar, text lines and stats placeholders", () => {
    const { container } = render(<PostCardSkeleton />)
    const pulses = container.querySelectorAll(".animate-pulse")
    expect(pulses.length).toBeGreaterThanOrEqual(6)
  })

  it("renders RecommendationCardSkeleton with avatar, badge, tags, and actions", () => {
    const { container } = render(<RecommendationCardSkeleton />)
    const pulses = container.querySelectorAll(".animate-pulse")
    expect(pulses.length).toBeGreaterThanOrEqual(8)
  })

  it("renders UserCardSkeleton in both normal and compact modes", () => {
    const { container: normalContainer } = render(<UserCardSkeleton />)
    expect(normalContainer.querySelectorAll(".animate-pulse").length).toBeGreaterThanOrEqual(4)

    const { container: compactContainer } = render(<UserCardSkeleton compact />)
    expect(compactContainer.querySelectorAll(".animate-pulse").length).toBeGreaterThanOrEqual(3)
  })

  it("renders NotificationSkeleton with icon and text placeholders", () => {
    const { container } = render(<NotificationSkeleton />)
    const pulses = container.querySelectorAll(".animate-pulse")
    expect(pulses.length).toBeGreaterThanOrEqual(3)
  })

  it("renders ProfileSkeleton with header banner, avatar, details, and posts", () => {
    const { container } = render(<ProfileSkeleton />)
    const pulses = container.querySelectorAll(".animate-pulse")
    expect(pulses.length).toBeGreaterThanOrEqual(10)
  })

  it("renders Conversation skeletons (InboxListSkeleton and ChatMessagesSkeleton)", () => {
    const { container: inboxContainer } = render(<InboxListSkeleton count={3} />)
    expect(inboxContainer.querySelectorAll(".animate-pulse").length).toBeGreaterThanOrEqual(9)

    const { container: chatContainer } = render(<ChatMessagesSkeleton count={4} />)
    expect(chatContainer.querySelectorAll(".animate-pulse").length).toBeGreaterThanOrEqual(8)
  })

  it("renders TableSkeleton and StatCardsSkeleton with customizable rows and columns", () => {
    const { container: tableContainer } = render(<TableSkeleton columns={4} rows={3} />)
    // 4 header + 4 * 3 body = 16 skeleton cells
    expect(tableContainer.querySelectorAll(".animate-pulse").length).toBe(16)

    const { container: statsContainer } = render(<StatCardsSkeleton count={5} />)
    expect(statsContainer.querySelectorAll(".animate-pulse").length).toBe(15)
  })

  it("renders PageFallbackSkeleton for route transitions", () => {
    const { container } = render(<PageFallbackSkeleton />)
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThanOrEqual(6)
  })
})
