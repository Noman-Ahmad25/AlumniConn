import { API } from "../../../services/api";
import type { Post } from "../types/post";

export interface FeedParams {
    skip?: number;
    limit?: number;
    is_opportunity?: boolean;
}

export const getFeed = async (params?: FeedParams): Promise<Post[]> => {
    const response = await API.get('/posts/feed', { params });
    return response.data;
}

export const getUserPosts = async (userId: number, params?: { skip?: number; limit?: number }): Promise<Post[]> => {
    const response = await API.get(`/posts/user/${userId}`, { params });
    return response.data;
}

export const getMyPosts = async (params?: { skip?: number; limit?: number }): Promise<Post[]> => {
    const response = await API.get('/posts/me', { params });
    return response.data;
}

export const createPost = async (data: {
    content?: string;
    is_opportunity: boolean;
    image_file?: File | null;
}): Promise<Post> => {
    const formData = new FormData();

    if (data.content) {
        formData.append("content", data.content.trim());
    }
    
    formData.append("is_opportunity", String(data.is_opportunity));

    if (data.image_file) {
        formData.append("file", data.image_file);
    }

    const response = await API.post("/posts/", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
}

export const toggleLike = async (postId: number) => {
    const response = await API.post(`/likes/toggle/${postId}`);
    return response.data;
}

export const deletePost = async (postId: number) => {
    const response = await API.delete(`/posts/${postId}`);
    return response.data;
}
