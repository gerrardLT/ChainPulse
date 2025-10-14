/**
 * 统一响应格式化工具
 */

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

export class ResponseFormatter {
  /**
   * 成功响应
   */
  static success<T>(data: T, pagination?: any): ApiResponse<T> {
    const response: ApiResponse<T> = {
      success: true,
      data,
    }

    if (pagination) {
      response.pagination = {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: Math.ceil(pagination.total / pagination.limit),
      }
    }

    return response
  }

  /**
   * 错误响应
   */
  static error(code: string, message: string, details?: any): ApiResponse {
    return {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
    }
  }
}

