import { API } from "../../../services/api"
import type { Connection, DiscoverFilterParams, DiscoverUser } from "../types/connection"

export const getDiscoverUsers = async (params?: DiscoverFilterParams): Promise<DiscoverUser[]> => {
  const response = await API.get("/users/discover", { params })
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

export const withdrawRequest = async (requestId: number): Promise<{ detail: string; connection_id: number }> => {
  const response = await API.post(`/connections/withdraw/${requestId}`)
  return response.data
}

export const disconnect = async (connectionId: number): Promise<{ detail: string; connection_id: number }> => {
  const response = await API.post(`/connections/disconnect/${connectionId}`)
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
