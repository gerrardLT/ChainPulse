'use client'

import { apiClient, ApiResponse } from './client'

export interface EventSubscription {
  id: string
  userId: string
  smartAccountId?: string
  contractAddress?: string
  eventType: string
  chainId: number
  filterConditions?: any
  notificationChannels?: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateSubscriptionDto {
  smartAccountId?: string
  contractAddress?: string
  eventType: string
  chainId: number
  filterConditions?: any
  notificationChannels?: string[]
}

export interface UpdateSubscriptionDto {
  filterConditions?: any
  notificationChannels?: string[]
  isActive?: boolean
}

export interface SubscriptionStats {
  totalTriggers: number
  lastTriggeredAt?: string
}

/**
 * 事件订阅 API 服务
 */
export const subscriptionApi = {
  /**
   * 创建订阅
   */
  async create(data: CreateSubscriptionDto): Promise<ApiResponse<EventSubscription>> {
    return apiClient.post('/subscriptions', data)
  },

  /**
   * 获取订阅列表
   */
  async list(params?: {
    page?: number
    limit?: number
    isActive?: boolean
    chainId?: number
  }): Promise<ApiResponse<EventSubscription[]>> {
    return apiClient.get('/subscriptions', params)
  },

  /**
   * 获取订阅详情
   */
  async getById(id: string): Promise<ApiResponse<EventSubscription>> {
    return apiClient.get(`/subscriptions/${id}`)
  },

  /**
   * 更新订阅
   */
  async update(
    id: string,
    data: UpdateSubscriptionDto
  ): Promise<ApiResponse<EventSubscription>> {
    return apiClient.patch(`/subscriptions/${id}`, data)
  },

  /**
   * 删除订阅
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/subscriptions/${id}`)
  },

  /**
   * 批量删除订阅
   */
  async deleteMany(ids: string[]): Promise<ApiResponse<{ count: number }>> {
    return apiClient.delete('/subscriptions', { ids })
  },

  /**
   * 启用/禁用订阅
   */
  async toggle(
    id: string,
    isActive: boolean
  ): Promise<ApiResponse<EventSubscription>> {
    return apiClient.post(`/subscriptions/${id}/toggle`, { isActive })
  },

  /**
   * 获取订阅统计
   */
  async getStats(id: string): Promise<ApiResponse<SubscriptionStats>> {
    return apiClient.get(`/subscriptions/${id}/stats`)
  },
}

