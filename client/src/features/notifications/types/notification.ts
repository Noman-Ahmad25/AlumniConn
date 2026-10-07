export type NotificationType =
  | "POST_LIKED"
  | "POST_COMMENTED"
  | "CONNECTION_RECEIVED"
  | "CONNECTION_ACCEPTED"
  | "MESSAGE_RECEIVED"
  | "RECOMMENDATIONS_AVAILABLE"

export interface NotificationItem {
  id: number
  notification_type: NotificationType
  title: string
  message: string
  metadata_?: Record<string, any> | null
  is_read: boolean
  created_at: string
  read_at?: string | null
}

export interface PaginatedNotifications {
  items: NotificationItem[]
  next_cursor?: string | null
}
