import { API } from "../../../services/api"
import type { PaginatedNotifications, NotificationType } from "../types/notification"

export interface GetNotificationsParams {
  cursor?: string | null
  limit?: number
  unread_only?: boolean
  notif_type?: NotificationType
}

export const getNotifications = async (
  params?: GetNotificationsParams
): Promise<PaginatedNotifications> => {
  const response = await API.get("/notifications/", { params })
  return response.data
}

export const getUnreadNotificationCount = async (): Promise<{ unread_count: number }> => {
  const response = await API.get("/notifications/unread-count")
  return response.data
}

export const markNotificationAsRead = async (
  notificationId: number
): Promise<{ message: string }> => {
  const response = await API.post(`/notifications/${notificationId}/read`)
  return response.data
}

export const markAllNotificationsAsRead = async (): Promise<{ message: string }> => {
  const response = await API.post("/notifications/read-all")
  return response.data
}

export const deleteNotification = async (
  notificationId: number
): Promise<{ message: string }> => {
  const response = await API.delete(`/notifications/${notificationId}`)
  return response.data
}
