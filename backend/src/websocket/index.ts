import { Server as HttpServer } from 'http'
import { Server, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import { log } from '../utils/logger'
import { JwtPayload } from '../types'

// WebSocket 连接管理
class WebSocketManager {
  private io: Server
  private userSockets: Map<string, Set<string>> = new Map() // userId -> Set<socketId>

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: [
          process.env.FRONTEND_URL || 'http://localhost:3001',
          'http://localhost:3000', // 兼容旧端口
          'http://localhost:3001'  // 新端口
        ],
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    })

    this.setupMiddleware()
    this.setupEventHandlers()

    log.info('🔌 WebSocket server initialized')
  }

  /**
   * 设置 WebSocket 中间件（认证）
   */
  private setupMiddleware() {
    this.io.use(async (socket: Socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '')

        if (!token) {
          return next(new Error('Authentication error: Token missing'))
        }

        // 验证 JWT Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload

        // 将用户信息附加到 socket
        socket.data.user = {
          userId: decoded.userId,
          walletAddress: decoded.walletAddress,
        }

        log.info(`WebSocket authentication successful for user: ${decoded.userId}`)
        next()
      } catch (error) {
        log.error('WebSocket authentication failed:', error)
        next(new Error('Authentication error: Invalid token'))
      }
    })
  }

  /**
   * 设置事件处理器
   */
  private setupEventHandlers() {
    this.io.on('connection', (socket: Socket) => {
      const userId = socket.data.user?.userId
      const walletAddress = socket.data.user?.walletAddress

      if (!userId) {
        socket.disconnect()
        return
      }

      log.info(`✅ Client connected: ${socket.id} (User: ${userId}, Wallet: ${walletAddress})`)

      // 将 socket 与用户关联
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set())
      }
      this.userSockets.get(userId)!.add(socket.id)

      // 用户加入个人房间
      socket.join(`user:${userId}`)

      // 发送连接成功消息
      socket.emit('connected', {
        message: 'Connected to ChainPulse WebSocket server',
        userId,
        timestamp: new Date().toISOString(),
      })

      // 处理订阅事件
      socket.on('subscribe', (data: { channel: string }) => {
        const { channel } = data
        socket.join(channel)
        log.info(`User ${userId} subscribed to channel: ${channel}`)
        socket.emit('subscribed', { channel, timestamp: new Date().toISOString() })
      })

      // 处理取消订阅事件
      socket.on('unsubscribe', (data: { channel: string }) => {
        const { channel } = data
        socket.leave(channel)
        log.info(`User ${userId} unsubscribed from channel: ${channel}`)
        socket.emit('unsubscribed', { channel, timestamp: new Date().toISOString() })
      })

      // 处理心跳检测
      socket.on('ping', () => {
        socket.emit('pong', { timestamp: new Date().toISOString() })
      })

      // 处理断开连接
      socket.on('disconnect', (reason) => {
        log.info(`❌ Client disconnected: ${socket.id} (User: ${userId}, Reason: ${reason})`)

        // 从用户映射中移除
        const sockets = this.userSockets.get(userId)
        if (sockets) {
          sockets.delete(socket.id)
          if (sockets.size === 0) {
            this.userSockets.delete(userId)
          }
        }
      })

      // 处理错误
      socket.on('error', (error) => {
        log.error(`WebSocket error for user ${userId}:`, error)
      })
    })
  }

  /**
   * 向特定用户推送通知
   */
  public notifyUser(userId: string, event: string, data: any) {
    const room = `user:${userId}`
    this.io.to(room).emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    })
    log.info(`Notification sent to user ${userId}: ${event}`)
  }

  /**
   * 向特定频道广播消息
   */
  public broadcast(channel: string, event: string, data: any) {
    this.io.to(channel).emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    })
    log.info(`Broadcast to channel ${channel}: ${event}`)
  }

  /**
   * 向所有连接的客户端广播消息
   */
  public broadcastAll(event: string, data: any) {
    this.io.emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    })
    log.info(`Broadcast to all clients: ${event}`)
  }

  /**
   * 获取用户的所有 socket 连接
   */
  public getUserSockets(userId: string): string[] {
    return Array.from(this.userSockets.get(userId) || [])
  }

  /**
   * 检查用户是否在线
   */
  public isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0
  }

  /**
   * 获取在线用户数量
   */
  public getOnlineUserCount(): number {
    return this.userSockets.size
  }

  /**
   * 获取总连接数
   */
  public getTotalConnections(): number {
    return this.io.sockets.sockets.size
  }

  /**
   * 获取 Socket.IO 实例
   */
  public getIO(): Server {
    return this.io
  }
}

// 单例实例
let wsManager: WebSocketManager | null = null

/**
 * 初始化 WebSocket 服务器
 */
export function initializeWebSocket(httpServer: HttpServer): WebSocketManager {
  if (!wsManager) {
    wsManager = new WebSocketManager(httpServer)
  }
  return wsManager
}

/**
 * 获取 WebSocket 管理器实例
 */
export function getWebSocketManager(): WebSocketManager {
  if (!wsManager) {
    throw new Error('WebSocket manager not initialized. Call initializeWebSocket first.')
  }
  return wsManager
}

export { WebSocketManager }

