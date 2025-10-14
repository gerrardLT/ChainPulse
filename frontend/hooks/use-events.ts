'use client'

import { useState, useEffect, useCallback } from 'react'
import { eventsApi, Event, EventsListParams } from '@/lib/api'
import { useAuthContext } from '@/components/auth-provider'
import { useWebSocketContext } from '@/components/websocket-provider'

/**
 * Events Hook
 * 管理区块链事件数据
 */
export function useEvents(params: EventsListParams = {}) {
  const { isAuthenticated } = useAuthContext()
  const { lastNotification } = useWebSocketContext()
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * 获取事件列表
   */
  const fetchEvents = useCallback(async () => {
    if (!isAuthenticated) {
      console.log('[useEvents] Not authenticated, skipping fetch')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log('[useEvents] Fetching events with params:', params)
      const response = await eventsApi.list({
        limit: 10,
        timeRange: '24h',
        ...params,
      })

      if (response.success && response.data) {
        console.log('[useEvents] ✅ Events fetched:', response.data.length)
        setEvents(response.data)
      } else {
        console.error('[useEvents] ❌ Failed to fetch events:', response.error)
        setError(response.error?.message || 'Failed to fetch events')
        setEvents([])
      }
    } catch (err: any) {
      console.error('[useEvents] ❌ Error fetching events:', err)
      setError(err.message || 'An error occurred')
      setEvents([])
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, JSON.stringify(params)])

  /**
   * 初始加载
   */
  useEffect(() => {
    if (isAuthenticated) {
      fetchEvents()
    }
  }, [isAuthenticated, fetchEvents])

  /**
   * 监听 WebSocket 新事件
   */
  useEffect(() => {
    if (lastNotification && lastNotification.type === 'event:new') {
      console.log('[useEvents] 🔥 New event from WebSocket:', lastNotification.data)
      
      // 将新事件添加到列表顶部
      setEvents((prev) => {
        const newEvent = lastNotification.data as Event
        // 避免重复
        if (prev.some((e) => e.id === newEvent.id)) {
          return prev
        }
        // 限制列表长度
        const updated = [newEvent, ...prev]
        return updated.slice(0, params.limit || 10)
      })
    }
  }, [lastNotification, params.limit])

  return {
    events,
    isLoading,
    error,
    refresh: fetchEvents,
  }
}

