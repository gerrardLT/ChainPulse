'use client'

import React, { createContext, useContext, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useAccount } from 'wagmi'
import { useToast } from '@/hooks/use-toast'

interface AuthContextValue {
  user: any
  isAuthenticated: boolean
  isLoading: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
  children: React.ReactNode
}

/**
 * 全局认证 Provider
 * 管理整个应用的认证状态
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const { address, isConnected } = useAccount()
  const { toast } = useToast()
  const authHook = useAuth()

  // 🔥 核心逻辑：钱包连接后自动触发认证（完全修复版 - 刷新页面不重复签名）
  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    // 只在钱包已连接、有地址、未认证、未加载时才处理
    if (isConnected && address && !authHook.isAuthenticated && !authHook.isLoading) {
      // 🔥 关键修复：先检查是否有 token
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      
      if (token) {
        // ✅ 有 token，说明是刷新页面或重连，use-auth 的 fetchUser 会自动验证
        console.log('[AuthProvider] ✅ Token exists, use-auth will handle authentication')
        return
      }

      // ❌ 无 token，说明是首次连接，需要触发签名认证
      console.log('[AuthProvider] ⚠️ No token found, will request signature...')
      
      // 延迟 800ms 确保钱包完全连接并且 use-auth 的 useEffect 已执行
      timeoutId = setTimeout(async () => {
        // 再次检查，防止在延迟期间已经认证
        if (authHook.isAuthenticated || authHook.isLoading) {
          console.log('[AuthProvider] ⏭️ Already authenticated or loading, skipping login')
          return
        }

        console.log('[AuthProvider] 🔥 Starting login flow...')
        console.log('[AuthProvider] Wallet:', address)
        
        try {
          await authHook.login()
          console.log('[AuthProvider] ✅ Authentication successful')
        } catch (error) {
          console.error('[AuthProvider] ❌ Authentication failed:', error)
          toast({
            title: '认证失败',
            description: '请手动点击连接钱包完成签名认证',
            variant: 'destructive',
          })
        }
      }, 800)
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [isConnected, address, authHook.isAuthenticated, authHook.isLoading, authHook.login, toast])

  // 🔥 监听认证状态变化
  useEffect(() => {
    if (authHook.isAuthenticated) {
      console.log('[AuthProvider] ✅ 认证成功!')
    }
  }, [authHook.isAuthenticated])

  const value: AuthContextValue = {
    user: authHook.user,
    isAuthenticated: authHook.isAuthenticated,
    isLoading: authHook.isLoading,
    login: authHook.login,
    logout: authHook.logout,
    refresh: authHook.refresh,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * 使用认证 Context
 */
export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
}
