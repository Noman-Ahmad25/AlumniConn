import { API } from "./index"

export interface MessageResponse {
  id: number
  content: string
  image_url?: string | null
  conversation_id: number
  timestamp: string
  sender: {
    id: number
    username: string
    profile_picture?: string | null
  }
}

export interface InboxMessage {
  conversation_id: number
  user_id: number
  profile_picture?: string | null
  username: string
  last_message?: string | null
  last_time?: string | null
}

export const getMessages = async (conversationId: number): Promise<MessageResponse[]> => {
  const res = await API.get(`/messages/chat/${conversationId}`)
  return res.data
}

export const sendMessage = async (formData: FormData): Promise<MessageResponse> => {
  const res = await API.post("/messages/send", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return res.data
}

export const getInbox = async (): Promise<InboxMessage[]> => {
  const res = await API.get("/messages/inbox")
  return res.data
}

export const startConversation = async (userId: number): Promise<{ conversation_id: number }> => {
  const res = await API.post(`/messages/conversation/${userId}`)
  return res.data
}
