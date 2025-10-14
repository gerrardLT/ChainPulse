import { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/errors'
import { ResponseFormatter } from '../utils/response'
import { log } from '../utils/logger'

/**
 * 全局错误处理中间件
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 记录错误日志
  log.error(`Error in ${req.method} ${req.path}`, err)

  // 如果是自定义 AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(
      ResponseFormatter.error(err.code, err.message, err.details)
    )
  }

  // Prisma 错误处理
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any
    log.error('Prisma Known Request Error:', {
      code: prismaError.code,
      meta: prismaError.meta,
      message: prismaError.message
    })
    
    return res.status(400).json(
      ResponseFormatter.error(
        'DATABASE_ERROR', 
        process.env.NODE_ENV === 'development' 
          ? `Database error: ${prismaError.message}` 
          : 'Database operation failed',
        process.env.NODE_ENV === 'development' ? { code: prismaError.code } : undefined
      )
    )
  }

  // Prisma 验证错误
  if (err.name === 'PrismaClientValidationError') {
    log.error('Prisma Validation Error:', err.message)
    
    return res.status(400).json(
      ResponseFormatter.error(
        'VALIDATION_ERROR', 
        process.env.NODE_ENV === 'development' 
          ? `Validation error: ${err.message}` 
          : 'Invalid data provided'
      )
    )
  }

  // 默认错误处理
  const statusCode = 500
  const message = process.env.NODE_ENV === 'production'
    ? 'An error occurred'
    : err.message

  return res.status(statusCode).json(
    ResponseFormatter.error('INTERNAL_ERROR', message)
  )
}

/**
 * 404 错误处理中间件
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(404).json(
    ResponseFormatter.error('NOT_FOUND', 'Endpoint not found')
  )
}

