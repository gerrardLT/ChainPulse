'use client'

import { apiClient, ApiResponse } from './client'

export interface Event {
  id: string
  chainId: number
  contractAddress: string
  eventType: string
  transactionHash: string
  blockNumber: number
  blockTimestamp: string
  data: any
  createdAt: string
}

export interface EventStats {
  totalEvents: number
  eventsByType: {
    eventType: string
    count: number
  }[]
}

export interface EventsListParams {
  limit?: number
  offset?: number
  timeRange?: '24h' | '7d' | '30d'
  chainId?: number
  contractAddress?: string
  eventType?: string
}

/**
 * Events API 服务
 */
export const eventsApi = {
  /**
   * 获取事件列表
   */
  async list(params: EventsListParams = {}): Promise<ApiResponse<Event[]>> {
    return apiClient.get<Event[]>('/events', params)
  },

  /**
   * 获取单个事件
   */
  async getById(id: string): Promise<ApiResponse<Event>> {
    return apiClient.get<Event>(`/events/${id}`)
  },

  /**
   * 获取事件统计
   */
  async getStats(timeRange?: '24h' | '7d' | '30d'): Promise<ApiResponse<EventStats>> {
    return apiClient.get<EventStats>('/events/stats', timeRange ? { timeRange } : {})
  },
}

