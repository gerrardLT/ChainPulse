import { Router } from 'express'
import { subscriptionController } from '../controllers/subscription.controller'
import { authMiddleware } from '../middleware/auth.middleware'
import { validate, commonSchemas } from '../middleware/validation.middleware'
import { apiLimiter } from '../middleware/rate-limit.middleware'
import { z } from 'zod'

const router = Router()

// 所有订阅路由都需要认证
router.use(authMiddleware)
router.use(apiLimiter)

// 验证 schemas
const createSubscriptionSchema = z.object({
  body: z.object({
    smartAccountId: commonSchemas.uuid.optional(),
    contractAddress: commonSchemas.walletAddress.optional(),
    eventType: z.string().min(1).max(255),
    chainId: z.number().int().positive(),
    filterConditions: z.record(z.any()).optional(),
    notificationChannels: z.array(z.enum(['web', 'telegram', 'discord', 'email'])).optional(),
  }),
})

const updateSubscriptionSchema = z.object({
  body: z.object({
    filterConditions: z.record(z.any()).optional(),
    notificationChannels: z.array(z.enum(['web', 'telegram', 'discord', 'email'])).optional(),
    isActive: z.boolean().optional(),
  }),
})

const toggleSubscriptionSchema = z.object({
  body: z.object({
    isActive: z.boolean(),
  }),
})

const deleteSubscriptionsSchema = z.object({
  body: z.object({
    ids: z.array(commonSchemas.uuid).min(1),
  }),
})

const subscriptionIdParamSchema = z.object({
  params: z.object({
    id: commonSchemas.uuid,
  }),
})

const getSubscriptionsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val) : undefined),
    limit: z.string().optional().transform(val => val ? parseInt(val) : undefined),
    isActive: z.enum(['true', 'false']).optional(),
    chainId: z.string().optional().transform(val => val ? parseInt(val) : undefined),
    smartAccountId: z.string().optional(),
  }),
})

/**
 * @route   GET /api/v1/subscriptions/stats
 * @desc    获取订阅统计信息
 * @access  Private
 */
router.get(
  '/stats',
  subscriptionController.getSubscriptionStats.bind(subscriptionController)
)

/**
 * @route   POST /api/v1/subscriptions
 * @desc    创建事件订阅
 * @access  Private
 */
router.post(
  '/',
  validate(createSubscriptionSchema),
  subscriptionController.createSubscription.bind(subscriptionController)
)

/**
 * @route   GET /api/v1/subscriptions
 * @desc    获取用户的订阅列表
 * @access  Private
 */
router.get(
  '/',
  validate(getSubscriptionsQuerySchema),
  subscriptionController.getSubscriptions.bind(subscriptionController)
)

/**
 * @route   DELETE /api/v1/subscriptions
 * @desc    批量删除订阅
 * @access  Private
 */
router.delete(
  '/',
  validate(deleteSubscriptionsSchema),
  subscriptionController.deleteSubscriptions.bind(subscriptionController)
)

/**
 * @route   GET /api/v1/subscriptions/:id
 * @desc    获取单个订阅
 * @access  Private
 */
router.get(
  '/:id',
  validate(subscriptionIdParamSchema),
  subscriptionController.getSubscription.bind(subscriptionController)
)

/**
 * @route   PATCH /api/v1/subscriptions/:id
 * @desc    更新订阅
 * @access  Private
 */
router.patch(
  '/:id',
  validate(subscriptionIdParamSchema),
  validate(updateSubscriptionSchema),
  subscriptionController.updateSubscription.bind(subscriptionController)
)

/**
 * @route   DELETE /api/v1/subscriptions/:id
 * @desc    删除订阅
 * @access  Private
 */
router.delete(
  '/:id',
  validate(subscriptionIdParamSchema),
  subscriptionController.deleteSubscription.bind(subscriptionController)
)

/**
 * @route   POST /api/v1/subscriptions/:id/toggle
 * @desc    启用/禁用订阅
 * @access  Private
 */
router.post(
  '/:id/toggle',
  validate(subscriptionIdParamSchema),
  validate(toggleSubscriptionSchema),
  subscriptionController.toggleSubscription.bind(subscriptionController)
)

export default router

