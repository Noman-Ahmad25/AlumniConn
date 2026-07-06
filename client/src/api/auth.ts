import { API } from "../services/api";
import { notifyAuthChanged } from "../utils/auth";
import type {
    RegisterPayload,
    SuperAdminLoginPayload,
    TokenResponse,
    UserResponse,
} from "../types/auth";

export const loginUser = async (data: { email: string; password: string, college_id: number  }): Promise<TokenResponse> => {
    const response = await API.post('/auth/login', data);
    return response.data;
}

export const loginSuperAdmin = async (data: SuperAdminLoginPayload): Promise<TokenResponse> => {
    const response = await API.post('/auth/super-admin/login', data);
    return response.data;
}

export const registerUser = async (data: RegisterPayload): Promise<UserResponse> => {
    const response = await API.post('/auth/register', data);
    return response.data;
}

export const verifyActivationToken = async (token: string): Promise<{ valid: boolean; detail: string }> => {
    const response = await API.get('/auth/activate/verify', { params: { token } });
    return response.data;
}

export const activateAccount = async (data: { token: string; password: string }): Promise<UserResponse> => {
    const response = await API.post('/auth/activate', data);
    return response.data;
}

export const logout = () => {
    localStorage.removeItem('access_token');
    notifyAuthChanged();
}
