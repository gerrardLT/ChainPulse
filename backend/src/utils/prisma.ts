import { PrismaClient } from '@prisma/client'
import { log } from './logger'

/**
 * Prisma Client 单例（支持热重载）
 * 
 * 🔥 解决开发环境下热重载导致的 "prepared statement already exists" 错误
 * 
 * 核心问题：tsx watch 热重载时会重新执行模块，但 Prisma 连接池仍然存在
 * 解决方案：使用 globalThis 缓存 Prisma Client 实例，并在断开后重新连接
 */

// 扩展 globalThis 类型
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

// 🔥 关键：复用 global 中的实例，避免热重载时重复创建
const getPrismaClient = () => {
  // 如果 global 中已有实例，直接复用（热重载场景）
  if (global.__prisma) {
    if (process.env.NODE_ENV === 'development') {
      log.info('♻️ [Hot Reload] Reusing existing Prisma Client instance')
    }
    return global.__prisma
  }

  // 首次启动或服务重启，创建新实例
  if (process.env.NODE_ENV === 'development') {
    log.info('🔄 [New Instance] Creating Prisma Client...')
  }
  
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['error', 'warn']
      : ['error'],
  })

  // 立即连接数据库
  client.$connect()
    .then(() => {
      log.info('✅ Database connected successfully')
    })
    .catch((error) => {
      log.error('❌ Database connection failed:', error.message)
      process.exit(1)
    })

  // 缓存到 global，供热重载时复用
  global.__prisma = client

  return client
}

// 导出单例
export const prisma = getPrismaClient()

// 优雅关闭
const gracefulShutdown = async (signal: string) => {
  log.info(`${signal} received. Closing database connection...`)
  if (global.__prisma) {
    await global.__prisma.$disconnect()
    global.__prisma = undefined
  }
  log.info('Database disconnected')
  process.exit(0)
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'))
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('beforeExit', async () => {
  if (global.__prisma) {
    await global.__prisma.$disconnect()
  }
})

