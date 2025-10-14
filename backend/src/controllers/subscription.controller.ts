import { Request, Response, NextFunction } from 'express'
import { subscriptionService } from '../services/subscription.service'
import { ResponseFormatter } from '../utils/response'

export class SubscriptionController {
  /**
   * 创建事件订阅
   * POST /api/v1/subscriptions
   */
  async createSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const {
        smartAccountId,
        contractAddress,
        eventType,
        chainId,
        filterConditions,
        notificationChannels,
      } = req.body

      const subscription = await subscriptionService.createSubscription(userId, {
        smartAccountId,
        contractAddress,
        eventType,
        chainId,
        filterConditions,
        notificationChannels,
      })

      return res.status(201).json(ResponseFormatter.success(subscription))
    } catch (error) {
      next(error)
    }
  }

  /**
   * 获取用户的订阅列表
   * GET /api/v1/subscriptions
   */
  async getSubscriptions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const { page, limit, isActive, chainId, smartAccountId } = req.query

      console.log('[SubscriptionController] Getting subscriptions for user:', userId, 'params:', { page, limit, isActive, chainId, smartAccountId })

      const result = await subscriptionService.getUserSubscriptions(userId, {
        page: page as number | undefined,
        limit: limit as number | undefined,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        chainId: chainId as number | undefined,
        smartAccountId: smartAccountId as string | undefined,
      })

      console.log('[SubscriptionController] Found subscriptions:', result.subscriptions.length)
      return res.status(200).json(
        ResponseFormatter.success(result.subscriptions, result.pagination)
      )
    } catch (error) {
      console.error('[SubscriptionController] Error getting subscriptions:', error)
      next(error)
    }
  }

  /**
   * 获取单个订阅
   * GET /api/v1/subscriptions/:id
   */
  async getSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const { id } = req.params

      const subscription = await subscriptionService.getSubscriptionById(id, userId)

      return res.status(200).json(ResponseFormatter.success(subscription))
    } catch (error) {
      next(error)
    }
  }

  /**
   * 更新订阅
   * PATCH /api/v1/subscriptions/:id
   */
  async updateSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const { id } = req.params
      const { filterConditions, notificationChannels, isActive } = req.body

      const subscription = await subscriptionService.updateSubscription(id, userId, {
        filterConditions,
        notificationChannels,
        isActive,
      })

      return res.status(200).json(ResponseFormatter.success(subscription))
    } catch (error) {
      next(error)
    }
  }

  /**
   * 删除订阅
   * DELETE /api/v1/subscriptions/:id
   */
  async deleteSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const { id } = req.params

      await subscriptionService.deleteSubscription(id, userId)

      return res.status(200).json(
        ResponseFormatter.success({ message: 'Subscription deleted successfully' })
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * 启用/禁用订阅
   * POST /api/v1/subscriptions/:id/toggle
   */
  async toggleSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const { id } = req.params
      const { isActive } = req.body

      const subscription = await subscriptionService.toggleSubscription(
        id,
        userId,
        isActive
      )

      return res.status(200).json(ResponseFormatter.success(subscription))
    } catch (error) {
      next(error)
    }
  }

  /**
   * 批量删除订阅
   * DELETE /api/v1/subscriptions
   */
  async deleteSubscriptions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const { ids } = req.body

      const result = await subscriptionService.deleteSubscriptions(userId, ids)

      return res.status(200).json(
        ResponseFormatter.success({
          message: `Deleted ${result.count} subscriptions`,
          count: result.count,
        })
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * 获取订阅统计信息
   * GET /api/v1/subscriptions/stats
   */
  async getSubscriptionStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId

      const stats = await subscriptionService.getSubscriptionStats(userId)

      return res.status(200).json(ResponseFormatter.success(stats))
    } catch (error) {
      next(error)
    }
  }
}

export const subscriptionController = new SubscriptionController()

