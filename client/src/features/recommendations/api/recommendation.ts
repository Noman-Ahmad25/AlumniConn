import { API } from "../../../services/api"
import type { PaginatedRecommendations } from "../types/recommendation"

export interface GetRecommendationsParams {
  cursor?: number | null
  limit?: number
  role_filter?: string | null
}

export const getRecommendations = async (
  params?: GetRecommendationsParams
): Promise<PaginatedRecommendations> => {
  const response = await API.get("/recommendations/", { params })
  return response.data
}
