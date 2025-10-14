/**
 * 导出所有类型定义
 */

// Pagination
export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginationResult {
  page: number
  limit: number
  total: number
  totalPages: number
}

// Sorting
export interface SortParams {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// User Types
export interface CreateUserDto {
  walletAddress: string
  ensName?: string
  avatarUrl?: string
}

export interface UpdateUserDto {
  ensName?: string
  avatarUrl?: string
  email?: string
}

// Smart Account Types
export interface CreateSmartAccountDto {
  ownerAddress: string
  chainId: number
  accountType?: string
  accountAddress?: string
}

export interface UpdateSmartAccountDto {
  accountAddress?: string
  isDeployed?: boolean
  deploymentTxHash?: string
  // balance 字段已移除，余额应该从区块链实时查询
}

export interface DeploySmartAccountDto {
  smartAccountId: string
}

// Event Subscription Types
export interface CreateSubscriptionDto {
  smartAccountId?: string
  contractAddress?: string
  eventType: string
  chainId: number
  filterConditions?: any
  notificationChannels?: string[]
}

export interface UpdateSubscriptionDto {
  filterConditions?: any
  notificationChannels?: string[]
  isActive?: boolean
}

// Notification Types
export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum NotificationChannel {
  WEB = 'web',
  TELEGRAM = 'telegram',
  DISCORD = 'discord',
  EMAIL = 'email',
}

export interface CreateNotificationDto {
  userId: string
  subscriptionId?: string
  eventId?: string
  title: string
  message: string
  priority?: NotificationPriority
  channel: NotificationChannel
  metadata?: any
}

// Automation Rule Types
export interface CreateAutomationRuleDto {
  userId: string
  smartAccountId: string
  name: string
  description?: string
  triggerType: string
  triggerConditions: any
  actionType: string
  actionParams: any
}

export interface UpdateAutomationRuleDto {
  name?: string
  description?: string
  triggerConditions?: any
  actionParams?: any
  isActive?: boolean
}

// Third-party Integration Types
export interface TelegramConfigDto {
  userId: string
  chatId: string
  username?: string
}

export interface DiscordConfigDto {
  userId: string
  webhookUrl: string
}

