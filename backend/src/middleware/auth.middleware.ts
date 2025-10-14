import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AuthenticationError } from '../utils/errors'
import { ResponseFormatter } from '../utils/response'

/**
 * JWT 认证中间件
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 获取 token
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided')
    }

    const token = authHeader.replace('Bearer ', '')

    // 验证 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string
      walletAddress: string
      iat?: number
      exp?: number
    }

    // 将用户信息附加到请求对象
    req.user = decoded

    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json(
        ResponseFormatter.error('INVALID_TOKEN', 'Invalid or expired token')
      )
    }

    if (error instanceof AuthenticationError) {
      return res.status(401).json(
        ResponseFormatter.error(error.code, error.message)
      )
    }

    return res.status(500).json(
      ResponseFormatter.error('INTERNAL_ERROR', 'Authentication failed')
    )
  }
}

/**
 * 可选认证中间件（不强制要求 token）
 */
export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '')
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string
        walletAddress: string
      }
      req.user = decoded
    }
    next()
  } catch (error) {
    // 忽略错误，继续执行
    next()
  }
}

