'use client'

import { useState, useEffect, useCallback } from 'react'
import { subscriptionApi, EventSubscription } from '@/lib/api'
import { useAuthContext } from '@/components/auth-provider'
import { useToast } from './use-toast'

/**
 * 事件订阅 Hook
 */
export function useSubscriptions() {
  const { toast } = useToast()
  const { isAuthenticated } = useAuthContext()
  const [subscriptions, setSubscriptions] = useState<EventSubscription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * 获取订阅列表
   */
  const fetchSubscriptions = useCallback(async () => {
    if (!isAuthenticated) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await subscriptionApi.list({ limit: 100 })
      
      if (response.success && response.data) {
        setSubscriptions(response.data)
      } else {
        throw new Error(response.error?.message || 'Failed to fetch subscriptions')
      }
    } catch (err: any) {
      console.error('Failed to fetch subscriptions:', err)
      setError(err.message || 'Failed to load subscriptions')
      setSubscriptions([])
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  /**
   * 创建订阅
   */
  const createSubscription = useCallback(
    async (data: {
      eventType: string
      chainId: number
      contractAddress?: string
      smartAccountId?: string
      filterConditions?: any
    }) => {
      try {
        const response = await subscriptionApi.create(data)
        
        if (response.success && response.data) {
          toast({
            title: 'Success',
            description: 'Event subscription created',
          })
          await fetchSubscriptions()
          return response.data
        } else {
          throw new Error(response.error?.message || 'Failed to create subscription')
        }
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err.message || 'Failed to create subscription',
          variant: 'destructive',
        })
        return null
      }
    },
    [toast, fetchSubscriptions]
  )

  /**
   * 切换订阅状态
   */
  const toggleSubscription = useCallback(
    async (id: string, isActive: boolean) => {
      try {
        const response = await subscriptionApi.toggle(id, isActive)
        
        if (response.success) {
          setSubscriptions((prev) =>
            prev.map((sub) => (sub.id === id ? { ...sub, isActive } : sub))
          )
          toast({
            title: 'Success',
            description: `Subscription ${isActive ? 'enabled' : 'disabled'}`,
          })
        }
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err.message || 'Failed to toggle subscription',
          variant: 'destructive',
        })
      }
    },
    [toast]
  )

  /**
   * 删除订阅
   */
  const deleteSubscription = useCallback(
    async (id: string) => {
      try {
        const response = await subscriptionApi.delete(id)
        
        if (response.success) {
          setSubscriptions((prev) => prev.filter((sub) => sub.id !== id))
          toast({
            title: 'Success',
            description: 'Subscription deleted',
          })
        }
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err.message || 'Failed to delete subscription',
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
    if (isAuthenticated) {
      fetchSubscriptions()
    }
  }, [isAuthenticated, fetchSubscriptions])

  return {
    subscriptions,
    isLoading,
    error,
    createSubscription,
    toggleSubscription,
    deleteSubscription,
    refresh: fetchSubscriptions,
  }
}

