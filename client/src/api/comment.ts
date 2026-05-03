import { API } from "./index"

export interface CommentResponse {
    id: number
    user_id: number
    post_id: number
    username: string
    profile_picture?: string | null
    content: string
    created_at: string
}

export const getComments = async (postId: number): Promise<CommentResponse[]> => {
    const response = await API.get(`/comments/${postId}`)
    return response.data
}

export const createComment = async (content: string, postId: number): Promise<CommentResponse> => {
    const response = await API.post("/comments/", {
        post_id: postId,
        content
    })
    return response.data
}
