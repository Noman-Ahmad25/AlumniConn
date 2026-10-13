import { API } from "../../../services/api"
import type {
  PlatformOverview,
  AdminCollege,
  DemoRole,
  PaginatedUsersResult,
} from "../types/management"

export const adminManagementAPI = {
  getPlatformOverview: async (): Promise<PlatformOverview> => {
    const response = await API.get("/admin/platform-overview")
    return response.data
  },

  getAdminColleges: async (params?: {
    search?: string
    status?: string
    skip?: number
    limit?: number
  }): Promise<AdminCollege[]> => {
    const response = await API.get("/admin/colleges", { params })
    return response.data
  },

  updateCollegeStatus: async (
    collegeId: number,
    isActive: boolean,
  ): Promise<AdminCollege> => {
    const response = await API.patch(`/admin/colleges/${collegeId}/status`, {
      is_active: isActive,
    })
    return response.data
  },

  deleteCollege: async (collegeId: number): Promise<{ message: string }> => {
    const response = await API.delete(`/admin/colleges/${collegeId}`)
    return response.data
  },

  getPlatformUsers: async (params?: {
    search?: string
    college_id?: number
    role?: string
    is_active?: boolean
    skip?: number
    limit?: number
  }): Promise<PaginatedUsersResult> => {
    const response = await API.get("/admin/users", { params: { limit: 25, ...params } })
    const total = Number(response.headers?.["x-total-count"] ?? response.data.length)
    return {
      users: response.data,
      total,
    }
  },

  getCollegeUsers: async (params?: {
    search?: string
    role?: string
    is_active?: boolean
    skip?: number
    limit?: number
  }): Promise<PaginatedUsersResult> => {
    const response = await API.get("/admin/college-users", {
      params: { limit: 25, ...params },
    })
    const total = Number(response.headers?.["x-total-count"] ?? response.data.length)
    const studentCount = response.headers?.["x-student-count"] ? Number(response.headers["x-student-count"]) : undefined
    const alumniCount = response.headers?.["x-alumni-count"] ? Number(response.headers["x-alumni-count"]) : undefined
    return {
      users: response.data,
      total,
      studentCount,
      alumniCount,
    }
  },

  updateUserStatus: async (
    userId: number,
    isActive: boolean,
  ): Promise<{ message: string; is_active: boolean }> => {
    const response = await API.patch(`/admin/users/${userId}/status`, {
      is_active: isActive,
    })
    return response.data
  },

  updateUserRole: async (
    userId: number,
    role: string,
  ): Promise<{ message: string; role: string }> => {
    const response = await API.patch(`/admin/users/${userId}/role`, { role })
    return response.data
  },

  deleteUser: async (userId: number): Promise<{ message: string }> => {
    const response = await API.delete(`/admin/users/${userId}`)
    return response.data
  },

  demoLogin: async (
    demoRole: DemoRole,
  ): Promise<{
    access_token: string
    token_type: string
    college_slug: string | null
    role: string
  }> => {
    const response = await API.post("/auth/demo-login", {
      demo_role: demoRole,
    })
    return response.data
  },
}
