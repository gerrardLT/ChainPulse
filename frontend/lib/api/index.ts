'use client'

/**
 * API 服务统一导出
 */

export * from './client'
export * from './auth'
export * from './smart-accounts'
export * from './notifications'
export * from './subscriptions'
export * from './stats'
export * from './automation-rules'
export * from './events'
export * from './integrations'

// Re-export for convenience
export { apiClient } from './client'
export { authApi, userApi } from './auth'
export { smartAccountApi } from './smart-accounts'
export { notificationApi } from './notifications'
export { subscriptionApi } from './subscriptions'
export { statsApi } from './stats'
export { automationRuleApi } from './automation-rules'
export { eventsApi } from './events'
export { integrationsApi } from './integrations'

