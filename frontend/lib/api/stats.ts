'use client'

import { apiClient, ApiResponse } from './client'

export interface DashboardStats {
  totalSmartAccounts: number
  totalSubscriptions: number
  totalNotifications: number
  unreadNotifications: number
  activeRules: number
  recentEvents: any[]
}

export interface EventStats {
  totalEvents: number
  eventsByType: Record<string, number>
  eventsByChain: Record<number, number>
  recentEvents: any[]
}

export interface NotificationStats {
  total: number
  unread: number
  byPriority: {
    low: number
    medium: number
    high: number
  }
  recentNotifications: any[]
}

export interface SmartAccountActivityStats {
  totalTransactions: number
  totalValue: string
  activeAccounts: number
  recentTransactions: any[]
}

export interface ChainStats {
  chainId: number
  totalAccounts: number
  totalTransactions: number
  totalEvents: number
}

export interface AutomationRuleStats {
  totalRules: number
  activeRules: number
  totalExecutions: number
  successfulExecutions: number
  failedExecutions: number
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'down'
  uptime: number
  database: boolean
  websocket: boolean
  timestamp: string
}

/**
 * 统计 API 服务
 */
export const statsApi = {
  /**
   * 获取仪表板统计
   */
  async getDashboard(days: number = 7): Promise<ApiResponse<DashboardStats>> {
    return apiClient.get('/stats/dashboard', { days })
  },

  /**
   * 获取事件统计
   */
  async getEvents(days: number = 7): Promise<ApiResponse<EventStats>> {
    return apiClient.get('/stats/events', { days })
  },

  /**
   * 获取通知统计
   */
  async getNotifications(days: number = 7): Promise<ApiResponse<NotificationStats>> {
    return apiClient.get('/stats/notifications', { days })
  },

  /**
   * 获取智能账户活跃度统计
   */
  async getSmartAccountActivity(
    days: number = 7
  ): Promise<ApiResponse<SmartAccountActivityStats>> {
    return apiClient.get('/stats/smart-accounts-activity', { days })
  },

  /**
   * 获取按链统计
   */
  async getByChain(): Promise<ApiResponse<ChainStats[]>> {
    return apiClient.get('/stats/by-chain')
  },

  /**
   * 获取自动化规则统计
   */
  async getAutomationRules(): Promise<ApiResponse<AutomationRuleStats>> {
    return apiClient.get('/stats/automation-rules')
  },

  /**
   * 获取系统健康状态
   */
  async getHealth(): Promise<ApiResponse<HealthStatus>> {
    return apiClient.get('/stats/health')
  },
}

