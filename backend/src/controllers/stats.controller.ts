import { Request, Response, NextFunction } from 'express'
import { statsService } from '../services/stats.service'
import { ResponseFormatter } from '../utils/response'

export class StatsController {
  /**
   * 获取用户仪表板统计数据
   * GET /api/v1/stats/dashboard
   */
  async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId

      const stats = await statsService.getUserDashboardStats(userId)

      return res.status(200).json(ResponseFormatter.success(stats))
    } catch (error) {
      next(error)
    }
  }

  /**
   * 获取事件统计数据
   * GET /api/v1/stats/events
   */
  async getEventStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const { chainId, days } = req.query

      const stats = await statsService.getEventStats(
        userId,
        chainId ? parseInt(chainId as string) : undefined,
        days ? parseInt(days as string) : undefined
      )

      return res.status(200).json(ResponseFormatter.success(stats))
    } catch (error) {
      next(error)
    }
  }

  /**
   * 获取通知统计数据
   * GET /api/v1/stats/notifications
   */
  async getNotificationStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const { days } = req.query

      const stats = await statsService.getNotificationStats(
        userId,
        days ? parseInt(days as string) : undefined
      )

      return res.status(200).json(ResponseFormatter.success(stats))
    } catch (error) {
      next(error)
    }
  }

  /**
   * 获取智能账户活跃度统计
   * GET /api/v1/stats/smart-accounts-activity
   */
  async getSmartAccountActivityStats(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user!.userId
      const { days } = req.query

      const stats = await statsService.getSmartAccountActivityStats(
        userId,
        days ? parseInt(days as string) : undefined
      )

      return res.status(200).json(ResponseFormatter.success(stats))
    } catch (error) {
      next(error)
    }
  }

  /**
   * 获取按链统计的数据
   * GET /api/v1/stats/by-chain
   */
  async getStatsByChain(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId

      const stats = await statsService.getStatsByChain(userId)

      return res.status(200).json(ResponseFormatter.success(stats))
    } catch (error) {
      next(error)
    }
  }

  /**
   * 获取自动化规则执行统计
   * GET /api/v1/stats/automation-rules
   */
  async getAutomationRuleStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const { days } = req.query

      const stats = await statsService.getAutomationRuleStats(
        userId,
        days ? parseInt(days as string) : undefined
      )

      return res.status(200).json(ResponseFormatter.success(stats))
    } catch (error) {
      next(error)
    }
  }

  /**
   * 获取系统健康状态
   * GET /api/v1/stats/health
   */
  async getSystemHealth(req: Request, res: Response, next: NextFunction) {
    try {
      const health = await statsService.getSystemHealth()

      return res.status(200).json(ResponseFormatter.success(health))
    } catch (error) {
      next(error)
    }
  }
}

export const statsController = new StatsController()

