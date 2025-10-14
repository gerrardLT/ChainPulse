'use client'

import { apiClient, ApiResponse } from './client'

export interface TelegramConfig {
  id: string
  userId: string
  chatId: string
  username?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface DiscordConfig {
  id: string
  userId: string
  webhookUrl: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface IntegrationsConfig {
  telegram: TelegramConfig | null
  discord: DiscordConfig | null
}

/**
 * Integrations API 服务
 */
export const integrationsApi = {
  /**
   * 获取所有集成配置
   */
  async getAll(): Promise<ApiResponse<IntegrationsConfig>> {
    return apiClient.get<IntegrationsConfig>('/integrations')
  },

  /**
   * 获取 Telegram 配置
   */
  async getTelegram(): Promise<ApiResponse<TelegramConfig | null>> {
    return apiClient.get<TelegramConfig | null>('/integrations/telegram')
  },

  /**
   * 保存 Telegram 配置
   */
  async saveTelegram(
    chatId: string,
    username?: string
  ): Promise<ApiResponse<TelegramConfig>> {
    return apiClient.post<TelegramConfig>('/integrations/telegram', {
      chatId,
      username,
    })
  },

  /**
   * 删除 Telegram 配置
   */
  async deleteTelegram(): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete<{ message: string }>('/integrations/telegram')
  },

  /**
   * 获取 Discord 配置
   */
  async getDiscord(): Promise<ApiResponse<DiscordConfig | null>> {
    return apiClient.get<DiscordConfig | null>('/integrations/discord')
  },

  /**
   * 保存 Discord 配置
   */
  async saveDiscord(webhookUrl: string): Promise<ApiResponse<DiscordConfig>> {
    return apiClient.post<DiscordConfig>('/integrations/discord', {
      webhookUrl,
    })
  },

  /**
   * 删除 Discord 配置
   */
  async deleteDiscord(): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete<{ message: string }>('/integrations/discord')
  },

  /**
   * 发送测试通知
   */
  async sendTest(type: 'telegram' | 'discord'): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>('/integrations/test', { type })
  },
}

