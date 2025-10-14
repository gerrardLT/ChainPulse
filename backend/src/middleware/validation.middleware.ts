import { Request, Response, NextFunction } from 'express'
import { z, ZodSchema } from 'zod'
import { ValidationError } from '../utils/errors'
import { ResponseFormatter } from '../utils/response'

/**
 * Zod 验证中间件
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // 🔥 解析并获取转换后的数据
      const validated = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      })

      // 🔥 将转换后的数据更新回 req 对象
      if (validated.body) req.body = validated.body
      if (validated.query) req.query = validated.query as any
      if (validated.params) req.params = validated.params as any

      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const details = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }))

        return res.status(400).json(
          ResponseFormatter.error(
            'VALIDATION_ERROR',
            'Invalid request data',
            details
          )
        )
      }

      next(error)
    }
  }
}

/**
 * 常用验证 Schema
 */
export const commonSchemas = {
  // UUID 验证
  uuid: z.string().uuid(),

  // 钱包地址验证
  walletAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address format'),

  // 交易哈希验证
  txHash: z
    .string()
    .regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash format'),

  // Chain ID 验证
  chainId: z.number().int().positive(),

  // 分页参数
  pagination: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
  }),

  // 排序参数
  sorting: z.object({
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
}

