import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { vi } from "vitest"
import CommentSection from "./CommentSection"
import { createComment, getComments } from "../api/comment"

vi.mock("../api/comment", () => ({
  getComments: vi.fn(),
  createComment: vi.fn(),
}))

test("loads and creates comments with backend-provided identity", async () => {
  vi.mocked(getComments).mockResolvedValue([
    {
      id: 1,
      user_id: 2,
      post_id: 10,
      username: "alice",
      profile_picture: null,
      content: "Existing comment",
      created_at: new Date().toISOString(),
    },
  ])
  vi.mocked(createComment).mockResolvedValue({
    id: 2,
    user_id: 3,
    post_id: 10,
    username: "bob",
    profile_picture: "https://example.com/bob.png",
    content: "New comment",
    created_at: new Date().toISOString(),
  })

  render(<CommentSection postId={10} />)

  expect(await screen.findByText("Existing comment")).toBeInTheDocument()
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: "New comment" },
  })
  fireEvent.click(screen.getByRole("button"))

  expect(await screen.findByText("New comment")).toBeInTheDocument()
  expect(screen.getByText("bob")).toBeInTheDocument()
  expect(document.body).not.toHaveTextContent("You")
  await waitFor(() => expect(createComment).toHaveBeenCalledWith("New comment", 10))
})
