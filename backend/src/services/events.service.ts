import { prisma } from '../utils/prisma'
import { log } from '../utils/logger'
import { envioClient } from '../lib/envio-client'
import { GET_TRANSACTIONS } from '../lib/envio-queries'

export interface EventsListParams {
  limit?: number
  offset?: number
  timeRange?: '24h' | '7d' | '30d'
  chainId?: number
  contractAddress?: string
  eventType?: string
}

export class EventsService {
  /**
   * 获取事件列表
   * 🔥 优先使用数据库测试数据（开发模式）
   * 💡 如需切换到 Envio，设置环境变量 USE_ENVIO=true
   */
  async getEvents(params: EventsListParams = {}) {
    const {
      limit = 10,
      offset = 0,
      timeRange = '24h',
      chainId,
      contractAddress,
      eventType,
    } = params

    try {
      // 🔥 开发模式：优先使用数据库测试数据
      const useEnvio = process.env.USE_ENVIO === 'true'
      
      if (!useEnvio) {
        log.info('[EventsService] 🧪 Using database test data (USE_ENVIO=false)')
        return await this.getEventsFromDatabase(params)
      }

      // 检查 Envio 客户端是否可用
      if (!envioClient.isAvailable()) {
        log.warn('[EventsService] Envio client not available, falling back to database')
        return await this.getEventsFromDatabase(params)
      }

      // 计算时间范围
      const now = Math.floor(Date.now() / 1000)
      const timeRangeMap = {
        '24h': 24 * 60 * 60,
        '7d': 7 * 24 * 60 * 60,
        '30d': 30 * 24 * 60 * 60,
      }
      const startTimestamp = now - timeRangeMap[timeRange]

      // 构建 GraphQL 查询条件
      const where: any = {
        timestamp_gte: startTimestamp.toString(),
      }

      if (chainId) {
        where.chainId = chainId
      }

      if (contractAddress) {
        where.target = contractAddress.toLowerCase()
      }

      // 🔥 查询 Envio GraphQL
      const client = envioClient.getClient()
      const { data, errors } = await client.query({
        query: GET_TRANSACTIONS,
        variables: {
          first: limit,
          skip: offset,
          where,
          orderBy: 'timestamp',
          orderDirection: 'desc',
        },
      })

      if (errors && errors.length > 0) {
        log.error('[EventsService] Envio GraphQL errors:', errors)
        // 如果 GraphQL 查询失败，回退到数据库
        return await this.getEventsFromDatabase(params)
      }

      const transactions = data?.transactions || []

      log.debug(`[EventsService] Retrieved ${transactions.length} transactions from Envio`)

      // 🔥 转换 Envio 数据格式为 events_cache 格式
      const events = transactions.map((tx: any) => ({
        id: tx.id,
        chainId: tx.chainId,
        contractAddress: tx.smartAccount?.accountAddress || tx.target,
        eventType: tx.success ? 'Transaction' : 'TransactionFailed',
        transactionHash: tx.transactionHash,
        blockNumber: Number(tx.blockNumber),
        blockTimestamp: new Date(Number(tx.timestamp) * 1000),
        data: {
          target: tx.target,
          value: tx.value,
          gasUsed: tx.gasUsed,
          success: tx.success,
          smartAccount: tx.smartAccount?.accountAddress,
          owner: tx.smartAccount?.owner,
        },
        createdAt: new Date(Number(tx.timestamp) * 1000),
      }))

      // 客户端过滤（如果需要）
      let filteredEvents = events
      if (eventType) {
        filteredEvents = events.filter((e: any) => e.eventType === eventType)
      }

      return {
        events: filteredEvents,
        pagination: {
          total: filteredEvents.length, // 注意：Envio 不直接提供总数，这里是近似值
          limit,
          offset,
          hasMore: filteredEvents.length === limit,
        },
      }
    } catch (error) {
      log.error('[EventsService] Failed to get events from Envio, falling back to database:', error)
      // 如果 Envio 查询失败，回退到数据库
      return await this.getEventsFromDatabase(params)
    }
  }

  /**
   * 从数据库获取事件（回退方案）
   */
  private async getEventsFromDatabase(params: EventsListParams = {}) {
    const {
      limit = 10,
      offset = 0,
      timeRange = '24h',
      chainId,
      contractAddress,
      eventType,
    } = params

    // 计算时间范围
    const now = new Date()
    const timeRangeMap = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    }
    const startTime = new Date(now.getTime() - timeRangeMap[timeRange])

    // 构建查询条件
    const where: any = {
      blockTimestamp: {
        gte: startTime,
      },
    }

    if (chainId) {
      where.chainId = chainId
    }

    if (contractAddress) {
      where.contractAddress = contractAddress.toLowerCase()
    }

    if (eventType) {
      where.eventType = eventType
    }

    try {
      const [events, total] = await Promise.all([
        prisma.eventsCache.findMany({
          where,
          take: limit,
          skip: offset,
          orderBy: {
            blockTimestamp: 'desc',
          },
        }),
        prisma.eventsCache.count({ where }),
      ])

      log.debug(`[EventsService] Retrieved ${events.length} events from database`)

      return {
        events: events.map((event) => ({
          id: event.id,
          chainId: event.chainId,
          contractAddress: event.contractAddress,
          eventType: event.eventType,
          transactionHash: event.transactionHash,
          blockNumber: Number(event.blockNumber),
          blockTimestamp: event.blockTimestamp,
          data: event.data,
          createdAt: event.createdAt,
        })),
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + events.length < total,
        },
      }
    } catch (error) {
      log.error('[EventsService] Failed to get events from database:', error)
      throw error
    }
  }

  /**
   * 根据 ID 获取单个事件
   */
  async getEventById(id: string) {
    try {
      // 先尝试从数据库获取
      const event = await prisma.eventsCache.findUnique({
        where: { id },
      })

      if (event) {
        return {
          id: event.id,
          chainId: event.chainId,
          contractAddress: event.contractAddress,
          eventType: event.eventType,
          transactionHash: event.transactionHash,
          blockNumber: Number(event.blockNumber),
          blockTimestamp: event.blockTimestamp,
          data: event.data,
          createdAt: event.createdAt,
        }
      }

      // 如果数据库中没有，尝试从 Envio 获取
      // TODO: 实现从 Envio 获取单个交易的逻辑

      return null
    } catch (error) {
      log.error(`[EventsService] Failed to get event ${id}:`, error)
      throw error
    }
  }

  /**
   * 获取事件统计
   */
  async getEventStats(timeRange: '24h' | '7d' | '30d' = '24h') {
    const now = new Date()
    const timeRangeMap = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    }
    const startTime = new Date(now.getTime() - timeRangeMap[timeRange])

    try {
      // 优先使用数据库统计（性能更好）
      const totalEvents = await prisma.eventsCache.count({
        where: {
          blockTimestamp: {
            gte: startTime,
          },
        },
      })

      const eventsByType = await prisma.eventsCache.groupBy({
        by: ['eventType'],
        where: {
          blockTimestamp: {
            gte: startTime,
          },
        },
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
        take: 10,
      })

      return {
        totalEvents,
        eventsByType: eventsByType.map((item) => ({
          eventType: item.eventType,
          count: item._count.id,
        })),
      }
    } catch (error) {
      log.error('[EventsService] Failed to get event stats:', error)
      throw error
    }
  }
}

export const eventsService = new EventsService()
