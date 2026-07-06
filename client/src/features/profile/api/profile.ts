import { API } from "../../../services/api";
import type { Profile, ProfileUpdateInput } from "../types/profile";

export const getMyProfile = async (): Promise<Profile> => {
    const response = await API.get('/profile/me');
    return response.data;
}

export const getUserProfile = async (userId: number): Promise<Profile> => {
    const response = await API.get(`/profile/${userId}`);
    return response.data;
}

// UPDATED: Now handles file uploads via FormData
export const updateProfile = async (data: ProfileUpdateInput & { image_file?: File | null }): Promise<Profile> => {
    const formData = new FormData();

    // Append all text fields from the input
    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== 'image_file') {
            formData.append(key, value as string);
        }
    });

    // Append the file if it exists
    if (data.image_file) {
        formData.append("file", data.image_file); // Matches the backend key 'file'
    }

    const response = await API.put('/profile/me', formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
}

export const createProfile = async (data: ProfileUpdateInput & { image_file?: File | null }): Promise<Profile> => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== 'image_file') {
            formData.append(key, value as string);
        }
    });

    if (data.image_file) {
        formData.append("file", data.image_file);
    }

    const response = await API.post('/profile/', formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
}
