import { Router } from 'express'
import { statsController } from '../controllers/stats.controller'
import { authMiddleware } from '../middleware/auth.middleware'
import { apiLimiter } from '../middleware/rate-limit.middleware'
import { validate } from '../middleware/validation.middleware'
import { z } from 'zod'

const router = Router()

// 健康检查端点无需认证
router.get('/health', statsController.getSystemHealth.bind(statsController))

// 其他统计端点需要认证
router.use(authMiddleware)
router.use(apiLimiter)

// 验证 schemas
const statsQuerySchema = z.object({
  query: z.object({
    chainId: z.string().optional(),
    days: z.string().optional(),
  }),
})

/**
 * @route   GET /api/v1/stats/dashboard
 * @desc    获取用户仪表板统计数据
 * @access  Private
 */
router.get(
  '/dashboard',
  statsController.getDashboardStats.bind(statsController)
)

/**
 * @route   GET /api/v1/stats/events
 * @desc    获取事件统计数据
 * @access  Private
 */
router.get(
  '/events',
  validate(statsQuerySchema),
  statsController.getEventStats.bind(statsController)
)

/**
 * @route   GET /api/v1/stats/notifications
 * @desc    获取通知统计数据
 * @access  Private
 */
router.get(
  '/notifications',
  validate(statsQuerySchema),
  statsController.getNotificationStats.bind(statsController)
)

/**
 * @route   GET /api/v1/stats/smart-accounts-activity
 * @desc    获取智能账户活跃度统计
 * @access  Private
 */
router.get(
  '/smart-accounts-activity',
  validate(statsQuerySchema),
  statsController.getSmartAccountActivityStats.bind(statsController)
)

/**
 * @route   GET /api/v1/stats/by-chain
 * @desc    获取按链统计的数据
 * @access  Private
 */
router.get('/by-chain', statsController.getStatsByChain.bind(statsController))

/**
 * @route   GET /api/v1/stats/automation-rules
 * @desc    获取自动化规则执行统计
 * @access  Private
 */
router.get(
  '/automation-rules',
  validate(statsQuerySchema),
  statsController.getAutomationRuleStats.bind(statsController)
)

export default router

