'use client'

import { useState, useEffect, useCallback } from 'react'
import { statsApi, userApi } from '@/lib/api'

export interface DashboardData {
  totalSmartAccounts: number
  totalSubscriptions: number
  totalNotifications: number
  unreadNotifications: number
  activeRules: number
  recentEvents: any[]
}

/**
 * Dashboard 统计数据 Hook
 */
export function useDashboardStats(days: number = 7) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // 获取仪表板统计
      const response = await statsApi.getDashboard(days)
      
      if (response.success && response.data) {
        setData(response.data)
      } else {
        throw new Error(response.error?.message || 'Failed to fetch dashboard stats')
      }
    } catch (err: any) {
      console.error('Failed to fetch dashboard stats:', err)
      setError(err.message || 'Failed to load dashboard data')
      
      // 设置默认值以避免UI崩溃
      setData({
        totalSmartAccounts: 0,
        totalSubscriptions: 0,
        totalNotifications: 0,
        unreadNotifications: 0,
        activeRules: 0,
        recentEvents: [],
      })
    } finally {
      setIsLoading(false)
    }
  }, [days])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    data,
    isLoading,
    error,
    refresh: fetchStats,
  }
}

