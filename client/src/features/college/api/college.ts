import { API } from "../../../services/api";

export interface CollegeTestimonial {
    quote: string;
    author: string;
    role?: string | null;
    avatar_url?: string | null;
}

export interface CollegeBranding {
    logo_url?: string | null;
    banner_url?: string | null;
    favicon_url?: string | null;
    primary_color?: string | null;
    secondary_color?: string | null;
    accent_color?: string | null;
    background_color?: string | null;
    typography_preset?: string | null;
    homepage_layout?: string | null;
    welcome_message?: string | null;
    motto?: string | null;
    social_links?: Record<string, any> | null;
    testimonials?: CollegeTestimonial[] | null;
    quick_links?: Record<string, any> | null;
}

export interface CollegeStats {
    alumni_count: number;
    student_count: number;
    connection_count: number;
    majors_count: number;
    posts_count: number;
}

export interface CollegePublicResponse {
    id: number;
    name: string;
    slug: string;
    location?: string | null;
    established_year?: number | null;
    description?: string | null;
    branding?: CollegeBranding | null;
    stats?: CollegeStats | null;
}

export interface CollegeUpdateRequest {
    name?: string;
    location?: string;
    established_year?: number;
    description?: string;
    branding?: Partial<CollegeBranding>;
}

export interface CollegeResponse {
    id: number;
    name: string;
    slug: string | null;
    location?: string | null;
    established_year?: number | null;
    domain: string;
    description?: string | null;
    is_approved: boolean;
    branding?: CollegeBranding | null;
}

export const getColleges = async (skip: number = 0, limit: number = 100): Promise<CollegeResponse[]> => {
    const response = await API.get("/colleges/", { params: { skip, limit } });
    return response.data;
};

export const getCollegeBySlug = async (slug: string): Promise<CollegePublicResponse> => {
    const response = await API.get(`/colleges/slug/${slug}`);
    return response.data;
};

export const updateCollege = async (collegeId: number, data: CollegeUpdateRequest) => {
    const response = await API.patch(`/colleges/${collegeId}`, data);
    return response.data;
};

