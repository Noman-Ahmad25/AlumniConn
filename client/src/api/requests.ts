import { API } from "../services/api"
import type {
  AlumniRequest,
  CollegeRequest,
  CollegeRequestCreate,
  RequestStatus,
} from "../types/request"

function buildRequestParams(status?: RequestStatus, skip: number = 0, limit: number = 100) {
  return {
    ...(status ? { status_filter: status } : {}),
    skip,
    limit,
  }
}

export const collegeRequestsAPI = {
  requestCollege: async (collegeData: CollegeRequestCreate): Promise<CollegeRequest> => {
    const response = await API.post("/college-requests/", collegeData)
    return response.data
  },

  getCollegeRequests: async (
    status?: RequestStatus,
    skip: number = 0,
    limit: number = 100,
  ): Promise<CollegeRequest[]> => {
    const response = await API.get("/college-requests/", {
      params: buildRequestParams(status, skip, limit),
    })
    return response.data
  },

  getCollegeRequest: async (requestId: number): Promise<CollegeRequest> => {
    const response = await API.get(`/college-requests/${requestId}`)
    return response.data
  },

  approveCollegeRequest: async (requestId: number): Promise<CollegeRequest> => {
    const response = await API.post(`/college-requests/${requestId}/approve`)
    return response.data
  },

  rejectCollegeRequest: async (requestId: number, reason?: string): Promise<CollegeRequest> => {
    const payload = reason ? { reason } : undefined
    const response = await API.post(`/college-requests/${requestId}/reject`, payload)
    return response.data
  },
}

export const alumniRequestsAPI = {
  requestAlumniRole: async (): Promise<AlumniRequest> => {
    const response = await API.post("/alumni-requests/", {})
    return response.data
  },

  getAlumniRequests: async (
    status?: RequestStatus,
    skip: number = 0,
    limit: number = 100,
  ): Promise<AlumniRequest[]> => {
    const response = await API.get("/alumni-requests/", {
      params: buildRequestParams(status, skip, limit),
    })
    return response.data
  },

  getAlumniRequest: async (requestId: number): Promise<AlumniRequest> => {
    const response = await API.get(`/alumni-requests/${requestId}`)
    return response.data
  },

  approveAlumniRequest: async (requestId: number): Promise<AlumniRequest> => {
    const response = await API.post(`/alumni-requests/${requestId}/approve`)
    return response.data
  },

  rejectAlumniRequest: async (requestId: number, reason?: string): Promise<AlumniRequest> => {
    const payload = reason ? { reason } : undefined
    const response = await API.post(`/alumni-requests/${requestId}/reject`, payload)
    return response.data
  },
}
