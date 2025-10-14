import { Router } from 'express'
import { notificationController } from '../controllers/notification.controller'
import { authMiddleware } from '../middleware/auth.middleware'
import { validate, commonSchemas } from '../middleware/validation.middleware'
import { apiLimiter } from '../middleware/rate-limit.middleware'
import { z } from 'zod'

const router = Router()

// 所有通知路由都需要认证
router.use(authMiddleware)
router.use(apiLimiter)

// 验证 schemas
const notificationIdParamSchema = z.object({
  params: z.object({
    id: commonSchemas.uuid,
  }),
})

const getNotificationsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    isRead: z.enum(['true', 'false']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
  }),
})

const deleteNotificationsSchema = z.object({
  body: z.object({
    ids: z.array(commonSchemas.uuid).min(1),
  }),
})

/**
 * @route   GET /api/v1/notifications/unread-count
 * @desc    获取未读通知数量
 * @access  Private
 */
router.get(
  '/unread-count',
  notificationController.getUnreadCount.bind(notificationController)
)

/**
 * @route   POST /api/v1/notifications/read-all
 * @desc    标记所有通知为已读
 * @access  Private
 */
router.post(
  '/read-all',
  notificationController.markAllAsRead.bind(notificationController)
)

/**
 * @route   GET /api/v1/notifications
 * @desc    获取用户通知列表
 * @access  Private
 */
router.get(
  '/',
  validate(getNotificationsQuerySchema),
  notificationController.getNotifications.bind(notificationController)
)

/**
 * @route   DELETE /api/v1/notifications
 * @desc    批量删除通知
 * @access  Private
 */
router.delete(
  '/',
  validate(deleteNotificationsSchema),
  notificationController.deleteNotifications.bind(notificationController)
)

/**
 * @route   GET /api/v1/notifications/:id
 * @desc    获取单个通知
 * @access  Private
 */
router.get(
  '/:id',
  validate(notificationIdParamSchema),
  notificationController.getNotification.bind(notificationController)
)

/**
 * @route   PATCH /api/v1/notifications/:id/read
 * @desc    标记通知为已读
 * @access  Private
 */
router.patch(
  '/:id/read',
  validate(notificationIdParamSchema),
  notificationController.markAsRead.bind(notificationController)
)

/**
 * @route   DELETE /api/v1/notifications/:id
 * @desc    删除通知
 * @access  Private
 */
router.delete(
  '/:id',
  validate(notificationIdParamSchema),
  notificationController.deleteNotification.bind(notificationController)
)

export default router

