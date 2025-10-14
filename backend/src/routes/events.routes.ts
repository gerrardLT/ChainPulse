import { Router } from 'express'
import { eventsController } from '../controllers/events.controller'
import { authMiddleware } from '../middleware/auth.middleware'
import { validate } from '../middleware/validation.middleware'
import { z } from 'zod'

const router = Router()

/**
 * 验证 Schema
 */
const getEventsQuerySchema = z.object({
  query: z.object({
    limit: z.string().optional().transform(val => val ? parseInt(val) : undefined),
    offset: z.string().optional().transform(val => val ? parseInt(val) : undefined),
    timeRange: z.enum(['24h', '7d', '30d']).optional(),
    chainId: z.string().optional().transform(val => val ? parseInt(val) : undefined),
    contractAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
    eventType: z.string().optional(),
  }),
})

const getEventStatsQuerySchema = z.object({
  query: z.object({
    timeRange: z.enum(['24h', '7d', '30d']).optional(),
  }),
})

/**
 * @route   GET /api/v1/events
 * @desc    获取事件列表
 * @access  Private
 */
router.get(
  '/',
  authMiddleware,
  validate(getEventsQuerySchema),
  eventsController.getEvents
)

/**
 * @route   GET /api/v1/events/stats
 * @desc    获取事件统计
 * @access  Private
 */
router.get(
  '/stats',
  authMiddleware,
  validate(getEventStatsQuerySchema),
  eventsController.getEventStats
)

/**
 * @route   GET /api/v1/events/:id
 * @desc    获取单个事件
 * @access  Private
 */
router.get('/:id', authMiddleware, eventsController.getEventById)

export default router

