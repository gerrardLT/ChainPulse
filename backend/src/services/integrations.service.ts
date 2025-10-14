import { prisma } from '../utils/prisma'
import { log } from '../utils/logger'
import axios from 'axios'

export interface TelegramConfig {
  id: string
  userId: string
  chatId: string
  username?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface DiscordConfig {
  id: string
  userId: string
  webhookUrl: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export class IntegrationsService {
  /**
   * 获取用户的 Telegram 配置
   */
  async getTelegramConfig(userId: string): Promise<TelegramConfig | null> {
    try {
      const config = await prisma.telegramConfig.findUnique({
        where: { userId },
      })

      if (!config) {
        return null
      }

      return {
        id: config.id,
        userId: config.userId,
        chatId: config.chatId,
        username: config.username || undefined,
        isActive: config.isActive,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
      }
    } catch (error) {
      log.error('Failed to get telegram config', error)
      throw error
    }
  }

  /**
   * 保存 Telegram 配置
   */
  async saveTelegramConfig(
    userId: string,
    chatId: string,
    username?: string
  ): Promise<TelegramConfig> {
    try {
      const config = await prisma.telegramConfig.upsert({
        where: { userId },
        update: {
          chatId,
          username,
          isActive: true,
          updatedAt: new Date(),
        },
        create: {
          userId,
          chatId,
          username,
          isActive: true,
        },
      })

      log.info(`Telegram config saved for user ${userId}`)

      return {
        id: config.id,
        userId: config.userId,
        chatId: config.chatId,
        username: config.username || undefined,
        isActive: config.isActive,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
      }
    } catch (error) {
      log.error('Failed to save telegram config', error)
      throw error
    }
  }

  /**
   * 删除 Telegram 配置
   */
  async deleteTelegramConfig(userId: string): Promise<void> {
    try {
      await prisma.telegramConfig.delete({
        where: { userId },
      })

      log.info(`Telegram config deleted for user ${userId}`)
    } catch (error) {
      log.error('Failed to delete telegram config', error)
      throw error
    }
  }

  /**
   * 获取用户的 Discord 配置
   */
  async getDiscordConfig(userId: string): Promise<DiscordConfig | null> {
    try {
      const config = await prisma.discordConfig.findUnique({
        where: { userId },
      })

      if (!config) {
        return null
      }

      return {
        id: config.id,
        userId: config.userId,
        webhookUrl: config.webhookUrl,
        isActive: config.isActive,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
      }
    } catch (error) {
      log.error('Failed to get discord config', error)
      throw error
    }
  }

  /**
   * 保存 Discord 配置
   */
  async saveDiscordConfig(
    userId: string,
    webhookUrl: string
  ): Promise<DiscordConfig> {
    try {
      // 验证 Discord Webhook URL 格式
      if (
        !webhookUrl.startsWith('https://discord.com/api/webhooks/') &&
        !webhookUrl.startsWith('https://discordapp.com/api/webhooks/')
      ) {
        throw new Error('Invalid Discord webhook URL format')
      }

      const config = await prisma.discordConfig.upsert({
        where: { userId },
        update: {
          webhookUrl,
          isActive: true,
          updatedAt: new Date(),
        },
        create: {
          userId,
          webhookUrl,
          isActive: true,
        },
      })

      log.info(`Discord config saved for user ${userId}`)

      return {
        id: config.id,
        userId: config.userId,
        webhookUrl: config.webhookUrl,
        isActive: config.isActive,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
      }
    } catch (error) {
      log.error('Failed to save discord config', error)
      throw error
    }
  }

  /**
   * 删除 Discord 配置
   */
  async deleteDiscordConfig(userId: string): Promise<void> {
    try {
      await prisma.discordConfig.delete({
        where: { userId },
      })

      log.info(`Discord config deleted for user ${userId}`)
    } catch (error) {
      log.error('Failed to delete discord config', error)
      throw error
    }
  }

  /**
   * 发送 Telegram 测试通知
   */
  async sendTelegramTestNotification(userId: string): Promise<boolean> {
    try {
      const config = await this.getTelegramConfig(userId)

      if (!config || !config.isActive) {
        throw new Error('Telegram not configured or disabled')
      }

      const botToken = process.env.TELEGRAM_BOT_TOKEN
      if (!botToken) {
        log.error('TELEGRAM_BOT_TOKEN not configured')
        throw new Error('Telegram bot token not configured')
      }

      const message = `🔔 *ChainPulse Test Notification*\n\nYour Telegram integration is working correctly!\n\nTime: ${new Date().toISOString()}`

      const response = await axios.post(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          chat_id: config.chatId,
          text: message,
          parse_mode: 'Markdown',
        }
      )

      if (response.data.ok) {
        log.info(`Telegram test notification sent to user ${userId}`)
        return true
      } else {
        log.error('Telegram API error:', response.data)
        return false
      }
    } catch (error) {
      log.error('Failed to send telegram test notification', error)
      throw error
    }
  }

  /**
   * 发送 Discord 测试通知
   */
  async sendDiscordTestNotification(userId: string): Promise<boolean> {
    try {
      const config = await this.getDiscordConfig(userId)

      if (!config || !config.isActive) {
        throw new Error('Discord not configured or disabled')
      }

      const embed = {
        title: '🔔 ChainPulse Test Notification',
        description: 'Your Discord integration is working correctly!',
        color: 0x00e6a8,
        timestamp: new Date().toISOString(),
        footer: {
          text: 'ChainPulse',
        },
      }

      const response = await axios.post(config.webhookUrl, {
        embeds: [embed],
      })

      if (response.status === 204) {
        log.info(`Discord test notification sent to user ${userId}`)
        return true
      } else {
        log.error('Discord webhook error:', response.status)
        return false
      }
    } catch (error) {
      log.error('Failed to send discord test notification', error)
      throw error
    }
  }

  /**
   * 获取用户的所有集成配置
   */
  async getAllConfigs(userId: string) {
    try {
      const [telegram, discord] = await Promise.all([
        this.getTelegramConfig(userId),
        this.getDiscordConfig(userId),
      ])

      return {
        telegram,
        discord,
      }
    } catch (error) {
      log.error('Failed to get all configs', error)
      throw error
    }
  }
}

export const integrationsService = new IntegrationsService()

