import { prisma } from '../utils/prisma'
import { log } from '../utils/logger'

export class StatsService {
  /**
   * 获取用户仪表板统计数据
   */
  async getUserDashboardStats(userId: string) {
    const [
      totalSmartAccounts,
      totalSubscriptions,
      totalNotifications,
      unreadNotifications,
      totalAutomationRules,
      activeAutomationRules,
    ] = await Promise.all([
      prisma.smartAccount.count({ where: { userId } }),
      prisma.eventSubscription.count({ where: { userId } }),
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, isRead: false } }),
      prisma.automationRule.count({ where: { userId } }),
      prisma.automationRule.count({ where: { userId, isActive: true } }),
    ])

    return {
      smartAccounts: {
        total: totalSmartAccounts,
      },
      subscriptions: {
        total: totalSubscriptions,
      },
      notifications: {
        total: totalNotifications,
        unread: unreadNotifications,
      },
      automationRules: {
        total: totalAutomationRules,
        active: activeAutomationRules,
      },
    }
  }

  /**
   * 获取事件统计数据
   */
  async getEventStats(userId: string, chainId?: number, days: number = 7) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // 获取用户的智能账户地址
    const smartAccounts = await prisma.smartAccount.findMany({
      where: {
        userId,
        chainId: chainId || undefined,
      },
      select: { accountAddress: true },
    })

    const accountAddresses = smartAccounts
      .map((a) => a.accountAddress)
      .filter((a): a is string => a !== null)

    if (accountAddresses.length === 0) {
      return {
        totalEvents: 0,
        eventsByDay: [],
        eventsByType: [],
      }
    }

    // 总事件数
    const totalEvents = await prisma.eventsCache.count({
      where: {
        smartAccountAddress: { in: accountAddresses },
        timestamp: { gte: startDate },
      },
    })

    // 按天分组
    const eventsByDay = await prisma.eventsCache.groupBy({
      by: ['timestamp'],
      where: {
        smartAccountAddress: { in: accountAddresses },
        timestamp: { gte: startDate },
      },
      _count: true,
    })

    // 按事件类型分组
    const eventsByType = await prisma.eventsCache.groupBy({
      by: ['eventType'],
      where: {
        smartAccountAddress: { in: accountAddresses },
        timestamp: { gte: startDate },
      },
      _count: true,
    })

    return {
      totalEvents,
      eventsByDay: eventsByDay.map((item) => ({
        date: item.timestamp.toISOString().split('T')[0],
        count: item._count,
      })),
      eventsByType: eventsByType.map((item) => ({
        type: item.eventType,
        count: item._count,
      })),
    }
  }

  /**
   * 获取通知统计数据
   */
  async getNotificationStats(userId: string, days: number = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const [total, unread, byPriority, byChannel] = await Promise.all([
      prisma.notification.count({
        where: { userId, createdAt: { gte: startDate } },
      }),
      prisma.notification.count({
        where: { userId, isRead: false, createdAt: { gte: startDate } },
      }),
      prisma.notification.groupBy({
        by: ['priority'],
        where: { userId, createdAt: { gte: startDate } },
        _count: true,
      }),
      prisma.notification.groupBy({
        by: ['channel'],
        where: { userId, createdAt: { gte: startDate } },
        _count: true,
      }),
    ])

    return {
      total,
      unread,
      byPriority: byPriority.map((item) => ({
        priority: item.priority,
        count: item._count,
      })),
      byChannel: byChannel.map((item) => ({
        channel: item.channel,
        count: item._count,
      })),
    }
  }

  /**
   * 获取智能账户活跃度统计
   */
  async getSmartAccountActivityStats(userId: string, days: number = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const smartAccounts = await prisma.smartAccount.findMany({
      where: { userId },
      select: {
        id: true,
        accountAddress: true,
        ownerAddress: true,
        chainId: true,
      },
    })

    const accountStats = await Promise.all(
      smartAccounts.map(async (account) => {
        if (!account.accountAddress) {
          return {
            accountId: account.id,
            accountAddress: account.accountAddress,
            chainId: account.chainId,
            eventsCount: 0,
            notificationsCount: 0,
            lastActivityAt: null,
          }
        }

        const [eventsCount, notificationsCount, lastEvent] = await Promise.all([
          prisma.eventsCache.count({
            where: {
              smartAccountAddress: account.accountAddress,
              timestamp: { gte: startDate },
            },
          }),
          prisma.notification.count({
            where: {
              userId,
              createdAt: { gte: startDate },
            },
          }),
          prisma.eventsCache.findFirst({
            where: { smartAccountAddress: account.accountAddress },
            orderBy: { timestamp: 'desc' },
            select: { timestamp: true },
          }),
        ])

        return {
          accountId: account.id,
          accountAddress: account.accountAddress,
          chainId: account.chainId,
          eventsCount,
          notificationsCount,
          lastActivityAt: lastEvent?.timestamp || null,
        }
      })
    )

    return accountStats
  }

  /**
   * 获取按链统计的数据
   */
  async getStatsByChain(userId: string) {
    const [accountsByChain, subscriptionsByChain] = await Promise.all([
      prisma.smartAccount.groupBy({
        by: ['chainId'],
        where: { userId },
        _count: true,
      }),
      prisma.eventSubscription.groupBy({
        by: ['chainId'],
        where: { userId, isActive: true },
        _count: true,
      }),
    ])

    const chainStats = accountsByChain.map((item) => {
      const subscriptions = subscriptionsByChain.find(
        (s) => s.chainId === item.chainId
      )

      return {
        chainId: item.chainId,
        smartAccountsCount: item._count,
        subscriptionsCount: subscriptions?._count || 0,
      }
    })

    return chainStats
  }

  /**
   * 获取自动化规则执行统计
   */
  async getAutomationRuleStats(userId: string, days: number = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const rules = await prisma.automationRule.findMany({
      where: { userId },
      select: {
        id: true,
        ruleName: true,
        triggerEventType: true,
        actionType: true,
        isActive: true,
        lastTriggeredAt: true,
        executionCount: true,
      },
    })

    return {
      totalRules: rules.length,
      activeRules: rules.filter((r) => r.isActive).length,
      totalExecutions: rules.reduce((sum, r) => sum + r.executionCount, 0),
      rules: rules.map((rule) => ({
        id: rule.id,
        name: rule.ruleName,
        triggerType: rule.triggerEventType,
        actionType: rule.actionType,
        isActive: rule.isActive,
        lastTriggeredAt: rule.lastTriggeredAt,
        executionCount: rule.executionCount,
      })),
    }
  }

  /**
   * 获取系统健康状态
   */
  async getSystemHealth() {
    try {
      // 测试数据库连接
      await prisma.$queryRaw`SELECT 1`

      const [totalUsers, totalSmartAccounts, totalEvents] = await Promise.all([
        prisma.user.count(),
        prisma.smartAccount.count(),
        prisma.eventsCache.count(),
      ])

      return {
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString(),
        stats: {
          totalUsers,
          totalSmartAccounts,
          totalEvents,
        },
      }
    } catch (error) {
      log.error('System health check failed', { error })
      return {
        status: 'unhealthy',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
        error: 'Database connection failed',
      }
    }
  }
}

export const statsService = new StatsService()

