'use client'

import { io, Socket } from 'socket.io-client'

/**
 * WebSocket 管理器
 * 负责管理 Socket.IO 连接、事件监听和消息推送
 */
class WebSocketManager {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private eventListeners: Map<string, Set<Function>> = new Map()
  private connectionListeners: Set<Function> = new Set()
  private disconnectionListeners: Set<Function> = new Set()
  private isConnecting = false

  /**
   * 连接到 WebSocket 服务器
   */
  connect(token: string) {
    if (this.socket?.connected) {
      console.log('[WebSocket] Already connected')
      return
    }

    if (this.isConnecting) {
      console.log('[WebSocket] Connection in progress')
      return
    }

    this.isConnecting = true

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000'

    console.log('[WebSocket] Connecting to:', wsUrl)

    this.socket = io(wsUrl, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      timeout: 10000,
    })

    this.setupEventHandlers()
  }

  /**
   * 设置事件处理器
   */
  private setupEventHandlers() {
    if (!this.socket) return

    // 连接成功
    this.socket.on('connect', () => {
      console.log('[WebSocket] ✅ Connected:', this.socket?.id)
      this.isConnecting = false
      this.reconnectAttempts = 0
      
      // 通知所有连接监听器
      this.connectionListeners.forEach((listener) => {
        try {
          listener()
        } catch (error) {
          console.error('[WebSocket] Error in connection listener:', error)
        }
      })
    })

    // 连接确认
    this.socket.on('connected', (data: any) => {
      console.log('[WebSocket] Server acknowledged connection:', data)
    })

    // 断开连接
    this.socket.on('disconnect', (reason: string) => {
      console.log('[WebSocket] ❌ Disconnected:', reason)
      this.isConnecting = false
      
      // 通知所有断开监听器
      this.disconnectionListeners.forEach((listener) => {
        try {
          listener(reason)
        } catch (error) {
          console.error('[WebSocket] Error in disconnection listener:', error)
        }
      })
    })

    // 重连尝试
    this.socket.on('reconnect_attempt', (attemptNumber: number) => {
      this.reconnectAttempts = attemptNumber
      console.log(`[WebSocket] 🔄 Reconnecting... (Attempt ${attemptNumber}/${this.maxReconnectAttempts})`)
    })

    // 重连失败
    this.socket.on('reconnect_failed', () => {
      console.error('[WebSocket] ❌ Reconnection failed')
      this.isConnecting = false
    })

    // 连接错误
    this.socket.on('connect_error', (error: Error) => {
      console.error('[WebSocket] Connection error:', error.message)
      this.isConnecting = false
    })

    // 接收通知
    this.socket.on('notification', (data: any) => {
      console.log('[WebSocket] 📬 Notification received:', data)
      this.emit('notification', data)
    })

    // 订阅确认
    this.socket.on('subscribed', (data: any) => {
      console.log('[WebSocket] ✅ Subscribed to:', data.channel)
    })

    // 取消订阅确认
    this.socket.on('unsubscribed', (data: any) => {
      console.log('[WebSocket] ❌ Unsubscribed from:', data.channel)
    })

    // Pong 响应
    this.socket.on('pong', (data: any) => {
      console.log('[WebSocket] 🏓 Pong:', data.timestamp)
    })
  }

  /**
   * 断开连接
   */
  disconnect() {
    if (this.socket) {
      console.log('[WebSocket] Disconnecting...')
      this.socket.disconnect()
      this.socket = null
      this.isConnecting = false
    }
  }

  /**
   * 订阅频道
   */
  subscribe(channel: string) {
    if (!this.socket?.connected) {
      console.warn('[WebSocket] Cannot subscribe: not connected')
      return
    }

    console.log('[WebSocket] Subscribing to channel:', channel)
    this.socket.emit('subscribe', { channel })
  }

  /**
   * 取消订阅频道
   */
  unsubscribe(channel: string) {
    if (!this.socket?.connected) {
      console.warn('[WebSocket] Cannot unsubscribe: not connected')
      return
    }

    console.log('[WebSocket] Unsubscribing from channel:', channel)
    this.socket.emit('unsubscribe', { channel })
  }

  /**
   * 发送心跳
   */
  ping() {
    if (!this.socket?.connected) {
      console.warn('[WebSocket] Cannot ping: not connected')
      return
    }

    this.socket.emit('ping')
  }

  /**
   * 监听事件
   */
  on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event)!.add(callback)
  }

  /**
   * 取消监听事件
   */
  off(event: string, callback: Function) {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.delete(callback)
    }
  }

  /**
   * 触发事件
   */
  private emit(event: string, data: any) {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(data)
        } catch (error) {
          console.error(`[WebSocket] Error in ${event} listener:`, error)
        }
      })
    }
  }

  /**
   * 监听连接事件
   */
  onConnect(callback: Function) {
    this.connectionListeners.add(callback)
  }

  /**
   * 监听断开事件
   */
  onDisconnect(callback: Function) {
    this.disconnectionListeners.add(callback)
  }

  /**
   * 取消监听连接事件
   */
  offConnect(callback: Function) {
    this.connectionListeners.delete(callback)
  }

  /**
   * 取消监听断开事件
   */
  offDisconnect(callback: Function) {
    this.disconnectionListeners.delete(callback)
  }

  /**
   * 检查是否已连接
   */
  isConnected(): boolean {
    return this.socket?.connected || false
  }

  /**
   * 获取连接状态
   */
  getStatus(): 'connected' | 'connecting' | 'disconnected' {
    if (this.socket?.connected) return 'connected'
    if (this.isConnecting) return 'connecting'
    return 'disconnected'
  }

  /**
   * 获取 Socket ID
   */
  getSocketId(): string | null {
    return this.socket?.id || null
  }
}

// 单例实例
let wsManager: WebSocketManager | null = null

/**
 * 获取 WebSocket 管理器实例
 */
export function getWebSocketManager(): WebSocketManager {
  if (!wsManager) {
    wsManager = new WebSocketManager()
  }
  return wsManager
}

/**
 * 重置 WebSocket 管理器（用于测试）
 */
export function resetWebSocketManager() {
  if (wsManager) {
    wsManager.disconnect()
    wsManager = null
  }
}

export type { WebSocketManager }

