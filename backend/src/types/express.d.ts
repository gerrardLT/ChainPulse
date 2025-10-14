import { Request } from 'express'

/**
 * 扩展 Express Request 类型
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string
        walletAddress: string
        iat?: number
        exp?: number
      }
    }
  }
}

export {}

