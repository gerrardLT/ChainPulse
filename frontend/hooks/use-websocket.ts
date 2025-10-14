'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { getWebSocketManager } from '@/lib/websocket/websocket-manager'

type ConnectionStatus = 'connected' | 'connecting' | 'disconnected'

interface UseWebSocketOptions {
  onNotification?: (data: any) => void
  onConnect?: () => void
  onDisconnect?: (reason: string) => void
  autoConnect?: boolean
}

/**
 * WebSocket Hook
 * 用于在 React 组件中使用 WebSocket
 */
export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    onNotification,
    onConnect,
    onDisconnect,
    autoConnect = false,
  } = options

  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const [lastNotification, setLastNotification] = useState<any>(null)
  const wsManagerRef = useRef(getWebSocketManager())

  // 连接到 WebSocket
  const connect = useCallback((token: string) => {
    const wsManager = wsManagerRef.current
    
    if (wsManager.isConnected()) {
      console.log('[useWebSocket] Already connected')
      return
    }

    setStatus('connecting')
    wsManager.connect(token)
  }, [])

  // 断开连接
  const disconnect = useCallback(() => {
    const wsManager = wsManagerRef.current
    wsManager.disconnect()
    setStatus('disconnected')
  }, [])

  // 订阅频道
  const subscribe = useCallback((channel: string) => {
    const wsManager = wsManagerRef.current
    wsManager.subscribe(channel)
  }, [])

  // 取消订阅频道
  const unsubscribe = useCallback((channel: string) => {
    const wsManager = wsManagerRef.current
    wsManager.unsubscribe(channel)
  }, [])

  // 发送心跳
  const ping = useCallback(() => {
    const wsManager = wsManagerRef.current
    wsManager.ping()
  }, [])

  // 设置事件监听器
  useEffect(() => {
    const wsManager = wsManagerRef.current

    // 连接状态监听
    const handleConnect = () => {
      setStatus('connected')
      onConnect?.()
    }

    const handleDisconnect = (reason: string) => {
      setStatus('disconnected')
      onDisconnect?.(reason)
    }

    // 通知监听
    const handleNotification = (data: any) => {
      setLastNotification(data)
      onNotification?.(data)
    }

    wsManager.onConnect(handleConnect)
    wsManager.onDisconnect(handleDisconnect)
    wsManager.on('notification', handleNotification)

    // 清理函数
    return () => {
      wsManager.offConnect(handleConnect)
      wsManager.offDisconnect(handleDisconnect)
      wsManager.off('notification', handleNotification)
    }
  }, [onConnect, onDisconnect, onNotification])

  // 定期更新连接状态
  useEffect(() => {
    const interval = setInterval(() => {
      const wsManager = wsManagerRef.current
      const currentStatus = wsManager.getStatus()
      if (currentStatus !== status) {
        setStatus(currentStatus)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [status])

  // 自动连接（需要从外部提供 token）
  // useEffect(() => {
  //   if (autoConnect && token) {
  //     connect(token)
  //   }
  //
  //   return () => {
  //     if (autoConnect) {
  //       disconnect()
  //     }
  //   }
  // }, [autoConnect, connect, disconnect])

  return {
    status,
    isConnected: status === 'connected',
    isConnecting: status === 'connecting',
    isDisconnected: status === 'disconnected',
    lastNotification,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    ping,
  }
}

