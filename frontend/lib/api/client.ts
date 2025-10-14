'use client'

/**
 * API 客户端配置
 * 处理所有后端API请求
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * API 请求封装
 */
export class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  /**
   * 获取请求头
   */
  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (includeAuth) {
      const token = this.getToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    return headers
  }

  /**
   * 获取存储的 JWT Token
   */
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token')
    }
    return null
  }

  /**
   * 保存 Token
   */
  public setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  /**
   * 清除 Token
   */
  public clearToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }

  /**
   * GET 请求
   */
  async get<T = any>(
    endpoint: string,
    params?: Record<string, any>,
    requireAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    try {
      const url = new URL(`${this.baseUrl}${endpoint}`)
      if (params) {
        Object.keys(params).forEach((key) => {
          if (params[key] !== undefined && params[key] !== null) {
            url.searchParams.append(key, String(params[key]))
          }
        })
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getHeaders(requireAuth),
      })

      return await response.json()
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error.message || 'Network error occurred',
        },
      }
    }
  }

  /**
   * POST 请求
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    requireAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(requireAuth),
        body: JSON.stringify(data),
      })

      return await response.json()
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error.message || 'Network error occurred',
        },
      }
    }
  }

  /**
   * PATCH 请求
   */
  async patch<T = any>(
    endpoint: string,
    data?: any,
    requireAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PATCH',
        headers: this.getHeaders(requireAuth),
        body: JSON.stringify(data),
      })

      return await response.json()
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error.message || 'Network error occurred',
        },
      }
    }
  }

  /**
   * DELETE 请求
   */
  async delete<T = any>(
    endpoint: string,
    data?: any,
    requireAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(requireAuth),
        body: data ? JSON.stringify(data) : undefined,
      })

      return await response.json()
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error.message || 'Network error occurred',
        },
      }
    }
  }
}

// 导出单例
export const apiClient = new ApiClient()

