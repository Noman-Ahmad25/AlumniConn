import { API } from "../../../services/api";

export interface CollegeBranding {
    primary_color: string | null;
    accent_color: string | null;
    logo_url: string | null;
    banner_url: string | null;
    welcome_message: string | null;
}

export interface CollegePublicResponse {
    id: number;
    name: string;
    slug: string;
    location?: string | null;
    established_year?: number | null;
    description?: string | null;
    branding?: CollegeBranding | null;
}

export const getCollegeBySlug = async (slug: string): Promise<CollegePublicResponse> => {
    const response = await API.get(`/colleges/slug/${slug}`);
    return response.data;
}
