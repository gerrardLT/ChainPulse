import { Router } from 'express'
import { automationRuleController } from '../controllers/automation-rule.controller'
import { authMiddleware } from '../middleware/auth.middleware'
import { validate, commonSchemas } from '../middleware/validation.middleware'
import { apiLimiter } from '../middleware/rate-limit.middleware'
import { z } from 'zod'

const router = Router()

// 所有自动化规则路由都需要认证
router.use(authMiddleware)
router.use(apiLimiter)

// 验证 schemas
const createRuleSchema = z.object({
  body: z.object({
    smartAccountId: commonSchemas.uuid,
    ruleName: z.string().min(1).max(255),
    description: z.string().max(1000).optional(),
    triggerEventType: z.string().min(1).max(255),
    triggerConditions: z.record(z.any()),
    actionType: z.enum(['transfer', 'swap', 'stake', 'approve', 'custom']),
    actionParams: z.record(z.any()),
  }),
})

const updateRuleSchema = z.object({
  body: z.object({
    ruleName: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).optional(),
    triggerConditions: z.record(z.any()).optional(),
    actionParams: z.record(z.any()).optional(),
    isActive: z.boolean().optional(),
  }),
})

const toggleRuleSchema = z.object({
  body: z.object({
    isActive: z.boolean(),
  }),
})

const testRuleSchema = z.object({
  body: z.object({
    testEvent: z.record(z.any()),
  }),
})

const deleteRulesSchema = z.object({
  body: z.object({
    ids: z.array(commonSchemas.uuid).min(1),
  }),
})

const ruleIdParamSchema = z.object({
  params: z.object({
    id: commonSchemas.uuid,
  }),
})

const getRulesQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    isActive: z.enum(['true', 'false']).optional(),
    smartAccountId: z.string().optional(),
  }),
})

/**
 * @route   POST /api/v1/automation-rules
 * @desc    创建自动化规则
 * @access  Private
 */
router.post(
  '/',
  validate(createRuleSchema),
  automationRuleController.createRule.bind(automationRuleController)
)

/**
 * @route   GET /api/v1/automation-rules
 * @desc    获取用户的自动化规则列表
 * @access  Private
 */
router.get(
  '/',
  validate(getRulesQuerySchema),
  automationRuleController.getRules.bind(automationRuleController)
)

/**
 * @route   DELETE /api/v1/automation-rules
 * @desc    批量删除规则
 * @access  Private
 */
router.delete(
  '/',
  validate(deleteRulesSchema),
  automationRuleController.deleteRules.bind(automationRuleController)
)

/**
 * @route   GET /api/v1/automation-rules/:id
 * @desc    获取单个规则
 * @access  Private
 */
router.get(
  '/:id',
  validate(ruleIdParamSchema),
  automationRuleController.getRule.bind(automationRuleController)
)

/**
 * @route   PATCH /api/v1/automation-rules/:id
 * @desc    更新规则
 * @access  Private
 */
router.patch(
  '/:id',
  validate(ruleIdParamSchema),
  validate(updateRuleSchema),
  automationRuleController.updateRule.bind(automationRuleController)
)

/**
 * @route   DELETE /api/v1/automation-rules/:id
 * @desc    删除规则
 * @access  Private
 */
router.delete(
  '/:id',
  validate(ruleIdParamSchema),
  automationRuleController.deleteRule.bind(automationRuleController)
)

/**
 * @route   POST /api/v1/automation-rules/:id/toggle
 * @desc    启用/禁用规则
 * @access  Private
 */
router.post(
  '/:id/toggle',
  validate(ruleIdParamSchema),
  validate(toggleRuleSchema),
  automationRuleController.toggleRule.bind(automationRuleController)
)

/**
 * @route   GET /api/v1/automation-rules/:id/history
 * @desc    获取规则执行历史
 * @access  Private
 */
router.get(
  '/:id/history',
  validate(ruleIdParamSchema),
  automationRuleController.getRuleHistory.bind(automationRuleController)
)

/**
 * @route   POST /api/v1/automation-rules/:id/test
 * @desc    测试规则条件
 * @access  Private
 */
router.post(
  '/:id/test',
  validate(ruleIdParamSchema),
  validate(testRuleSchema),
  automationRuleController.testRule.bind(automationRuleController)
)

/**
 * @route   POST /api/v1/automation-rules/:id/trigger
 * @desc    手动触发规则执行
 * @access  Private
 */
router.post(
  '/:id/trigger',
  validate(ruleIdParamSchema),
  validate(testRuleSchema),
  automationRuleController.triggerRule.bind(automationRuleController)
)

export default router

