import { Request, Response, NextFunction } from 'express'
import { automationRuleService } from '../services/automation-rule.service'
import { ruleEngineService } from '../services/rule-engine.service'
import { ResponseFormatter } from '../utils/response'

export class AutomationRuleController {
  /**
   * 创建自动化规则
   * POST /api/v1/automation-rules
   */
  async createRule(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const {
        smartAccountId,
        ruleName,
        description,
        triggerEventType,
        triggerConditions,
        actionType,
        actionParams,
      } = req.body

      const rule = await automationRuleService.createRule(userId, {
        smartAccountId,
        ruleName,
        description,
        triggerEventType,
        triggerConditions,
        actionType,
        actionParams,
      })

      return res.status(201).json(ResponseFormatter.success(rule))
    } catch (error) {
      next(error)
    }
  }

  /**
   * 获取用户的自动化规则列表
   * GET /api/v1/automation-rules
   */
  async getRules(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const { page, limit, isActive, smartAccountId } = req.query

      const result = await automationRuleService.getUserRules(userId, {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        smartAccountId: smartAccountId as string,
      })

      return res.status(200).json(
        ResponseFormatter.success(result.rules, result.pagination)
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * 获取单个规则
   * GET /api/v1/automation-rules/:id
   */
  async getRule(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const { id } = req.params

      const rule = await automationRuleService.getRuleById(id, userId)

      return res.status(200).json(ResponseFormatter.success(rule))
    } catch (error) {
      next(error)
    }
  }

  /**
   * 更新规则
   * PATCH /api/v1/automation-rules/:id
   */
  async updateRule(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const { id } = req.params
      const { ruleName, description, triggerConditions, actionParams, isActive } =
        req.body

      const rule = await automationRuleService.updateRule(id, userId, {
        ruleName,
        description,
        triggerConditions,
        actionParams,
        isActive,
      })

      return res.status(200).json(ResponseFormatter.success(rule))
    } catch (error) {
      next(error)
    }
  }

  /**
   * 删除规则
   * DELETE /api/v1/automation-rules/:id
   */
  async deleteRule(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const { id } = req.params

      await automationRuleService.deleteRule(id, userId)

      return res.status(200).json(
        ResponseFormatter.success({ message: 'Automation rule deleted successfully' })
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * 启用/禁用规则
   * POST /api/v1/automation-rules/:id/toggle
   */
  async toggleRule(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const { id } = req.params
      const { isActive } = req.body

      const rule = await automationRuleService.toggleRule(id, userId, isActive)

      return res.status(200).json(ResponseFormatter.success(rule))
    } catch (error) {
      next(error)
    }
  }

  /**
   * 批量删除规则
   * DELETE /api/v1/automation-rules
   */
  async deleteRules(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const { ids } = req.body

      const result = await automationRuleService.deleteRules(userId, ids)

      return res.status(200).json(
        ResponseFormatter.success({
          message: `Deleted ${result.count} automation rules`,
          count: result.count,
        })
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * 获取规则执行历史
   * GET /api/v1/automation-rules/:id/history
   */
  async getRuleHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const { id } = req.params

      const history = await automationRuleService.getRuleExecutionHistory(id, userId)

      return res.status(200).json(ResponseFormatter.success(history))
    } catch (error) {
      next(error)
    }
  }

  /**
   * 测试规则条件
   * POST /api/v1/automation-rules/:id/test
   */
  async testRule(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const { id } = req.params
      const { testEvent } = req.body

      const result = await automationRuleService.testRuleCondition(
        id,
        userId,
        testEvent
      )

      return res.status(200).json(ResponseFormatter.success(result))
    } catch (error) {
      next(error)
    }
  }

  /**
   * 手动触发规则执行（用于测试）
   * POST /api/v1/automation-rules/:id/trigger
   */
  async triggerRule(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const userId = req.user!.userId
      const testEvent = req.body.testEvent

      const result = await ruleEngineService.triggerRule(id, userId, testEvent)

      return res.status(200).json(ResponseFormatter.success(result))
    } catch (error) {
      next(error)
    }
  }
}

export const automationRuleController = new AutomationRuleController()

