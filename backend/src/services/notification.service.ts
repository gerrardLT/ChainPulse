import { prisma } from '../utils/prisma'
import { NotFoundError } from '../utils/errors'
import { log } from '../utils/logger'
import { CreateNotificationDto, NotificationPriority, NotificationChannel } from '../types'

export class NotificationService {
  /**
   * 创建通知
   */
  async createNotification(data: CreateNotificationDto) {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        subscriptionId: data.subscriptionId,
        eventId: data.eventId,
        title: data.title,
        message: data.message,
        priority: data.priority || NotificationPriority.MEDIUM,
        channel: data.channel,
        metadata: data.metadata,
      },
    })

    log.info(`Notification created: ${notification.id}`)
    return notification
  }

  /**
   * 获取用户通知列表
   */
  async getUserNotifications(
    userId: string,
    options: {
      page?: number
      limit?: number
      isRead?: boolean
      priority?: string
    } = {}
  ) {
    const { page = 1, limit = 20, isRead, priority } = options
    const skip = (page - 1) * limit

    const where: any = { userId }
    if (isRead !== undefined) {
      where.isRead = isRead
    }
    if (priority) {
      where.priority = priority
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          subscription: {
            select: {
              id: true,
              contractAddress: true,
              eventType: true,
            },
          },
        },
      }),
      prisma.notification.count({ where }),
    ])

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * 根据 ID 获取通知
   */
  async getNotificationById(notificationId: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
      include: {
        subscription: true,
      },
    })

    if (!notification) {
      throw new NotFoundError('Notification')
    }

    return notification
  }

  /**
   * 标记通知为已读
   */
  async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    })

    if (!notification) {
      throw new NotFoundError('Notification')
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    log.info(`Notification marked as read: ${notificationId}`)
    return updated
  }

  /**
   * 标记所有通知为已读
   */
  async markAllAsRead(userId: string) {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    log.info(`Marked ${result.count} notifications as read for user: ${userId}`)
    return result
  }

  /**
   * 删除通知
   */
  async deleteNotification(notificationId: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    })

    if (!notification) {
      throw new NotFoundError('Notification')
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    })

    log.info(`Notification deleted: ${notificationId}`)
  }

  /**
   * 批量删除通知
   */
  async deleteNotifications(userId: string, notificationIds: string[]) {
    const result = await prisma.notification.deleteMany({
      where: {
        id: { in: notificationIds },
        userId,
      },
    })

    log.info(`Deleted ${result.count} notifications for user: ${userId}`)
    return result
  }

  /**
   * 获取未读通知数量
   */
  async getUnreadCount(userId: string) {
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    })

    return count
  }

  /**
   * 清理旧通知（保留最近 30 天）
   */
  async cleanupOldNotifications(days: number = 30) {
    const date = new Date()
    date.setDate(date.getDate() - days)

    const result = await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: date,
        },
        isRead: true,
      },
    })

    log.info(`Cleaned up ${result.count} old notifications`)
    return result
  }
}

export const notificationService = new NotificationService()

