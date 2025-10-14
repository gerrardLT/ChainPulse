import rateLimit from 'express-rate-limit'
import { ResponseFormatter } from '../utils/response'

/**
 * 认证相关接口限流（更严格）
 */
export const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 分钟
  max: process.env.NODE_ENV === 'production' ? 10 : 50, // 开发环境 50 次，生产环境 10 次
  standardHeaders: true,
  legacyHeaders: false,
  message: ResponseFormatter.error(
    'RATE_LIMIT_EXCEEDED',
    'Too many requests, please try again later'
  ),
})

/**
 * 通用 API 限流
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: process.env.NODE_ENV === 'production' ? 300 : 2000, // 开发环境 2000 次，生产环境 300 次
  standardHeaders: true,
  legacyHeaders: false,
  message: ResponseFormatter.error(
    'RATE_LIMIT_EXCEEDED',
    'Too many requests, please try again later'
  ),
})

/**
 * 创建自定义限流器
 */
export const createLimiter = (windowMs: number, max: number) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: ResponseFormatter.error(
      'RATE_LIMIT_EXCEEDED',
      'Too many requests, please try again later'
    ),
  })
}

