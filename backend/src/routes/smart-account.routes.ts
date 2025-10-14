import { Router } from 'express'
import { smartAccountController } from '../controllers/smart-account.controller'
import { authMiddleware } from '../middleware/auth.middleware'
import { validate, commonSchemas } from '../middleware/validation.middleware'
import { apiLimiter } from '../middleware/rate-limit.middleware'
import { z } from 'zod'

const router = Router()

// 所有智能账户路由都需要认证
router.use(authMiddleware)
router.use(apiLimiter)

// 验证 schemas
const createSmartAccountSchema = z.object({
  body: z.object({
    ownerAddress: commonSchemas.walletAddress,
    chainId: z.number().int().positive(),
    accountType: z.enum(['erc4337', 'safe', 'custom']).optional(),
    accountAddress: commonSchemas.walletAddress.optional(),
  }),
})

const updateSmartAccountSchema = z.object({
  body: z.object({
    accountAddress: commonSchemas.walletAddress.optional(),
    isDeployed: z.boolean().optional(),
    deploymentTxHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/).optional(),
    balance: z.string().optional(),
  }),
})

const markAsDeployedSchema = z.object({
  body: z.object({
    txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
    accountAddress: commonSchemas.walletAddress,
  }),
})

const smartAccountIdParamSchema = z.object({
  params: z.object({
    id: commonSchemas.uuid,
  }),
})

const walletAddressParamSchema = z.object({
  params: z.object({
    address: commonSchemas.walletAddress,
  }),
})

const getSmartAccountsQuerySchema = z.object({
  query: z.object({
    chainId: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  }),
})

/**
 * @route   POST /api/v1/smart-accounts
 * @desc    创建智能账户
 * @access  Private
 */
router.post(
  '/',
  validate(createSmartAccountSchema),
  smartAccountController.createSmartAccount.bind(smartAccountController)
)

/**
 * @route   GET /api/v1/smart-accounts
 * @desc    获取用户的智能账户列表
 * @access  Private
 */
router.get(
  '/',
  validate(getSmartAccountsQuerySchema),
  smartAccountController.getSmartAccounts.bind(smartAccountController)
)

/**
 * @route   GET /api/v1/smart-accounts/address/:address
 * @desc    根据地址获取智能账户
 * @access  Private
 */
router.get(
  '/address/:address',
  validate(walletAddressParamSchema),
  smartAccountController.getSmartAccountByAddress.bind(smartAccountController)
)

/**
 * @route   GET /api/v1/smart-accounts/:id
 * @desc    获取智能账户详情
 * @access  Private
 */
router.get(
  '/:id',
  validate(smartAccountIdParamSchema),
  smartAccountController.getSmartAccount.bind(smartAccountController)
)

/**
 * @route   PATCH /api/v1/smart-accounts/:id
 * @desc    更新智能账户信息
 * @access  Private
 */
router.patch(
  '/:id',
  validate(smartAccountIdParamSchema),
  validate(updateSmartAccountSchema),
  smartAccountController.updateSmartAccount.bind(smartAccountController)
)

/**
 * @route   DELETE /api/v1/smart-accounts/:id
 * @desc    删除智能账户
 * @access  Private
 */
router.delete(
  '/:id',
  validate(smartAccountIdParamSchema),
  smartAccountController.deleteSmartAccount.bind(smartAccountController)
)

/**
 * @route   GET /api/v1/smart-accounts/:id/stats
 * @desc    获取智能账户统计信息
 * @access  Private
 */
router.get(
  '/:id/stats',
  validate(smartAccountIdParamSchema),
  smartAccountController.getSmartAccountStats.bind(smartAccountController)
)

/**
 * @route   POST /api/v1/smart-accounts/:id/deploy
 * @desc    标记智能账户为已部署
 * @access  Private
 */
router.post(
  '/:id/deploy',
  validate(smartAccountIdParamSchema),
  validate(markAsDeployedSchema),
  smartAccountController.markAsDeployed.bind(smartAccountController)
)

export default router

