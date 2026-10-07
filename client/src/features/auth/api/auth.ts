import { API } from "../../../services/api";
import { notifyAuthChanged } from "../utils/auth";
import type {
    RegisterPayload,
    LoginPayload,
    SuperAdminLoginPayload,
    TokenResponse,
    UserResponse,
    ForgotPasswordPayload,
    ResetPasswordPayload
} from "../types/auth";

export const loginUser = async (data: LoginPayload): Promise<TokenResponse> => {
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

export const verifyEmail = async (
  token: string
): Promise<{ message: string }> => {
  const response = await API.get("/auth/verify-email", {
    params: { token },
  });

  return response.data;
};

export const resendVerification = async (data: { user_id: number }): Promise<{ message: string }> => {
    const response = await API.post('/auth/resend-verification', data);
    return response.data;
}

export const forgotPassword = async (data: ForgotPasswordPayload): Promise<{ message: string }> => {
    const response = await API.post('/auth/forgot-password', data);
    return response.data;
}

export const resetPassword = async (data: ResetPasswordPayload): Promise<{ message: string }> => {
    const response = await API.post('/auth/reset-password', data);
    return response.data;
}

export const logout = () => {
    localStorage.removeItem('access_token');
    notifyAuthChanged();
}

export const getEmailMode = async (): Promise<{ email_mode: string }> => {
    const response = await API.get('/auth/email-mode');
    return response.data;
}

export const getDemoEmails = async (toEmail?: string): Promise<{ emails: any[]; total: number }> => {
    const response = await API.get('/auth/demo-emails', {
        params: toEmail ? { to_email: toEmail } : {},
    });
    return response.data;
}

export const clearDemoEmails = async (): Promise<{ message: string }> => {
    const response = await API.delete('/auth/demo-emails');
    return response.data;
}
