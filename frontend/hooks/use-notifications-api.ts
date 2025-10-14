'use client'

import { useState, useEffect, useCallback } from 'react'
import { notificationApi, Notification } from '@/lib/api'
import { useToast } from './use-toast'

/**
 * 通知 API Hook
 * 使用真实的后端API
 */
export function useNotificationsApi() {
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  /**
   * 获取通知列表
   */
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await notificationApi.list({ limit: 50 })
      if (response.success && response.data) {
        setNotifications(response.data)
      }

      // 获取未读数量
      const countResponse = await notificationApi.getUnreadCount()
      if (countResponse.success && countResponse.data) {
        setUnreadCount(countResponse.data.count)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * 标记为已读
   */
  const markAsRead = useCallback(
    async (id: string) => {
      try {
        const response = await notificationApi.markAsRead(id)
        if (response.success) {
          setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
          )
          setUnreadCount((prev) => Math.max(0, prev - 1))
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to mark as read',
          variant: 'destructive',
        })
      }
    },
    [toast]
  )

  /**
   * 标记所有为已读
   */
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await notificationApi.markAllAsRead()
      if (response.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
        setUnreadCount(0)
        toast({
          title: 'Success',
          description: 'All notifications marked as read',
        })
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to mark all as read',
        variant: 'destructive',
      })
    }
  }, [toast])

  /**
   * 删除通知
   */
  const clearNotification = useCallback(
    async (id: string) => {
      try {
        const response = await notificationApi.delete(id)
        if (response.success) {
          setNotifications((prev) => prev.filter((n) => n.id !== id))
          toast({
            title: 'Success',
            description: 'Notification deleted',
          })
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete notification',
          variant: 'destructive',
        })
      }
    },
    [toast]
  )

  /**
   * 初始加载
   */
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    clearNotification,
    refresh: fetchNotifications,
  }
}

