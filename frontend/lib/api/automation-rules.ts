'use client'

import { apiClient, ApiResponse } from './client'

export interface AutomationRule {
  id: string
  userId: string
  smartAccountId: string
  ruleName: string
  description?: string
  triggerEventType: string
  triggerConditions: any
  actionType: 'transfer' | 'swap' | 'stake' | 'approve' | 'custom'
  actionParams: any
  chainId: number
  isActive: boolean
  executionCount: number
  lastExecutedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateRuleDto {
  smartAccountId: string
  ruleName: string
  description?: string
  triggerEventType: string
  triggerConditions: any
  actionType: 'transfer' | 'swap' | 'stake' | 'approve' | 'custom'
  actionParams: any
}

export interface UpdateRuleDto {
  ruleName?: string
  description?: string
  triggerConditions?: any
  actionParams?: any
  isActive?: boolean
}

/**
 * 自动化规则 API 服务
 */
export const automationRuleApi = {
  /**
   * 创建规则
   */
  async create(data: CreateRuleDto): Promise<ApiResponse<AutomationRule>> {
    return apiClient.post('/automation-rules', data)
  },

  /**
   * 获取规则列表
   */
  async list(params?: {
    page?: number
    limit?: number
    isActive?: boolean
    smartAccountId?: string
  }): Promise<ApiResponse<AutomationRule[]>> {
    return apiClient.get('/automation-rules', params)
  },

  /**
   * 获取规则详情
   */
  async getById(id: string): Promise<ApiResponse<AutomationRule>> {
    return apiClient.get(`/automation-rules/${id}`)
  },

  /**
   * 更新规则
   */
  async update(id: string, data: UpdateRuleDto): Promise<ApiResponse<AutomationRule>> {
    return apiClient.patch(`/automation-rules/${id}`, data)
  },

  /**
   * 删除规则
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/automation-rules/${id}`)
  },

  /**
   * 批量删除规则
   */
  async deleteMany(ids: string[]): Promise<ApiResponse<{ count: number }>> {
    return apiClient.delete('/automation-rules', { ids })
  },

  /**
   * 启用/禁用规则
   */
  async toggle(id: string, isActive: boolean): Promise<ApiResponse<AutomationRule>> {
    return apiClient.post(`/automation-rules/${id}/toggle`, { isActive })
  },

  /**
   * 获取执行历史
   */
  async getHistory(id: string): Promise<ApiResponse<any[]>> {
    return apiClient.get(`/automation-rules/${id}/history`)
  },

  /**
   * 测试规则条件
   */
  async test(id: string, testEvent: any): Promise<ApiResponse<{ matched: boolean }>> {
    return apiClient.post(`/automation-rules/${id}/test`, { testEvent })
  },

  /**
   * 手动触发规则
   */
  async trigger(id: string, testEvent?: any): Promise<ApiResponse<any>> {
    return apiClient.post(`/automation-rules/${id}/trigger`, { testEvent })
  },
}

