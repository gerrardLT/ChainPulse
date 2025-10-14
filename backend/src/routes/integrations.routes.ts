import { Router } from 'express'
import { integrationsController } from '../controllers/integrations.controller'
import { authMiddleware } from '../middleware/auth.middleware'
import { validate } from '../middleware/validation.middleware'
import { z } from 'zod'

const router = Router()

/**
 * 验证 Schema
 */
const saveTelegramConfigSchema = z.object({
  body: z.object({
    chatId: z.string().min(1, 'Chat ID is required'),
    username: z.string().optional(),
  }),
})

const saveDiscordConfigSchema = z.object({
  body: z.object({
    webhookUrl: z
      .string()
      .min(1, 'Webhook URL is required')
      .refine(
        (url) =>
          url.startsWith('https://discord.com/api/webhooks/') ||
          url.startsWith('https://discordapp.com/api/webhooks/'),
        'Invalid Discord webhook URL format'
      ),
  }),
})

const sendTestNotificationSchema = z.object({
  body: z.object({
    type: z.enum(['telegram', 'discord'], {
      errorMap: () => ({ message: 'Type must be "telegram" or "discord"' }),
    }),
  }),
})

/**
 * @route   GET /api/v1/integrations
 * @desc    获取所有集成配置
 * @access  Private
 */
router.get('/', authMiddleware, integrationsController.getAllConfigs)

/**
 * @route   GET /api/v1/integrations/telegram
 * @desc    获取 Telegram 配置
 * @access  Private
 */
router.get('/telegram', authMiddleware, integrationsController.getTelegramConfig)

/**
 * @route   POST /api/v1/integrations/telegram
 * @desc    保存 Telegram 配置
 * @access  Private
 */
router.post(
  '/telegram',
  authMiddleware,
  validate(saveTelegramConfigSchema),
  integrationsController.saveTelegramConfig
)

/**
 * @route   DELETE /api/v1/integrations/telegram
 * @desc    删除 Telegram 配置
 * @access  Private
 */
router.delete(
  '/telegram',
  authMiddleware,
  integrationsController.deleteTelegramConfig
)

/**
 * @route   GET /api/v1/integrations/discord
 * @desc    获取 Discord 配置
 * @access  Private
 */
router.get('/discord', authMiddleware, integrationsController.getDiscordConfig)

/**
 * @route   POST /api/v1/integrations/discord
 * @desc    保存 Discord 配置
 * @access  Private
 */
router.post(
  '/discord',
  authMiddleware,
  validate(saveDiscordConfigSchema),
  integrationsController.saveDiscordConfig
)

/**
 * @route   DELETE /api/v1/integrations/discord
 * @desc    删除 Discord 配置
 * @access  Private
 */
router.delete(
  '/discord',
  authMiddleware,
  integrationsController.deleteDiscordConfig
)

/**
 * @route   POST /api/v1/integrations/test
 * @desc    发送测试通知
 * @access  Private
 */
router.post(
  '/test',
  authMiddleware,
  validate(sendTestNotificationSchema),
  integrationsController.sendTestNotification
)

export default router

