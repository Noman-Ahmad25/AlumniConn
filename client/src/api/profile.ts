import { API } from "./index";
import type { Profile, ProfileUpdateInput } from "../types/profile";

export const getMyProfile = async (): Promise<Profile> => {
    const response = await API.get('/profile/me');
    return response.data;
}

export const getUserProfile = async (userId: number): Promise<Profile> => {
    const response = await API.get(`/profile/${userId}`);
    return response.data;
}

export const updateProfile = async (data: ProfileUpdateInput): Promise<Profile> => {
    const response = await API.put('/profile/me', data);
    return response.data;
}

export const createProfile = async (data: ProfileUpdateInput): Promise<Profile> => {
    const response = await API.post('/profile/', data);
    return response.data;
}
