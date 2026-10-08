import axios from "axios"

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data
    if (!data) return fallback

    // Pydantic / FastAPI 422 error detail array
    if (Array.isArray(data.detail)) {
      const messages = data.detail
        .map((item: unknown) => {
          if (typeof item === "string") return item
          if (item && typeof item === "object") {
            const errObj = item as { msg?: unknown; message?: unknown }
            const rawMsg = errObj.msg || errObj.message
            if (typeof rawMsg === "string") {
            return rawMsg.replace(/^Value error,\s*/i, "")
          }
        }
        return null
      })
      .filter((msg: unknown): msg is string => typeof msg === "string" && Boolean(msg.trim()))

      if (messages.length > 0) {
        return Array.from(new Set(messages)).join(". ")
      }
    }

    // Detail as a string
    if (typeof data.detail === "string" && data.detail.trim()) {
      return data.detail.replace(/^Value error,\s*/i, "")
    }

    // Detail as an object with message or msg
    if (data.detail && typeof data.detail === "object") {
      const detailObj = data.detail as { message?: unknown; msg?: unknown }
      const msg = detailObj.message || detailObj.msg
      if (typeof msg === "string" && msg.trim()) {
        return msg.replace(/^Value error,\s*/i, "")
      }
    }

    // Direct message or error field
    if (typeof data.message === "string" && data.message.trim()) {
      return data.message
    }
    if (typeof data.error === "string" && data.error.trim()) {
      return data.error
    }
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}
