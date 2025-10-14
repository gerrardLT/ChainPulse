# WebSocket 实时通信层

## 📋 功能说明

WebSocket 层使用 Socket.IO 实现实时双向通信，负责实时事件推送、通知、连接管理等功能。

## 🎯 职责

- WebSocket 服务器初始化
- 连接认证
- 房间管理（用户房间、订阅房间）
- 实时事件推送
- 实时通知推送
- 连接状态管理
- 心跳检测

## 📁 文件列表

| 文件 | 功能 | 状态 |
|------|------|------|
| `index.ts` | Socket.IO 服务器初始化 | ⬜ 待实现 |
| `handlers/connection.handler.ts` | 连接/断开处理 | ⬜ 待实现 |
| `handlers/event.handler.ts` | 事件推送处理 | ⬜ 待实现 |
| `handlers/notification.handler.ts` | 通知推送处理 | ⬜ 待实现 |
| `middleware/auth.middleware.ts` | WebSocket 认证中间件 | ⬜ 待实现 |

## 💡 代码示例

### 服务器初始化

```typescript
// index.ts
import { Server, Socket } from 'socket.io'
import { Server as HttpServer } from 'http'
import jwt from 'jsonwebtoken'
import { logger } from '../utils/logger'

export function initializeWebSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true
    }
  })
  
  // 认证中间件
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token
      if (!token) {
        return next(new Error('Authentication error'))
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET!)
      socket.data.user = decoded
      next()
    } catch (error) {
      next(new Error('Authentication error'))
    }
  })
  
  // 连接处理
  io.on('connection', (socket: Socket) => {
    const userId = socket.data.user.userId
    
    logger.info(`User connected: ${userId}`)
    
    // 加入用户房间
    socket.join(`user:${userId}`)
    
    // 事件监听
    socket.on('subscribe', (data) => {
      handleSubscribe(socket, data)
    })
    
    socket.on('unsubscribe', (data) => {
      handleUnsubscribe(socket, data)
    })
    
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${userId}`)
    })
  })
  
  return io
}
```

### 连接处理

```typescript
// handlers/connection.handler.ts
import { Socket } from 'socket.io'
import { logger } from '../../utils/logger'

export function handleConnection(socket: Socket) {
  const userId = socket.data.user.userId
  const walletAddress = socket.data.user.walletAddress
  
  logger.info(`WebSocket connected: ${userId} (${walletAddress})`)
  
  // 加入用户专属房间
  socket.join(`user:${userId}`)
  
  // 发送连接成功消息
  socket.emit('connected', {
    userId,
    message: 'Successfully connected to ChainPulse'
  })
}

export function handleDisconnect(socket: Socket) {
  const userId = socket.data.user.userId
  logger.info(`WebSocket disconnected: ${userId}`)
}

export function handleSubscribe(socket: Socket, data: { addressess: string[] }) {
  const { addresses } = data
  
  // 加入地址监听房间
  addresses.forEach(address => {
    socket.join(`address:${address.toLowerCase()}`)
  })
  
  socket.emit('subscribed', { addresses })
}

export function handleUnsubscribe(socket: Socket, data: { addresses: string[] }) {
  const { addresses } = data
  
  // 离开地址监听房间
  addresses.forEach(address => {
    socket.leave(`address:${address.toLowerCase()}`)
  })
  
  socket.emit('unsubscribed', { addresses })
}
```

### 事件推送

```typescript
// handlers/event.handler.ts
import { Server } from 'socket.io'

export class EventPushHandler {
  constructor(private io: Server) {}
  
  // 推送新事件给订阅的用户
  async pushEventToUsers(event: any, userIds: string[]) {
    userIds.forEach(userId => {
      this.io.to(`user:${userId}`).emit('event:new', {
        id: event.id,
        type: event.eventType,
        contractAddress: event.contractAddress,
        chainId: event.chainId,
        data: event.data,
        timestamp: event.blockTimestamp
      })
    })
  }
  
  // 推送事件给监听特定地址的用户
  async pushEventToAddress(event: any, address: string) {
    this.io.to(`address:${address.toLowerCase()}`).emit('event:new', event)
  }
}
```

### 通知推送

```typescript
// handlers/notification.handler.ts
import { Server } from 'socket.io'

export class NotificationPushHandler {
  constructor(private io: Server) {}
  
  // 推送通知给用户
  async pushNotification(userId: string, notification: any) {
    this.io.to(`user:${userId}`).emit('notification:new', {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      eventId: notification.eventId,
      createdAt: notification.createdAt
    })
  }
  
  // 批量推送通知
  async pushNotifications(userIds: string[], notification: any) {
    userIds.forEach(userId => {
      this.pushNotification(userId, notification)
    })
  }
}
```

## 🔌 WebSocket 事件

### 客户端 → 服务器

| 事件 | 数据 | 说明 |
|------|------|------|
| `subscribe` | `{ addresses: string[] }` | 订阅地址事件 |
| `unsubscribe` | `{ addresses: string[] }` | 取消订阅 |

### 服务器 → 客户端

| 事件 | 数据 | 说明 |
|------|------|------|
| `connected` | `{ userId, message }` | 连接成功 |
| `event:new` | `Event` | 新事件推送 |
| `notification:new` | `Notification` | 新通知推送 |
| `subscribed` | `{ addresses }` | 订阅成功 |
| `unsubscribed` | `{ addresses }` | 取消订阅成功 |

## 🔗 相关文档

- [API 设计文档](../../../docs/API设计.md) - WebSocket API 部分
- [功能交互文档](../../../docs/功能交互.md) - 实时通知流程

