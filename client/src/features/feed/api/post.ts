import { API } from "../../../services/api";
import type { Post } from "../types/post";

export const getFeed = async (): Promise<Post[]> => {
    const response = await API.get('/posts/feed');
    return response.data;
}

export const getUserPosts = async (userId: number): Promise<Post[]> => {
    const response = await API.get(`/posts/user/${userId}`);
    return response.data;
}

// UPDATED: Now accepts a File object and uses FormData
export const createPost = async (data: {
    content?: string;
    is_opportunity: boolean;
    image_file?: File | null; // Added file support
}): Promise<Post> => {
    const formData = new FormData();

    if (data.content) {
        formData.append("content", data.content);
    }
    
    formData.append("is_opportunity", String(data.is_opportunity));

    if (data.image_file) {
        formData.append("file", data.image_file); // Must match the backend key 'file'
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
