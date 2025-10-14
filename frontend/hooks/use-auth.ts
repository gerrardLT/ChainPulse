'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { authApi, userApi, User } from '@/lib/api'
import { useToast } from './use-toast'
import { AuthCleanup } from '@/lib/utils/auth-cleanup'

/**
 * 认证 Hook
 * 处理钱包连接和用户认证
 */
export function useAuth() {
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const { toast } = useToast()

  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  /**
   * 登录流程
   */
  const login = useCallback(async () => {
    if (!address) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      })
      return
    }

    // 🔥 防重复调用：如果正在加载或已认证，直接返回
    if (isLoading || isAuthenticated) {
      console.log('[useAuth] 跳过重复认证调用，当前状态:', { isLoading, isAuthenticated })
      return
    }

    setIsLoading(true)

    try {
      // 1. 获取签名消息
      const messageResponse = await authApi.getMessage(address)
      if (!messageResponse.success || !messageResponse.data) {
        throw new Error('Failed to get message')
      }

      const message = messageResponse.data.message

      // 2. 请求用户签名
      const signature = await signMessageAsync({ message })

      // 3. 验证签名并登录
      const authResponse = await authApi.verifySignature(address, message, signature)
      if (!authResponse.success || !authResponse.data) {
        throw new Error(authResponse.error?.message || 'Authentication failed')
      }

      setUser(authResponse.data.user)
      setIsAuthenticated(true)

      toast({
        title: 'Success',
        description: 'Successfully authenticated',
      })
    } catch (error: any) {
      console.error('Login error:', error)
      toast({
        title: 'Authentication Failed',
        description: error.message || 'Failed to authenticate',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [address, signMessageAsync, toast, isLoading, isAuthenticated])

  /**
   * 退出登录
   */
  const logout = useCallback(async () => {
    try {
      // 调用后端 logout API（可选，因为 JWT 是无状态的）
      await authApi.logout()
    } catch (error) {
      console.error('[useAuth] Logout API failed:', error)
      // 即使 API 失败，也继续清理本地状态
    }
    
    // 🔥 使用清理工具清理所有认证数据
    AuthCleanup.cleanupAll()
    
    // 清理本地状态
    setUser(null)
    setIsAuthenticated(false)

    toast({
      title: 'Logged Out',
      description: 'Successfully logged out',
    })
  }, [toast])

  /**
   * 获取当前用户信息
   */
  const fetchUser = useCallback(async () => {
    console.log('[useAuth] fetchUser called')
    setIsLoading(true) // 🔥 设置加载状态，防止 AuthProvider 触发 login
    try {
      const response = await userApi.getMe()
      if (response.success && response.data) {
        setUser(response.data)
        setIsAuthenticated(true)
        console.log('[useAuth] ✅ User fetched successfully')
      } else {
        // Token 无效或过期，清理并需要重新登录
        console.log('[useAuth] ⚠️ Token invalid, clearing...')
        AuthCleanup.cleanupAll()
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('[useAuth] ❌ Failed to fetch user:', error)
      // Token 无效或过期，清理
      AuthCleanup.cleanupAll()
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * 钱包连接时检查是否有 token，如果有则尝试获取用户信息
   * 钱包断开时清理所有认证状态
   */
  useEffect(() => {
    console.log('[useAuth] useEffect triggered', { isConnected, address, isAuthenticated })
    
    if (isConnected && address) {
      const token = localStorage.getItem('auth_token')
      if (token && !isAuthenticated) {
        // 有 token 且未认证，尝试验证是否有效
        console.log('[useAuth] Fetching user with token...')
        fetchUser()
      }
    } else {
      // 🔥 钱包断开连接时的完整清理逻辑
      console.log('[useAuth] 🔌 Wallet disconnected, performing full cleanup...')
      
      // 1. 使用清理工具清理所有认证数据
      AuthCleanup.cleanupAll()
      
      // 2. 清空用户状态
      setUser(null)
      setIsAuthenticated(false)
      
      console.log('[useAuth] ✅ Cleanup completed')
    }
  }, [isConnected, address, isAuthenticated, fetchUser])

  // 🔥 移除重复的 token 检查逻辑，已在上面的 useEffect 中处理

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refresh: fetchUser,
  }
}

