import { Request, Response, NextFunction } from 'express'
import { eventsService } from '../services/events.service'
import { ResponseFormatter } from '../utils/response'

export class EventsController {
  /**
   * 获取事件列表
   * GET /api/v1/events
   */
  async getEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        limit,
        offset,
        timeRange,
        chainId,
        contractAddress,
        eventType,
      } = req.query

      console.log('[EventsController] Getting events with params:', {
        limit,
        offset,
        timeRange,
        chainId,
        contractAddress,
        eventType,
      })

      const result = await eventsService.getEvents({
        limit: limit as number | undefined,
        offset: offset as number | undefined,
        timeRange: timeRange as '24h' | '7d' | '30d' | undefined,
        chainId: chainId as number | undefined,
        contractAddress: contractAddress as string | undefined,
        eventType: eventType as string | undefined,
      })

      console.log('[EventsController] Found events:', result.events.length)

      return res.status(200).json(
        ResponseFormatter.success(result.events, result.pagination)
      )
    } catch (error) {
      console.error('[EventsController] Error getting events:', error)
      next(error)
    }
  }

  /**
   * 获取单个事件
   * GET /api/v1/events/:id
   */
  async getEventById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params

      const event = await eventsService.getEventById(id)

      if (!event) {
        return res.status(404).json(
          ResponseFormatter.error('NOT_FOUND', 'Event not found')
        )
      }

      return res.status(200).json(ResponseFormatter.success(event))
    } catch (error) {
      next(error)
    }
  }

  /**
   * 获取事件统计
   * GET /api/v1/events/stats
   */
  async getEventStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { timeRange } = req.query

      const stats = await eventsService.getEventStats(
        timeRange as '24h' | '7d' | '30d' | undefined
      )

      return res.status(200).json(ResponseFormatter.success(stats))
    } catch (error) {
      next(error)
    }
  }
}

export const eventsController = new EventsController()

