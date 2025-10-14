'use client'

import { apiClient, ApiResponse } from './client'

export interface Notification {
  id: string
  userId: string
  subscriptionId?: string
  eventType: string
  priority: 'low' | 'medium' | 'high'
  title: string
  message: string
  metadata?: any
  isRead: boolean
  createdAt: string
}

/**
 * 通知 API 服务
 */
export const notificationApi = {
  /**
   * 获取通知列表
   */
  async list(params?: {
    page?: number
    limit?: number
    isRead?: boolean
    priority?: 'low' | 'medium' | 'high'
  }): Promise<ApiResponse<Notification[]>> {
    return apiClient.get('/notifications', params)
  },

  /**
   * 获取通知详情
   */
  async getById(id: string): Promise<ApiResponse<Notification>> {
    return apiClient.get(`/notifications/${id}`)
  },

  /**
   * 标记通知为已读
   */
  async markAsRead(id: string): Promise<ApiResponse<Notification>> {
    return apiClient.patch(`/notifications/${id}/read`)
  },

  /**
   * 标记所有通知为已读
   */
  async markAllAsRead(): Promise<ApiResponse<{ count: number }>> {
    return apiClient.post('/notifications/read-all')
  },

  /**
   * 删除通知
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/notifications/${id}`)
  },

  /**
   * 批量删除通知
   */
  async deleteMany(ids: string[]): Promise<ApiResponse<{ count: number }>> {
    return apiClient.delete('/notifications', { ids })
  },

  /**
   * 获取未读数量
   */
  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return apiClient.get('/notifications/unread-count')
  },
}

