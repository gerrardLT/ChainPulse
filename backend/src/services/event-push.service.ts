import { prisma } from '../utils/prisma'
import { getWebSocketManager } from '../websocket'
import { log } from '../utils/logger'
import { ruleEngineService } from './rule-engine.service'

/**
 * 事件推送服务
 * 负责监听新事件、匹配订阅、生成通知并推送
 */
class EventPushService {
  /**
   * 处理新事件并推送通知
   * @param event 事件数据
   */
  async processAndPushEvent(event: {
    contractAddress: string
    eventType: string
    chainId: number
    transactionHash: string
    blockNumber: number
    eventData: any
    timestamp: Date
  }) {
    try {
      log.info(`Processing new event: ${event.eventType} from ${event.contractAddress}`)

      // 1. 查找匹配的订阅
      const matchedSubscriptions = await this.findMatchingSubscriptions(event)

      if (matchedSubscriptions.length === 0) {
        log.info(`No subscriptions found for event: ${event.eventType}`)
        return
      }

      log.info(`Found ${matchedSubscriptions.length} matching subscriptions`)

      // 2. 为每个匹配的订阅生成并推送通知
      for (const subscription of matchedSubscriptions) {
        await this.createAndPushNotification(subscription, event)
      }

      // 3. 触发自动化规则执行
      await this.triggerAutomationRules(event, matchedSubscriptions)
    } catch (error) {
      log.error('Error processing event:', error)
      throw error
    }
  }

  /**
   * 查找匹配的订阅
   */
  private async findMatchingSubscriptions(event: {
    contractAddress: string
    eventType: string
    chainId: number
    eventData: any
  }) {
    // 查找激活的订阅
    const subscriptions = await prisma.eventSubscription.findMany({
      where: {
        isActive: true,
        eventType: event.eventType,
        chainId: event.chainId,
        OR: [
          { contractAddress: event.contractAddress.toLowerCase() },
          { contractAddress: null }, // 监听所有合约
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            walletAddress: true,
            ensName: true,
          },
        },
        smartAccount: {
          select: {
            id: true,
            accountAddress: true,
          },
        },
      },
    })

    // 过滤符合条件的订阅
    return subscriptions.filter((subscription) => {
      // 如果没有过滤条件，直接匹配
      if (!subscription.filterConditions || Object.keys(subscription.filterConditions).length === 0) {
        return true
      }

      // 检查过滤条件
      return this.matchesFilterConditions(event.eventData, subscription.filterConditions as Record<string, any>)
    })
  }

  /**
   * 检查事件数据是否匹配过滤条件
   */
  private matchesFilterConditions(eventData: any, filterConditions: Record<string, any>): boolean {
    try {
      for (const [key, condition] of Object.entries(filterConditions)) {
        const eventValue = eventData[key]

        // 如果条件是对象，进行更复杂的比较
        if (typeof condition === 'object' && condition !== null) {
          // 支持操作符: gt, lt, gte, lte, eq, ne, in, nin
          if ('gt' in condition && !(eventValue > condition.gt)) return false
          if ('lt' in condition && !(eventValue < condition.lt)) return false
          if ('gte' in condition && !(eventValue >= condition.gte)) return false
          if ('lte' in condition && !(eventValue <= condition.lte)) return false
          if ('eq' in condition && eventValue !== condition.eq) return false
          if ('ne' in condition && eventValue === condition.ne) return false
          if ('in' in condition && !condition.in.includes(eventValue)) return false
          if ('nin' in condition && condition.nin.includes(eventValue)) return false
        } else {
          // 简单相等比较
          if (eventValue !== condition) return false
        }
      }
      return true
    } catch (error) {
      log.error('Error matching filter conditions:', error)
      return false
    }
  }

  /**
   * 创建并推送通知
   */
  private async createAndPushNotification(
    subscription: any,
    event: {
      contractAddress: string
      eventType: string
      chainId: number
      transactionHash: string
      blockNumber: number
      eventData: any
      timestamp: Date
    }
  ) {
    try {
      const userId = subscription.userId

      // 1. 创建通知记录
      const notification = await prisma.notification.create({
        data: {
          userId,
          subscriptionId: subscription.id,
          eventType: event.eventType,
          priority: this.calculatePriority(event, subscription),
          title: this.generateNotificationTitle(event, subscription),
          message: this.generateNotificationMessage(event, subscription),
          metadata: {
            contractAddress: event.contractAddress,
            chainId: event.chainId,
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber,
            eventData: event.eventData,
          },
          isRead: false,
        },
      })

      log.info(`Notification created: ${notification.id} for user ${userId}`)

      // 2. 推送到前端（WebSocket）
      await this.pushNotificationToUser(userId, notification)

      // 3. 推送到第三方渠道（Telegram, Discord 等）
      if (subscription.notificationChannels && Array.isArray(subscription.notificationChannels)) {
        await this.pushToThirdPartyChannels(userId, subscription.notificationChannels, notification, event)
      }
    } catch (error) {
      log.error('Error creating and pushing notification:', error)
      throw error
    }
  }

  /**
   * 计算通知优先级
   */
  private calculatePriority(event: any, subscription: any): string {
    // 可以根据事件类型、金额等因素动态计算优先级
    // 默认使用订阅的优先级设置或中等优先级
    return 'medium'
  }

  /**
   * 生成通知标题
   */
  private generateNotificationTitle(event: any, subscription: any): string {
    const eventTypeMap: Record<string, string> = {
      Transfer: '代币转账',
      Approval: '代币授权',
      AccountCreated: '账户创建',
      TransactionExecuted: '交易执行',
      UserOperationEvent: '用户操作',
    }

    return eventTypeMap[event.eventType] || `新事件: ${event.eventType}`
  }

  /**
   * 生成通知消息
   */
  private generateNotificationMessage(event: any, subscription: any): string {
    const { contractAddress, transactionHash, eventData } = event

    let message = `检测到 ${event.eventType} 事件`

    // 根据事件类型生成不同的消息
    if (event.eventType === 'Transfer' && eventData.value) {
      message += `\n金额: ${eventData.value}`
    }

    if (subscription.smartAccount) {
      message += `\n账户: ${subscription.smartAccount.accountAddress}`
    }

    message += `\n合约: ${contractAddress}`
    message += `\nTx: ${transactionHash}`

    return message
  }

  /**
   * 推送通知到用户（WebSocket）
   */
  private async pushNotificationToUser(userId: string, notification: any) {
    try {
      const wsManager = getWebSocketManager()

      // 检查用户是否在线
      if (wsManager.isUserOnline(userId)) {
        wsManager.notifyUser(userId, 'notification', {
          id: notification.id,
          eventType: notification.eventType,
          priority: notification.priority,
          title: notification.title,
          message: notification.message,
          metadata: notification.metadata,
          createdAt: notification.createdAt,
        })
        log.info(`WebSocket notification sent to user ${userId}`)
      } else {
        log.info(`User ${userId} is offline, notification saved to database`)
      }
    } catch (error) {
      log.error('Error pushing notification via WebSocket:', error)
      // 不抛出错误，通知已保存到数据库
    }
  }

  /**
   * 推送到第三方渠道
   */
  private async pushToThirdPartyChannels(
    userId: string,
    channels: string[],
    notification: any,
    event: any
  ) {
    for (const channel of channels) {
      try {
        if (channel === 'telegram') {
          await this.pushToTelegram(userId, notification, event)
        } else if (channel === 'discord') {
          await this.pushToDiscord(userId, notification, event)
        } else if (channel === 'email') {
          await this.pushToEmail(userId, notification, event)
        }
      } catch (error) {
        log.error(`Error pushing to ${channel}:`, error)
        // 不中断流程，继续推送到其他渠道
      }
    }
  }

  /**
   * 推送到 Telegram
   */
  private async pushToTelegram(userId: string, notification: any, event: any) {
    // 查询用户的 Telegram 配置
    const config = await prisma.telegramConfig.findFirst({
      where: { userId, isActive: true },
    })

    if (!config) {
      log.warn(`Telegram config not found for user ${userId}`)
      return
    }

    // TODO: 实现 Telegram Bot API 调用
    log.info(`Telegram notification would be sent to user ${userId}`)
  }

  /**
   * 推送到 Discord
   */
  private async pushToDiscord(userId: string, notification: any, event: any) {
    // 查询用户的 Discord 配置
    const config = await prisma.discordConfig.findFirst({
      where: { userId, isActive: true },
    })

    if (!config || !config.webhookUrl) {
      log.warn(`Discord config not found for user ${userId}`)
      return
    }

    // TODO: 实现 Discord Webhook 调用
    log.info(`Discord notification would be sent to user ${userId}`)
  }

  /**
   * 推送到邮箱
   */
  private async pushToEmail(userId: string, notification: any, event: any) {
    // TODO: 实现邮件发送
    log.info(`Email notification would be sent to user ${userId}`)
  }

  /**
   * 触发自动化规则
   */
  private async triggerAutomationRules(event: any, subscriptions: any[]) {
    try {
      // 获取所有相关用户ID
      const userIds = new Set(subscriptions.map((sub) => sub.userId))

      // 为每个用户触发规则引擎
      for (const userId of userIds) {
        try {
          await ruleEngineService.processEvent({
            userId,
            eventType: event.eventType,
            chainId: event.chainId,
            contractAddress: event.contractAddress,
            eventData: event.eventData,
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber,
          })
        } catch (error) {
          log.error(`Error triggering automation rules for user ${userId}:`, error)
          // 不中断流程，继续处理其他用户
        }
      }
    } catch (error) {
      log.error('Error triggering automation rules:', error)
      // 不抛出错误，规则执行失败不应影响通知推送
    }
  }
}

// 导出单例
export const eventPushService = new EventPushService()

