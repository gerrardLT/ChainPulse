'use client'

import { useState, useEffect, useCallback } from 'react'
import { integrationsApi, TelegramConfig, DiscordConfig } from '@/lib/api'
import { useAuthContext } from '@/components/auth-provider'
import { useToast } from './use-toast'

/**
 * Integrations Hook
 * 管理第三方集成配置 (Telegram, Discord)
 */
export function useIntegrations() {
  const { isAuthenticated } = useAuthContext()
  const { toast } = useToast()
  const [telegram, setTelegram] = useState<TelegramConfig | null>(null)
  const [discord, setDiscord] = useState<DiscordConfig | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)

  /**
   * 获取所有集成配置
   */
  const fetchConfigs = useCallback(async () => {
    if (!isAuthenticated) {
      console.log('[useIntegrations] Not authenticated, skipping fetch')
      return
    }

    setIsLoading(true)

    try {
      console.log('[useIntegrations] Fetching configs...')
      const response = await integrationsApi.getAll()

      if (response.success && response.data) {
        console.log('[useIntegrations] ✅ Configs fetched:', {
          telegram: !!response.data.telegram,
          discord: !!response.data.discord,
        })
        setTelegram(response.data.telegram)
        setDiscord(response.data.discord)
      } else {
        console.error('[useIntegrations] ❌ Failed to fetch configs:', response.error)
        toast({
          title: '获取配置失败',
          description: response.error?.message || 'Failed to fetch integrations',
          variant: 'destructive',
        })
      }
    } catch (err: any) {
      console.error('[useIntegrations] ❌ Error fetching configs:', err)
      toast({
        title: '获取配置失败',
        description: err.message || 'An error occurred',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, toast])

  /**
   * 保存 Telegram 配置
   */
  const saveTelegram = useCallback(
    async (chatId: string, username?: string) => {
      setIsSaving(true)

      try {
        console.log('[useIntegrations] Saving telegram config:', { chatId, username })
        const response = await integrationsApi.saveTelegram(chatId, username)

        if (response.success && response.data) {
          console.log('[useIntegrations] ✅ Telegram config saved')
          setTelegram(response.data)
          toast({
            title: '保存成功',
            description: 'Telegram 配置已保存',
          })
          return true
        } else {
          console.error('[useIntegrations] ❌ Failed to save telegram:', response.error)
          toast({
            title: '保存失败',
            description: response.error?.message || 'Failed to save Telegram config',
            variant: 'destructive',
          })
          return false
        }
      } catch (err: any) {
        console.error('[useIntegrations] ❌ Error saving telegram:', err)
        toast({
          title: '保存失败',
          description: err.message || 'An error occurred',
          variant: 'destructive',
        })
        return false
      } finally {
        setIsSaving(false)
      }
    },
    [toast]
  )

  /**
   * 保存 Discord 配置
   */
  const saveDiscord = useCallback(
    async (webhookUrl: string) => {
      setIsSaving(true)

      try {
        console.log('[useIntegrations] Saving discord config')
        const response = await integrationsApi.saveDiscord(webhookUrl)

        if (response.success && response.data) {
          console.log('[useIntegrations] ✅ Discord config saved')
          setDiscord(response.data)
          toast({
            title: '保存成功',
            description: 'Discord 配置已保存',
          })
          return true
        } else {
          console.error('[useIntegrations] ❌ Failed to save discord:', response.error)
          toast({
            title: '保存失败',
            description: response.error?.message || 'Failed to save Discord config',
            variant: 'destructive',
          })
          return false
        }
      } catch (err: any) {
        console.error('[useIntegrations] ❌ Error saving discord:', err)
        toast({
          title: '保存失败',
          description: err.message || 'An error occurred',
          variant: 'destructive',
        })
        return false
      } finally {
        setIsSaving(false)
      }
    },
    [toast]
  )

  /**
   * 发送测试通知
   */
  const sendTest = useCallback(
    async (type: 'telegram' | 'discord') => {
      setIsTesting(true)

      try {
        console.log('[useIntegrations] Sending test notification:', type)
        const response = await integrationsApi.sendTest(type)

        if (response.success && response.data) {
          console.log('[useIntegrations] ✅ Test notification sent')
          toast({
            title: '测试成功',
            description: response.data.message,
          })
          return true
        } else {
          console.error('[useIntegrations] ❌ Failed to send test:', response.error)
          toast({
            title: '测试失败',
            description: response.error?.message || 'Failed to send test notification',
            variant: 'destructive',
          })
          return false
        }
      } catch (err: any) {
        console.error('[useIntegrations] ❌ Error sending test:', err)
        toast({
          title: '测试失败',
          description: err.message || 'An error occurred',
          variant: 'destructive',
        })
        return false
      } finally {
        setIsTesting(false)
      }
    },
    [toast]
  )

  /**
   * 初始加载
   */
  useEffect(() => {
    if (isAuthenticated) {
      fetchConfigs()
    }
  }, [isAuthenticated, fetchConfigs])

  return {
    telegram,
    discord,
    isLoading,
    isSaving,
    isTesting,
    saveTelegram,
    saveDiscord,
    sendTest,
    refresh: fetchConfigs,
  }
}

