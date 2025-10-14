import { Request, Response, NextFunction } from 'express'
import { log } from '../utils/logger'

/**
 * HTTP 请求日志中间件
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now()

  // 请求完成后记录
  res.on('finish', () => {
    const duration = Date.now() - start
    const { method, originalUrl, ip } = req
    const { statusCode } = res

    const level = statusCode >= 400 ? 'error' : 'info'
    const message = `${method} ${originalUrl} ${statusCode} ${duration}ms - ${ip}`

    if (level === 'error') {
      log.error(message)
    } else {
      log.info(message)
    }
  })

  next()
}

