import { prisma } from '../utils/prisma'
import { NotFoundError, ValidationError } from '../utils/errors'
import { log } from '../utils/logger'
import { CreateSubscriptionDto, UpdateSubscriptionDto } from '../types'

export class SubscriptionService {
  /**
   * 创建事件订阅
   */
  async createSubscription(userId: string, data: CreateSubscriptionDto) {
    // 检查是否已存在相同的订阅
    const existing = await prisma.eventSubscription.findFirst({
      where: {
        userId,
        smartAccountId: data.smartAccountId,
        contractAddress: data.contractAddress?.toLowerCase(),
        eventType: data.eventType,
        isActive: true,
      },
    })

    if (existing) {
      throw new ValidationError('Subscription already exists')
    }

    // 检查智能账户是否属于该用户
    if (data.smartAccountId) {
      const smartAccount = await prisma.smartAccount.findFirst({
        where: {
          id: data.smartAccountId,
          userId,
        },
      })

      if (!smartAccount) {
        throw new ValidationError('Smart account not found or not owned by user')
      }
    }

    const subscription = await prisma.eventSubscription.create({
      data: {
        userId,
        smartAccountId: data.smartAccountId,
        contractAddress: data.contractAddress?.toLowerCase() || null,
        eventType: data.eventType,
        chainId: data.chainId,
        filterConditions: data.filterConditions || {},
        notificationChannels: data.notificationChannels || ['web'],
      },
    })

    log.info(`Event subscription created: ${subscription.id}`)
    return subscription
  }

  /**
   * 获取用户的订阅列表
   */
  async getUserSubscriptions(
    userId: string,
    options: {
      page?: number
      limit?: number
      isActive?: boolean
      chainId?: number
      smartAccountId?: string
    } = {}
  ) {
    const { page = 1, limit = 20, isActive, chainId, smartAccountId } = options
    const skip = (page - 1) * limit

    const where: any = { userId }
    if (isActive !== undefined) {
      where.isActive = isActive
    }
    if (chainId) {
      where.chainId = chainId
    }
    if (smartAccountId) {
      where.smartAccountId = smartAccountId
    }

    const [subscriptions, total] = await Promise.all([
      prisma.eventSubscription.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          smartAccount: {
            select: {
              id: true,
              accountAddress: true,
              ownerAddress: true,
              chainId: true,
            },
          },
        },
      }),
      prisma.eventSubscription.count({ where }),
    ])

    return {
      subscriptions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * 根据 ID 获取订阅
   */
  async getSubscriptionById(subscriptionId: string, userId: string) {
    const subscription = await prisma.eventSubscription.findFirst({
      where: {
        id: subscriptionId,
        userId,
      },
      include: {
        smartAccount: true,
      },
    })

    if (!subscription) {
      throw new NotFoundError('Subscription')
    }

    return subscription
  }

  /**
   * 更新订阅
   */
  async updateSubscription(
    subscriptionId: string,
    userId: string,
    data: UpdateSubscriptionDto
  ) {
    const existing = await prisma.eventSubscription.findFirst({
      where: {
        id: subscriptionId,
        userId,
      },
    })

    if (!existing) {
      throw new NotFoundError('Subscription')
    }

    const subscription = await prisma.eventSubscription.update({
      where: { id: subscriptionId },
      data: {
        filterConditions: data.filterConditions,
        notificationChannels: data.notificationChannels,
        isActive: data.isActive,
      },
    })

    log.info(`Event subscription updated: ${subscription.id}`)
    return subscription
  }

  /**
   * 删除订阅
   */
  async deleteSubscription(subscriptionId: string, userId: string) {
    const subscription = await prisma.eventSubscription.findFirst({
      where: {
        id: subscriptionId,
        userId,
      },
    })

    if (!subscription) {
      throw new NotFoundError('Subscription')
    }

    await prisma.eventSubscription.delete({
      where: { id: subscriptionId },
    })

    log.info(`Event subscription deleted: ${subscriptionId}`)
  }

  /**
   * 启用/禁用订阅
   */
  async toggleSubscription(subscriptionId: string, userId: string, isActive: boolean) {
    const existing = await prisma.eventSubscription.findFirst({
      where: {
        id: subscriptionId,
        userId,
      },
    })

    if (!existing) {
      throw new NotFoundError('Subscription')
    }

    const subscription = await prisma.eventSubscription.update({
      where: { id: subscriptionId },
      data: { isActive },
    })

    log.info(`Event subscription ${isActive ? 'enabled' : 'disabled'}: ${subscriptionId}`)
    return subscription
  }

  /**
   * 批量删除订阅
   */
  async deleteSubscriptions(userId: string, subscriptionIds: string[]) {
    const result = await prisma.eventSubscription.deleteMany({
      where: {
        id: { in: subscriptionIds },
        userId,
      },
    })

    log.info(`Deleted ${result.count} subscriptions for user: ${userId}`)
    return result
  }

  /**
   * 获取订阅统计信息
   */
  async getSubscriptionStats(userId: string) {
    const [total, active, byChain] = await Promise.all([
      prisma.eventSubscription.count({ where: { userId } }),
      prisma.eventSubscription.count({ where: { userId, isActive: true } }),
      prisma.eventSubscription.groupBy({
        by: ['chainId'],
        where: { userId, isActive: true },
        _count: true,
      }),
    ])

    return {
      total,
      active,
      byChain: byChain.map((item) => ({
        chainId: item.chainId,
        count: item._count,
      })),
    }
  }
}

export const subscriptionService = new SubscriptionService()

