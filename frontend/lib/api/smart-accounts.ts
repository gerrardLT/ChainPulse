'use client'

import { apiClient, ApiResponse } from './client'

export interface SmartAccount {
  id: string
  userId: string
  accountAddress: string
  ownerAddress: string
  chainId: number
  accountType: string
  isDeployed: boolean
  deploymentTxHash?: string
  balance?: string
  createdAt: string
  updatedAt: string
}

export interface SmartAccountStats {
  totalTransactions: number
  totalValue: string
  lastTransactionAt?: string
}

export interface CreateSmartAccountDto {
  ownerAddress: string
  chainId: number
  accountType?: string
  accountAddress?: string
}

export interface UpdateSmartAccountDto {
  accountAddress?: string
  isDeployed?: boolean
  deploymentTxHash?: string
  balance?: string
}

/**
 * 智能账户 API 服务
 */
export const smartAccountApi = {
  /**
   * 创建智能账户
   */
  async create(data: CreateSmartAccountDto): Promise<ApiResponse<SmartAccount>> {
    return apiClient.post('/smart-accounts', data)
  },

  /**
   * 获取智能账户列表
   */
  async list(params?: {
    page?: number
    limit?: number
    chainId?: number
  }): Promise<ApiResponse<SmartAccount[]>> {
    return apiClient.get('/smart-accounts', params)
  },

  /**
   * 获取智能账户详情
   */
  async getById(id: string): Promise<ApiResponse<SmartAccount>> {
    return apiClient.get(`/smart-accounts/${id}`)
  },

  /**
   * 根据地址获取智能账户
   */
  async getByAddress(address: string): Promise<ApiResponse<SmartAccount>> {
    return apiClient.get(`/smart-accounts/address/${address}`)
  },

  /**
   * 更新智能账户
   */
  async update(id: string, data: UpdateSmartAccountDto): Promise<ApiResponse<SmartAccount>> {
    return apiClient.patch(`/smart-accounts/${id}`, data)
  },

  /**
   * 删除智能账户
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/smart-accounts/${id}`)
  },

  /**
   * 获取账户统计
   */
  async getStats(id: string): Promise<ApiResponse<SmartAccountStats>> {
    return apiClient.get(`/smart-accounts/${id}/stats`)
  },

  /**
   * 标记账户为已部署
   */
  async markAsDeployed(
    id: string,
    txHash: string,
    accountAddress: string
  ): Promise<ApiResponse<SmartAccount>> {
    return apiClient.post(`/smart-accounts/${id}/deploy`, { 
      txHash, 
      accountAddress 
    })
  },
}

