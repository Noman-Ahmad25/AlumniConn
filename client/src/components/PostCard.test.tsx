import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { vi } from "vitest"
import PostCard from "./PostCard"
import { toggleLike } from "../api/post"
import type { Post } from "../types/post"

vi.mock("../api/post", () => ({
  toggleLike: vi.fn(),
}))

vi.mock("./CommentSection", () => ({
  default: ({ postId }: { postId: number }) => <div>Comments for {postId}</div>,
}))

const basePost: Post = {
  id: 1,
  user_id: 10,
  username: "alice",
  profile_picture: null,
  content: "Hello from tests",
  image_url: null,
  is_opportunity: false,
  likes_count: 0,
  liked_by_current_user: false,
  comments_count: 0,
  created_at: new Date().toISOString(),
  connection_status: "none",
}

function renderPostCard(post: Post) {
  return render(
    <MemoryRouter>
      <PostCard post={post} />
    </MemoryRouter>
  )
}

test("renders post identity safely without Unknown fallback", () => {
  renderPostCard({ ...basePost, username: "Alice Example" })

  expect(screen.getByText("Alice Example")).toBeInTheDocument()
  expect(screen.getByText("AE")).toBeInTheDocument()
  expect(document.body).not.toHaveTextContent("Unknown")
})

test("like button updates optimistically", async () => {
  vi.mocked(toggleLike).mockResolvedValue({ liked: true, post_id: 1 })
  renderPostCard(basePost)

  fireEvent.click(screen.getByRole("button", { name: "Like" }))

  expect(await screen.findByText("Liked")).toBeInTheDocument()
  expect(screen.getByText(/1 likes/)).toBeInTheDocument()
  await waitFor(() => expect(toggleLike).toHaveBeenCalledWith(1))
})

test("does not show connect button for current user's own post", () => {
  renderPostCard({ ...basePost, connection_status: "self" })

  expect(screen.queryByRole("button", { name: "Connect" })).not.toBeInTheDocument()
})
