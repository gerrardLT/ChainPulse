import { prisma } from '../utils/prisma'
import { log } from '../utils/logger'
import { getWebSocketManager } from '../websocket'

/**
 * 规则执行引擎
 * 负责匹配规则、判断条件、执行操作
 */
class RuleEngineService {
  /**
   * 处理事件并匹配规则
   * @param event 事件数据
   */
  async processEvent(event: {
    userId: string
    eventType: string
    chainId: number
    contractAddress?: string
    eventData: any
    transactionHash: string
    blockNumber: number
  }) {
    try {
      log.info(`[RuleEngine] Processing event: ${event.eventType} for user ${event.userId}`)

      // 1. 查找匹配的规则
      const matchedRules = await this.findMatchingRules(event)

      if (matchedRules.length === 0) {
        log.info(`[RuleEngine] No matching rules for event: ${event.eventType}`)
        return
      }

      log.info(`[RuleEngine] Found ${matchedRules.length} matching rules`)

      // 2. 对每个匹配的规则执行操作
      for (const rule of matchedRules) {
        await this.executeRule(rule, event)
      }
    } catch (error) {
      log.error('[RuleEngine] Error processing event:', error)
      throw error
    }
  }

  /**
   * 查找匹配的规则
   */
  private async findMatchingRules(event: {
    userId: string
    eventType: string
    chainId: number
    contractAddress?: string
    eventData: any
  }) {
    // 查询激活的规则
    const rules = await prisma.automationRule.findMany({
      where: {
        userId: event.userId,
        isActive: true,
        chainId: event.chainId,
      },
      include: {
        smartAccount: true,
      },
    })

    // 过滤符合条件的规则
    const matchedRules = []
    for (const rule of rules) {
      if (await this.checkRuleConditions(rule, event)) {
        matchedRules.push(rule)
      }
    }

    return matchedRules
  }

  /**
   * 检查规则条件是否满足
   */
  private async checkRuleConditions(rule: any, event: any): Promise<boolean> {
    try {
      const triggerConditions = rule.triggerConditions as Record<string, any>

      // 1. 检查事件类型
      if (triggerConditions.eventType) {
        if (event.eventType !== triggerConditions.eventType) {
          return false
        }
      }

      // 2. 检查合约地址
      if (triggerConditions.contractAddress) {
        if (
          !event.contractAddress ||
          event.contractAddress.toLowerCase() !== triggerConditions.contractAddress.toLowerCase()
        ) {
          return false
        }
      }

      // 3. 检查事件数据条件
      if (triggerConditions.conditions && typeof triggerConditions.conditions === 'object') {
        for (const [key, condition] of Object.entries(triggerConditions.conditions)) {
          const eventValue = event.eventData[key]

          // 支持多种条件操作符
          if (typeof condition === 'object' && condition !== null) {
            // gt: 大于
            if ('gt' in condition && !(eventValue > condition.gt)) return false
            // lt: 小于
            if ('lt' in condition && !(eventValue < condition.lt)) return false
            // gte: 大于等于
            if ('gte' in condition && !(eventValue >= condition.gte)) return false
            // lte: 小于等于
            if ('lte' in condition && !(eventValue <= condition.lte)) return false
            // eq: 等于
            if ('eq' in condition && eventValue !== condition.eq) return false
            // ne: 不等于
            if ('ne' in condition && eventValue === condition.ne) return false
            // in: 包含于数组
            if ('in' in condition && !condition.in.includes(eventValue)) return false
            // nin: 不包含于数组
            if ('nin' in condition && condition.nin.includes(eventValue)) return false
          } else {
            // 简单相等比较
            if (eventValue !== condition) return false
          }
        }
      }

      return true
    } catch (error) {
      log.error('[RuleEngine] Error checking rule conditions:', error)
      return false
    }
  }

  /**
   * 执行规则
   */
  private async executeRule(rule: any, event: any) {
    const executionId = `${rule.id}-${Date.now()}`
    
    try {
      log.info(`[RuleEngine] Executing rule: ${rule.name} (${rule.id})`)

      const actionParams = rule.actionParams as Record<string, any>
      const actionType = rule.actionType

      let result: any = null
      let success = true
      let errorMessage: string | null = null

      try {
        // 根据操作类型执行不同的操作
        switch (actionType) {
          case 'transfer':
            result = await this.executeTransfer(rule, actionParams, event)
            break
          case 'approve':
            result = await this.executeApprove(rule, actionParams, event)
            break
          case 'swap':
            result = await this.executeSwap(rule, actionParams, event)
            break
          case 'stake':
            result = await this.executeStake(rule, actionParams, event)
            break
          case 'notify':
            result = await this.executeNotify(rule, actionParams, event)
            break
          default:
            throw new Error(`Unknown action type: ${actionType}`)
        }
      } catch (error: any) {
        success = false
        errorMessage = error.message
        log.error(`[RuleEngine] Rule execution failed: ${error.message}`)
      }

      // 记录执行结果（可选，需要创建 automation_rule_executions 表）
      // await this.recordExecution(executionId, rule.id, event, result, success, errorMessage)

      // 更新规则的执行次数和最后执行时间
      await prisma.automationRule.update({
        where: { id: rule.id },
        data: {
          lastExecutedAt: new Date(),
          executionCount: { increment: 1 },
        },
      })

      // 发送执行结果通知
      await this.notifyExecution(rule, event, result, success, errorMessage)

      log.info(`[RuleEngine] Rule execution completed: ${rule.name} - Success: ${success}`)
    } catch (error) {
      log.error(`[RuleEngine] Fatal error executing rule ${rule.id}:`, error)
    }
  }

  /**
   * 执行转账操作
   */
  private async executeTransfer(rule: any, actionParams: any, event: any) {
    log.info(`[RuleEngine] Executing transfer: ${JSON.stringify(actionParams)}`)

    const { to, amount, token } = actionParams

    // TODO: 集成 Stackup SDK 或智能账户执行
    // 这里需要调用智能账户的 execute 方法
    
    // 示例返回值
    return {
      action: 'transfer',
      to,
      amount,
      token,
      txHash: '0x...', // 需要实际交易哈希
      status: 'pending',
      message: 'Transfer initiated (Stackup SDK integration required)',
    }
  }

  /**
   * 执行授权操作
   */
  private async executeApprove(rule: any, actionParams: any, event: any) {
    log.info(`[RuleEngine] Executing approve: ${JSON.stringify(actionParams)}`)

    const { spender, amount, token } = actionParams

    // TODO: 集成智能合约调用
    
    return {
      action: 'approve',
      spender,
      amount,
      token,
      txHash: '0x...',
      status: 'pending',
      message: 'Approve initiated (Smart contract integration required)',
    }
  }

  /**
   * 执行交换操作
   */
  private async executeSwap(rule: any, actionParams: any, event: any) {
    log.info(`[RuleEngine] Executing swap: ${JSON.stringify(actionParams)}`)

    const { fromToken, toToken, amount } = actionParams

    // TODO: 集成 DEX 协议（Uniswap, etc.）
    
    return {
      action: 'swap',
      fromToken,
      toToken,
      amount,
      txHash: '0x...',
      status: 'pending',
      message: 'Swap initiated (DEX integration required)',
    }
  }

  /**
   * 执行质押操作
   */
  private async executeStake(rule: any, actionParams: any, event: any) {
    log.info(`[RuleEngine] Executing stake: ${JSON.stringify(actionParams)}`)

    const { protocol, amount, token } = actionParams

    // TODO: 集成质押协议
    
    return {
      action: 'stake',
      protocol,
      amount,
      token,
      txHash: '0x...',
      status: 'pending',
      message: 'Stake initiated (Staking protocol integration required)',
    }
  }

  /**
   * 执行通知操作
   */
  private async executeNotify(rule: any, actionParams: any, event: any) {
    log.info(`[RuleEngine] Executing notify: ${JSON.stringify(actionParams)}`)

    const { channels, message } = actionParams

    // 发送通知到数据库
    await prisma.notification.create({
      data: {
        userId: rule.userId,
        eventType: 'automation_rule_executed',
        priority: 'medium',
        title: `规则执行: ${rule.name}`,
        message: message || `自动化规则 "${rule.name}" 已执行`,
        metadata: {
          ruleId: rule.id,
          ruleName: rule.name,
          eventType: event.eventType,
          eventData: event.eventData,
        },
        isRead: false,
      },
    })

    // 推送到 WebSocket
    try {
      const wsManager = getWebSocketManager()
      if (wsManager.isUserOnline(rule.userId)) {
        wsManager.notifyUser(rule.userId, 'rule_executed', {
          ruleId: rule.id,
          ruleName: rule.name,
          message,
        })
      }
    } catch (error) {
      log.error('[RuleEngine] Error sending WebSocket notification:', error)
    }

    return {
      action: 'notify',
      channels,
      message,
      status: 'success',
    }
  }

  /**
   * 发送执行结果通知
   */
  private async notifyExecution(
    rule: any,
    event: any,
    result: any,
    success: boolean,
    errorMessage: string | null
  ) {
    try {
      // 创建执行结果通知
      await prisma.notification.create({
        data: {
          userId: rule.userId,
          eventType: 'automation_execution_result',
          priority: success ? 'low' : 'high',
          title: success ? '规则执行成功' : '规则执行失败',
          message: success
            ? `规则 "${rule.name}" 执行成功`
            : `规则 "${rule.name}" 执行失败: ${errorMessage}`,
          metadata: {
            ruleId: rule.id,
            ruleName: rule.name,
            success,
            result,
            errorMessage,
            eventType: event.eventType,
          },
          isRead: false,
        },
      })

      // WebSocket 推送
      const wsManager = getWebSocketManager()
      if (wsManager.isUserOnline(rule.userId)) {
        wsManager.notifyUser(rule.userId, 'rule_execution_result', {
          ruleId: rule.id,
          ruleName: rule.name,
          success,
          result,
          errorMessage,
        })
      }
    } catch (error) {
      log.error('[RuleEngine] Error sending execution notification:', error)
    }
  }

  /**
   * 手动触发规则执行（用于测试）
   */
  async triggerRule(ruleId: string, userId: string, testEvent?: any) {
    try {
      const rule = await prisma.automationRule.findFirst({
        where: { id: ruleId, userId },
        include: { smartAccount: true },
      })

      if (!rule) {
        throw new Error('Rule not found')
      }

      // 使用测试事件或创建一个虚拟事件
      const event = testEvent || {
        userId,
        eventType: 'manual_trigger',
        chainId: rule.chainId,
        eventData: {},
        transactionHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
        blockNumber: 0,
      }

      await this.executeRule(rule, event)

      return { success: true, message: 'Rule triggered successfully' }
    } catch (error: any) {
      log.error('[RuleEngine] Error triggering rule:', error)
      throw error
    }
  }
}

// 导出单例
export const ruleEngineService = new RuleEngineService()

