import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getToken } from '@/lib/token'
import type {
  Notification,
  UnreadCountResponse,
} from '@/validations/notification'

const RECONNECT_DELAY_MS = 3000
const WS_BASE_URL = (import.meta.env.VITE_API_URL as string).replace(
  /^http/,
  'ws',
)

export function useNotificationSocket(enabled: boolean) {
  const queryClient = useQueryClient()
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!enabled) return

    let isUnmounted = false

    const connect = () => {
      const token = getToken()
      if (!token) return

      const ws = new WebSocket(
        `${WS_BASE_URL}/api/v1/ws/notifications?token=${token}`,
      )
      wsRef.current = ws

      ws.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data) as Notification

          queryClient.setQueryData<{
            pages: Notification[][]
            pageParams: unknown[]
          }>(['notifications'], (old) => {
            if (!old) return { pages: [[notification]], pageParams: [1] }
            const pages = [...old.pages]
            pages[0] = [notification, ...pages[0]]
            return { ...old, pages }
          })

          queryClient.setQueryData<UnreadCountResponse>(
            ['notifications-unread-count'],
            (old) => ({ unread_count: (old?.unread_count ?? 0) + 1 }),
          )
        } catch (err) {
          console.error(
            '[useNotificationSocket] failed to parse message:',
            event.data,
            err,
          )
        }
      }

      ws.onclose = () => {
        console.log(
          '[useNotificationSocket] connection closed, reconnecting in 3s',
        )
        if (!isUnmounted) {
          reconnectTimeoutRef.current = setTimeout(connect, RECONNECT_DELAY_MS)
        }
      }

      ws.onerror = (err) => {
        console.error('[useNotificationSocket] error:', err)
        ws.close()
      }
    }

    connect()

    return () => {
      isUnmounted = true
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
      wsRef.current?.close()
    }
  }, [enabled, queryClient])
}
