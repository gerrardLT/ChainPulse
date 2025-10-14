import { Router } from 'express'
import { userController } from '../controllers/user.controller'
import { authMiddleware } from '../middleware/auth.middleware'
import { validate, commonSchemas } from '../middleware/validation.middleware'
import { apiLimiter } from '../middleware/rate-limit.middleware'
import { z } from 'zod'

const router = Router()

// 验证 schemas
const updateUserSchema = z.object({
  body: z.object({
    ensName: z.string().max(255).optional(),
    avatarUrl: z.string().url().max(512).optional(),
    email: z.string().email().max(255).optional(),
  }),
})

const walletAddressParamSchema = z.object({
  params: z.object({
    walletAddress: commonSchemas.walletAddress,
  }),
})

/**
 * @route   GET /api/v1/users/me
 * @desc    获取当前用户信息
 * @access  Private
 */
router.get(
  '/me',
  authMiddleware,
  apiLimiter,
  userController.getMe.bind(userController)
)

/**
 * @route   PATCH /api/v1/users/me
 * @desc    更新当前用户信息
 * @access  Private
 */
router.patch(
  '/me',
  authMiddleware,
  apiLimiter,
  validate(updateUserSchema),
  userController.updateMe.bind(userController)
)

/**
 * @route   GET /api/v1/users/me/stats
 * @desc    获取用户统计信息
 * @access  Private
 */
router.get(
  '/me/stats',
  authMiddleware,
  apiLimiter,
  userController.getMyStats.bind(userController)
)

/**
 * @route   DELETE /api/v1/users/me
 * @desc    删除账户
 * @access  Private
 */
router.delete(
  '/me',
  authMiddleware,
  apiLimiter,
  userController.deleteMe.bind(userController)
)

/**
 * @route   GET /api/v1/users/:walletAddress
 * @desc    根据钱包地址获取用户信息（公开）
 * @access  Public
 */
router.get(
  '/:walletAddress',
  apiLimiter,
  validate(walletAddressParamSchema),
  userController.getUserByWallet.bind(userController)
)

export default router

