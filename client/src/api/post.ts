import { API } from "./index";
import type { Post } from "../types/post";

export const getFeed = async (): Promise<Post[]> => {
    const response = await API.get('/posts/feed');
    return response.data;
}

export const getUserPosts = async (userId: number): Promise<Post[]> => {
    const response = await API.get(`/posts/user/${userId}`);
    return response.data;
}

export const createPost = async ( data: {
    content?: string
    image_url?: string
    is_opportunity: boolean
}): Promise<Post> => {
    const response = await API.post("/posts/", data)
    return response.data
}

export const toggleLike = async (postId: number) => {
    const response = await API.post(`/likes/toggle/${postId}`);
    return response.data;
}
