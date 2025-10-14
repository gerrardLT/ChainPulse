'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useWebSocket } from '@/hooks/use-websocket'
import { useToast } from '@/hooks/use-toast'
import { useAccount } from 'wagmi'
import { useAuthContext } from '@/components/auth-provider'

type ConnectionStatus = 'connected' | 'connecting' | 'disconnected'

interface WebSocketContextValue {
  status: ConnectionStatus
  isConnected: boolean
  lastNotification: any
  subscribe: (channel: string) => void
  unsubscribe: (channel: string) => void
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null)

interface WebSocketProviderProps {
  children: React.ReactNode
}

/**
 * WebSocket Provider
 * 在应用程序级别管理 WebSocket 连接
 */
export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const { address, isConnected: isWalletConnected } = useAccount()
  const { toast } = useToast()
  const { isAuthenticated } = useAuthContext()
  const [jwtToken, setJwtToken] = useState<string | null>(null)

  // 使用 WebSocket Hook
  const {
    status,
    isConnected,
    lastNotification,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
  } = useWebSocket({
    onNotification: (data) => {
      // 显示通知 Toast
      toast({
        title: data.title || '新通知',
        description: data.message || '您有一条新消息',
        duration: 5000,
      })
    },
    onConnect: () => {
      console.log('[WebSocketProvider] Connected to server')
    },
    onDisconnect: (reason) => {
      console.log('[WebSocketProvider] Disconnected:', reason)
    },
  })

  // 从 localStorage 获取 JWT Token
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    setJwtToken(token)
  }, [isWalletConnected, address])

  // 🔥 监听认证状态变化，重新获取 token 或清理
  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem('auth_token')
      console.log('[WebSocketProvider] Authentication completed, updating token:', !!token)
      setJwtToken(token)
    } else {
      // 🔥 认证失效或钱包断开时，清理 token
      console.log('[WebSocketProvider] Authentication lost, clearing token')
      setJwtToken(null)
    }
  }, [isAuthenticated])

  // 自动连接和断开
  useEffect(() => {
    if (isWalletConnected && jwtToken) {
      console.log('[WebSocketProvider] Connecting with token...')
      connect(jwtToken)
    } else {
      console.log('[WebSocketProvider] Disconnecting...')
      disconnect()
    }

    // 清理函数
    return () => {
      disconnect()
    }
  }, [isWalletConnected, jwtToken, connect, disconnect])

  const value: WebSocketContextValue = {
    status,
    isConnected,
    lastNotification,
    subscribe,
    unsubscribe,
  }

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  )
}

/**
 * 使用 WebSocket Context
 */
export function useWebSocketContext(): WebSocketContextValue {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocketContext must be used within WebSocketProvider')
  }
  return context
}

