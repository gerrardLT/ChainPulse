import { Request, Response, NextFunction } from 'express'
import { integrationsService } from '../services/integrations.service'
import { ResponseFormatter } from '../utils/response'

export class IntegrationsController {
  /**
   * 获取所有集成配置
   * GET /api/v1/integrations
   */
  async getAllConfigs(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId

      console.log('[IntegrationsController] Getting configs for user:', userId)

      const configs = await integrationsService.getAllConfigs(userId)

      console.log('[IntegrationsController] Found configs:', {
        telegram: !!configs.telegram,
        discord: !!configs.discord,
      })

      return res.status(200).json(ResponseFormatter.success(configs))
    } catch (error) {
      console.error('[IntegrationsController] Error getting configs:', error)
      next(error)
    }
  }

  /**
   * 获取 Telegram 配置
   * GET /api/v1/integrations/telegram
   */
  async getTelegramConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId

      const config = await integrationsService.getTelegramConfig(userId)

      return res.status(200).json(ResponseFormatter.success(config))
    } catch (error) {
      next(error)
    }
  }

  /**
   * 保存 Telegram 配置
   * POST /api/v1/integrations/telegram
   */
  async saveTelegramConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const { chatId, username } = req.body

      console.log('[IntegrationsController] Saving telegram config:', {
        userId,
        chatId,
        username,
      })

      const config = await integrationsService.saveTelegramConfig(
        userId,
        chatId,
        username
      )

      return res.status(200).json(ResponseFormatter.success(config))
    } catch (error) {
      console.error('[IntegrationsController] Error saving telegram:', error)
      next(error)
    }
  }

  /**
   * 删除 Telegram 配置
   * DELETE /api/v1/integrations/telegram
   */
  async deleteTelegramConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId

      await integrationsService.deleteTelegramConfig(userId)

      return res.status(200).json(
        ResponseFormatter.success({ message: 'Telegram config deleted' })
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * 获取 Discord 配置
   * GET /api/v1/integrations/discord
   */
  async getDiscordConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId

      const config = await integrationsService.getDiscordConfig(userId)

      return res.status(200).json(ResponseFormatter.success(config))
    } catch (error) {
      next(error)
    }
  }

  /**
   * 保存 Discord 配置
   * POST /api/v1/integrations/discord
   */
  async saveDiscordConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const { webhookUrl } = req.body

      console.log('[IntegrationsController] Saving discord config:', {
        userId,
        webhookUrl: webhookUrl.substring(0, 50) + '...',
      })

      const config = await integrationsService.saveDiscordConfig(
        userId,
        webhookUrl
      )

      return res.status(200).json(ResponseFormatter.success(config))
    } catch (error) {
      console.error('[IntegrationsController] Error saving discord:', error)
      next(error)
    }
  }

  /**
   * 删除 Discord 配置
   * DELETE /api/v1/integrations/discord
   */
  async deleteDiscordConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId

      await integrationsService.deleteDiscordConfig(userId)

      return res.status(200).json(
        ResponseFormatter.success({ message: 'Discord config deleted' })
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * 发送测试通知
   * POST /api/v1/integrations/test
   */
  async sendTestNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const { type } = req.body

      console.log('[IntegrationsController] Sending test notification:', {
        userId,
        type,
      })

      let success = false
      let message = ''

      if (type === 'telegram') {
        success = await integrationsService.sendTelegramTestNotification(userId)
        message = success
          ? 'Telegram test notification sent successfully'
          : 'Failed to send Telegram test notification'
      } else if (type === 'discord') {
        success = await integrationsService.sendDiscordTestNotification(userId)
        message = success
          ? 'Discord test notification sent successfully'
          : 'Failed to send Discord test notification'
      } else {
        return res.status(400).json(
          ResponseFormatter.error(
            'INVALID_TYPE',
            'Invalid notification type. Must be "telegram" or "discord"'
          )
        )
      }

      if (success) {
        return res.status(200).json(ResponseFormatter.success({ message }))
      } else {
        return res.status(500).json(
          ResponseFormatter.error('SEND_FAILED', message)
        )
      }
    } catch (error) {
      console.error('[IntegrationsController] Error sending test:', error)
      next(error)
    }
  }
}

export const integrationsController = new IntegrationsController()

