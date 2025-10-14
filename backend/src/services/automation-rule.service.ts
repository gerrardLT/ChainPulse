import { prisma } from '../utils/prisma'
import { NotFoundError, ValidationError } from '../utils/errors'
import { log } from '../utils/logger'

interface CreateAutomationRuleDto {
  smartAccountId: string
  ruleName: string
  description?: string
  triggerEventType: string
  triggerConditions: any
  actionType: string
  actionParams: any
}

interface UpdateAutomationRuleDto {
  ruleName?: string
  description?: string
  triggerConditions?: any
  actionParams?: any
  isActive?: boolean
}

export class AutomationRuleService {
  /**
   * 创建自动化规则
   */
  async createRule(userId: string, data: CreateAutomationRuleDto) {
    // 验证智能账户是否属于该用户
    const smartAccount = await prisma.smartAccount.findFirst({
      where: {
        id: data.smartAccountId,
        userId,
      },
    })

    if (!smartAccount) {
      throw new ValidationError('Smart account not found or not owned by user')
    }

    const rule = await prisma.automationRule.create({
      data: {
        userId,
        smartAccountId: data.smartAccountId,
        ruleName: data.ruleName,
        description: data.description,
        triggerEventType: data.triggerEventType,
        triggerConditions: data.triggerConditions,
        actionType: data.actionType,
        actionParams: data.actionParams,
        executionCount: 0,
      },
    })

    log.info(`Automation rule created: ${rule.id}`)
    return rule
  }

  /**
   * 获取用户的自动化规则列表
   */
  async getUserRules(
    userId: string,
    options: {
      page?: number
      limit?: number
      isActive?: boolean
      smartAccountId?: string
    } = {}
  ) {
    const { page = 1, limit = 20, isActive, smartAccountId } = options
    const skip = (page - 1) * limit

    const where: any = { userId }
    if (isActive !== undefined) {
      where.isActive = isActive
    }
    if (smartAccountId) {
      where.smartAccountId = smartAccountId
    }

    const [rules, total] = await Promise.all([
      prisma.automationRule.findMany({
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
      prisma.automationRule.count({ where }),
    ])

    return {
      rules,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * 根据 ID 获取规则
   */
  async getRuleById(ruleId: string, userId: string) {
    const rule = await prisma.automationRule.findFirst({
      where: {
        id: ruleId,
        userId,
      },
      include: {
        smartAccount: true,
      },
    })

    if (!rule) {
      throw new NotFoundError('Automation rule')
    }

    return rule
  }

  /**
   * 更新规则
   */
  async updateRule(ruleId: string, userId: string, data: UpdateAutomationRuleDto) {
    const existing = await prisma.automationRule.findFirst({
      where: {
        id: ruleId,
        userId,
      },
    })

    if (!existing) {
      throw new NotFoundError('Automation rule')
    }

    const rule = await prisma.automationRule.update({
      where: { id: ruleId },
      data: {
        ruleName: data.ruleName,
        description: data.description,
        triggerConditions: data.triggerConditions,
        actionParams: data.actionParams,
        isActive: data.isActive,
      },
    })

    log.info(`Automation rule updated: ${rule.id}`)
    return rule
  }

  /**
   * 删除规则
   */
  async deleteRule(ruleId: string, userId: string) {
    const rule = await prisma.automationRule.findFirst({
      where: {
        id: ruleId,
        userId,
      },
    })

    if (!rule) {
      throw new NotFoundError('Automation rule')
    }

    await prisma.automationRule.delete({
      where: { id: ruleId },
    })

    log.info(`Automation rule deleted: ${ruleId}`)
  }

  /**
   * 启用/禁用规则
   */
  async toggleRule(ruleId: string, userId: string, isActive: boolean) {
    const existing = await prisma.automationRule.findFirst({
      where: {
        id: ruleId,
        userId,
      },
    })

    if (!existing) {
      throw new NotFoundError('Automation rule')
    }

    const rule = await prisma.automationRule.update({
      where: { id: ruleId },
      data: { isActive },
    })

    log.info(`Automation rule ${isActive ? 'enabled' : 'disabled'}: ${ruleId}`)
    return rule
  }

  /**
   * 更新规则执行统计
   */
  async updateExecutionStats(ruleId: string) {
    const rule = await prisma.automationRule.update({
      where: { id: ruleId },
      data: {
        executionCount: { increment: 1 },
        lastTriggeredAt: new Date(),
      },
    })

    log.info(`Automation rule executed: ${ruleId}`)
    return rule
  }

  /**
   * 获取规则执行历史
   */
  async getRuleExecutionHistory(
    ruleId: string,
    userId: string
    // options: {
    //   page?: number
    //   limit?: number
    // } = {}
  ) {
    // const { page = 1, limit = 20 } = options
    // const skip = (page - 1) * limit

    // 验证规则是否属于该用户
    const rule = await prisma.automationRule.findFirst({
      where: {
        id: ruleId,
        userId,
      },
    })

    if (!rule) {
      throw new NotFoundError('Automation rule')
    }

    // TODO: 实现执行历史记录表
    // 目前返回基本统计信息
    return {
      ruleId,
      ruleName: rule.ruleName,
      executionCount: rule.executionCount,
      lastTriggeredAt: rule.lastTriggeredAt,
      history: [], // 待实现详细历史记录
    }
  }

  /**
   * 批量删除规则
   */
  async deleteRules(userId: string, ruleIds: string[]) {
    const result = await prisma.automationRule.deleteMany({
      where: {
        id: { in: ruleIds },
        userId,
      },
    })

    log.info(`Deleted ${result.count} automation rules for user: ${userId}`)
    return result
  }

  /**
   * 获取智能账户的规则列表
   */
  async getSmartAccountRules(smartAccountId: string, userId: string) {
    // 验证智能账户是否属于该用户
    const smartAccount = await prisma.smartAccount.findFirst({
      where: {
        id: smartAccountId,
        userId,
      },
    })

    if (!smartAccount) {
      throw new ValidationError('Smart account not found or not owned by user')
    }

    const rules = await prisma.automationRule.findMany({
      where: {
        smartAccountId,
        userId,
      },
      orderBy: { createdAt: 'desc' },
    })

    return rules
  }

  /**
   * 测试规则条件匹配
   */
  async testRuleCondition(ruleId: string, userId: string, testEvent: any) {
    const rule = await prisma.automationRule.findFirst({
      where: {
        id: ruleId,
        userId,
      },
    })

    if (!rule) {
      throw new NotFoundError('Automation rule')
    }

    // TODO: 实现条件匹配逻辑
    // 这里需要根据 triggerConditions 和 testEvent 进行匹配
    const matched = this.evaluateConditions(
      rule.triggerConditions,
      testEvent
    )

    return {
      ruleId: rule.id,
      ruleName: rule.ruleName,
      matched,
      testEvent,
      triggerConditions: rule.triggerConditions,
    }
  }

  /**
   * 条件评估逻辑（简化版）
   */
  private evaluateConditions(conditions: any, event: any): boolean {
    // 简化的条件匹配逻辑
    // 实际实现需要更复杂的条件评估引擎
    try {
      if (!conditions || typeof conditions !== 'object') {
        return true
      }

      for (const [key, value] of Object.entries(conditions)) {
        if (event[key] !== value) {
          return false
        }
      }

      return true
    } catch (error) {
      log.error('Error evaluating conditions', { error, conditions, event })
      return false
    }
  }
}

export const automationRuleService = new AutomationRuleService()

