'use client'

import { apiClient, ApiResponse } from './client'

export interface User {
  id: string
  walletAddress: string
  ensName?: string
  avatarUrl?: string
  email?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface UserStats {
  smartAccountCount: number
  subscriptionCount: number
  notificationCount: number
  unreadNotificationCount: number
}

/**
 * 认证 API 服务
 */
export const authApi = {
  /**
   * 获取签名消息
   */
  async getMessage(walletAddress: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post('/auth/message', { walletAddress }, false)
  },

  /**
   * 验证签名并登录
   */
  async verifySignature(
    walletAddress: string,
    message: string,
    signature: string
  ): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>(
      '/auth/verify',
      { walletAddress, message, signature },
      false
    )

    // 保存 token
    if (response.success && response.data?.token) {
      apiClient.setToken(response.data.token)
    }

    return response
  },

  /**
   * 获取当前用户信息
   */
  async getMe(): Promise<ApiResponse<User>> {
    return apiClient.get('/auth/me')
  },

  /**
   * 退出登录
   */
  async logout(): Promise<ApiResponse<void>> {
    const response = await apiClient.post('/auth/logout')
    apiClient.clearToken()
    return response
  },
}

/**
 * 用户 API 服务
 */
export const userApi = {
  /**
   * 获取当前用户信息
   */
  async getMe(): Promise<ApiResponse<User>> {
    return apiClient.get('/users/me')
  },

  /**
   * 更新当前用户信息
   */
  async updateMe(data: {
    ensName?: string
    email?: string
    avatarUrl?: string
  }): Promise<ApiResponse<User>> {
    return apiClient.patch('/users/me', data)
  },

  /**
   * 删除当前用户
   */
  async deleteMe(): Promise<ApiResponse<void>> {
    return apiClient.delete('/users/me')
  },

  /**
   * 根据钱包地址获取用户
   */
  async getByWalletAddress(walletAddress: string): Promise<ApiResponse<User>> {
    return apiClient.get(`/users/${walletAddress}`)
  },

  /**
   * 获取用户统计
   */
  async getStats(): Promise<ApiResponse<UserStats>> {
    return apiClient.get('/users/me/stats')
  },
}

