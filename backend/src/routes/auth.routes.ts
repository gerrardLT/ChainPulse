import { Router } from 'express'
import { authController } from '../controllers/auth.controller'
import { validate, commonSchemas } from '../middleware/validation.middleware'
import { authLimiter } from '../middleware/rate-limit.middleware'
import { authMiddleware } from '../middleware/auth.middleware'
import { z } from 'zod'

const router = Router()

// 验证 schemas
const getMessageSchema = z.object({
  body: z.object({
    walletAddress: commonSchemas.walletAddress,
  }),
})

const verifySignatureSchema = z.object({
  body: z.object({
    walletAddress: commonSchemas.walletAddress,
    message: z.string().min(1),
    signature: z.string().regex(/^0x[a-fA-F0-9]+$/, 'Invalid signature format'),
  }),
})

/**
 * @route   POST /api/v1/auth/message
 * @desc    获取签名消息
 * @access  Public
 */
router.post(
  '/message',
  authLimiter,
  validate(getMessageSchema),
  authController.getMessage.bind(authController)
)

/**
 * @route   POST /api/v1/auth/verify
 * @desc    验证签名并登录
 * @access  Public
 */
router.post(
  '/verify',
  authLimiter,
  validate(verifySignatureSchema),
  authController.verifySignature.bind(authController)
)

/**
 * @route   GET /api/v1/auth/me
 * @desc    获取当前用户信息
 * @access  Private
 */
router.get(
  '/me',
  authMiddleware,
  authController.getMe.bind(authController)
)

/**
 * @route   POST /api/v1/auth/logout
 * @desc    退出登录
 * @access  Private
 */
router.post(
  '/logout',
  authMiddleware,
  authController.logout.bind(authController)
)

export default router

