import { API } from "../services/api"
import type { Connection, DiscoverUser } from "../types/connection"

export const getDiscoverUsers = async (): Promise<DiscoverUser[]> => {
  const response = await API.get("/users/discover")
  return response.data
}

export const sendRequest = async (userId: number): Promise<Connection> => {
  const response = await API.post(`/connections/`, { receiver_id: userId })
  return response.data
}

export const acceptRequest = async (requestId: number): Promise<Connection> => {
  const response = await API.post(`/connections/accept/${requestId}`)
  return response.data
}

export const rejectRequest = async (requestId: number): Promise<Connection> => {
  const response = await API.post(`/connections/reject/${requestId}`)
  return response.data
}

export const getConnections = async (): Promise<Connection[]> => {
  const response = await API.get("/connections/")
  return response.data
}

export const getRequests = async (): Promise<Connection[]> => {
  const response = await API.get("/connections/requests")
  return response.data
}
