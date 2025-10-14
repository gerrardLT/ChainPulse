'use client'

import { useState, useEffect, useCallback } from 'react'
import { automationRuleApi, AutomationRule } from '@/lib/api'
import { useToast } from './use-toast'

/**
 * 静音规则 Hook
 * 使用真实的后端 automation-rules API
 * 注意：这里将 automation rules 映射为 "muted rules" UI 概念
 */
export function useMutedRules() {
  const { toast } = useToast()
  const [rules, setRules] = useState<AutomationRule[]>([])
  const [isLoading, setIsLoading] = useState(false)

  /**
   * 获取规则列表
   */
  const fetchRules = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await automationRuleApi.list({ limit: 50 })
      if (response.success && response.data) {
        setRules(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch muted rules:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * 创建规则
   */
  const createRule = useCallback(
    async (data: {
      smartAccountId: string
      ruleName: string
      description?: string
      triggerEventType: string
      triggerConditions: any
      actionType: 'transfer' | 'swap' | 'stake' | 'approve' | 'custom'
      actionParams: any
    }) => {
      try {
        const response = await automationRuleApi.create(data)
        if (response.success && response.data) {
          setRules((prev) => [response.data!, ...prev])
          toast({
            title: 'Success',
            description: 'Rule created successfully',
          })
          return response.data
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to create rule',
          variant: 'destructive',
        })
        throw error
      }
    },
    [toast]
  )

  /**
   * 更新规则
   */
  const updateRule = useCallback(
    async (
      id: string,
      data: {
        ruleName?: string
        description?: string
        triggerConditions?: any
        actionParams?: any
        isActive?: boolean
      }
    ) => {
      try {
        const response = await automationRuleApi.update(id, data)
        if (response.success && response.data) {
          setRules((prev) =>
            prev.map((r) => (r.id === id ? response.data! : r))
          )
          toast({
            title: 'Success',
            description: 'Rule updated successfully',
          })
          return response.data
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to update rule',
          variant: 'destructive',
        })
        throw error
      }
    },
    [toast]
  )

  /**
   * 删除规则
   */
  const deleteRule = useCallback(
    async (id: string) => {
      try {
        const response = await automationRuleApi.delete(id)
        if (response.success) {
          setRules((prev) => prev.filter((r) => r.id !== id))
          toast({
            title: 'Success',
            description: 'Rule deleted successfully',
          })
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete rule',
          variant: 'destructive',
        })
        throw error
      }
    },
    [toast]
  )

  /**
   * 切换规则启用/禁用状态
   */
  const toggleRule = useCallback(
    async (id: string, isActive: boolean) => {
      try {
        const response = await automationRuleApi.toggle(id, isActive)
        if (response.success && response.data) {
          setRules((prev) =>
            prev.map((r) => (r.id === id ? response.data! : r))
          )
          toast({
            title: 'Success',
            description: `Rule ${isActive ? 'enabled' : 'paused'} successfully`,
          })
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to toggle rule',
          variant: 'destructive',
        })
        throw error
      }
    },
    [toast]
  )

  /**
   * 初始加载
   */
  useEffect(() => {
    fetchRules()
  }, [fetchRules])

  return {
    rules,
    isLoading,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
    refresh: fetchRules,
  }
}

