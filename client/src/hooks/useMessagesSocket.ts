import { useEffect } from "react"
import { createMessagesSocket, type MessageSocketEvent } from "../api/message"

export function useMessagesSocket(
  enabled: boolean,
  onEvent: (event: MessageSocketEvent) => void,
) {
  useEffect(() => {
    if (!enabled) return

    let socket: WebSocket | null = null
    let pingInterval: number | undefined
    let reconnectTimeout: number | undefined
    let stopped = false

    const clearPing = () => {
      if (pingInterval !== undefined) {
        window.clearInterval(pingInterval)
        pingInterval = undefined
      }
    }

    const closeSocket = () => {
      if (
        socket &&
        (socket.readyState === WebSocket.CONNECTING ||
          socket.readyState === WebSocket.OPEN)
      ) {
        socket.close()
      }
    }

    const connect = () => {
      if (stopped) return

      socket = createMessagesSocket()
      if (!socket) return

      socket.onopen = () => {
        clearPing()
        pingInterval = window.setInterval(() => {
          if (socket?.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: "ping" }))
          }
        }, 25_000)
      }

      socket.onmessage = (event) => {
        try {
          onEvent(JSON.parse(event.data) as MessageSocketEvent)
        } catch (err) {
          console.error("Failed to parse WebSocket message", err)
        }
      }

      socket.onerror = () => {
        closeSocket()
      }

      socket.onclose = (event) => {
        clearPing()
        if (!stopped && event.code !== 1008) {
          reconnectTimeout = window.setTimeout(connect, 1_500)
        }
      }
    }

    connect()

    return () => {
      stopped = true
      clearPing()
      if (reconnectTimeout !== undefined) window.clearTimeout(reconnectTimeout)
      closeSocket()
    }
  }, [enabled, onEvent])
}
