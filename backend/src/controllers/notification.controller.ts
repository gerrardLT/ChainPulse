import { Request, Response, NextFunction } from 'express'
import { notificationService } from '../services/notification.service'
import { ResponseFormatter } from '../utils/response'

export class NotificationController {
  /**
   * 获取用户通知列表
   * GET /api/v1/notifications
   */
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const { page, limit, isRead, priority } = req.query

      const result = await notificationService.getUserNotifications(userId, {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
        priority: priority as string,
      })

      return res.status(200).json(
        ResponseFormatter.success(result.notifications, result.pagination)
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * 获取单个通知
   * GET /api/v1/notifications/:id
   */
  async getNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const { id } = req.params

      const notification = await notificationService.getNotificationById(id, userId)

      return res.status(200).json(ResponseFormatter.success(notification))
    } catch (error) {
      next(error)
    }
  }

  /**
   * 标记通知为已读
   * PATCH /api/v1/notifications/:id/read
   */
  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const { id } = req.params

      const notification = await notificationService.markAsRead(id, userId)

      return res.status(200).json(ResponseFormatter.success(notification))
    } catch (error) {
      next(error)
    }
  }

  /**
   * 标记所有通知为已读
   * POST /api/v1/notifications/read-all
   */
  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId

      const result = await notificationService.markAllAsRead(userId)

      return res.status(200).json(
        ResponseFormatter.success({
          message: `Marked ${result.count} notifications as read`,
          count: result.count,
        })
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * 删除通知
   * DELETE /api/v1/notifications/:id
   */
  async deleteNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const { id } = req.params

      await notificationService.deleteNotification(id, userId)

      return res.status(200).json(
        ResponseFormatter.success({ message: 'Notification deleted successfully' })
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * 批量删除通知
   * DELETE /api/v1/notifications
   */
  async deleteNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const { ids } = req.body

      const result = await notificationService.deleteNotifications(userId, ids)

      return res.status(200).json(
        ResponseFormatter.success({
          message: `Deleted ${result.count} notifications`,
          count: result.count,
        })
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * 获取未读通知数量
   * GET /api/v1/notifications/unread-count
   */
  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId

      const count = await notificationService.getUnreadCount(userId)

      return res.status(200).json(
        ResponseFormatter.success({ count })
      )
    } catch (error) {
      next(error)
    }
  }
}

export const notificationController = new NotificationController()

