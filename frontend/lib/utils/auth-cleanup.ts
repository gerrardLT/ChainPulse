'use client'

import { apiClient } from '@/lib/api/client'

/**
 * 完整的认证清理工具
 * 用于登出或钱包断开时清理所有认证相关的数据
 */
export class AuthCleanup {
  /**
   * 清理所有认证数据
   */
  static cleanupAll() {
    console.log('[AuthCleanup] 🧹 Starting full cleanup...')
    
    // 1. 清理 localStorage
    this.clearLocalStorage()
    
    // 2. 清理 API Client token
    this.clearApiToken()
    
    // 3. 清理 sessionStorage（如果有使用）
    this.clearSessionStorage()
    
    console.log('[AuthCleanup] ✅ Cleanup completed')
  }

  /**
   * 清理 localStorage 中的认证数据
   */
  static clearLocalStorage() {
    if (typeof window === 'undefined') return

    const authKeys = [
      'auth_token',           // JWT token
      'user_data',            // 用户数据缓存（如果有）
      'wallet_signature',     // 钱包签名（如果有）
    ]

    authKeys.forEach((key) => {
      const value = localStorage.getItem(key)
      if (value) {
        localStorage.removeItem(key)
        console.log(`[AuthCleanup] Removed ${key} from localStorage`)
      }
    })
  }

  /**
   * 清理 API Client 的 token
   */
  static clearApiToken() {
    apiClient.clearToken()
    console.log('[AuthCleanup] Cleared API client token')
  }

  /**
   * 清理 sessionStorage
   */
  static clearSessionStorage() {
    if (typeof window === 'undefined') return

    const sessionKeys = [
      'temp_auth_data',  // 临时认证数据（如果有）
    ]

    sessionKeys.forEach((key) => {
      const value = sessionStorage.getItem(key)
      if (value) {
        sessionStorage.removeItem(key)
        console.log(`[AuthCleanup] Removed ${key} from sessionStorage`)
      }
    })
  }

  /**
   * 清理特定的缓存数据（可选）
   */
  static clearCache() {
    // 如果使用了 SWR 或其他缓存库，在这里清理
    // 例如: mutate(() => true, undefined, { revalidate: false })
    console.log('[AuthCleanup] Cache cleanup (if needed)')
  }
}

