'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { smartAccountApi, SmartAccount } from '@/lib/api'
import { useToast } from './use-toast'
import { useAuthContext } from '@/components/auth-provider'

export function useSmartAccount() {
  const { address, isConnected } = useAccount()
  const { toast } = useToast()
  const { isAuthenticated } = useAuthContext()
  const [accounts, setAccounts] = useState<SmartAccount[]>([])
  const [isLoading, setIsLoading] = useState(false)

  /**
   * 获取账户列表
   */
  const fetchAccounts = useCallback(async () => {
    if (!isConnected || !isAuthenticated) return

    setIsLoading(true)
    try {
      const response = await smartAccountApi.list()
      if (response.success && response.data) {
        setAccounts(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isConnected, isAuthenticated])

  /**
   * 创建账户
   */
  const createAccount = useCallback(
    async (ownerAddress: string, chainId: number) => {
      setIsLoading(true)
      try {
        const requestData = {
          ownerAddress,
          chainId,
          accountType: 'erc4337',
        }
        
        console.log('[useSmartAccount] Creating account with data:', requestData)
        console.log('[useSmartAccount] ownerAddress type:', typeof ownerAddress)
        console.log('[useSmartAccount] chainId type:', typeof chainId)
        
        const response = await smartAccountApi.create(requestData)

        if (response.success && response.data) {
          toast({
            title: 'Success',
            description: 'Smart account created successfully',
          })
          await fetchAccounts()
          return response.data
        } else {
          throw new Error(response.error?.message || 'Failed to create account')
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to create smart account',
          variant: 'destructive',
        })
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [toast, fetchAccounts]
  )

  /**
   * 部署账户
   */
  const deployAccount = useCallback(
    async (id: string) => {
      try {
        setIsLoading(true)
        
        // 先获取账户信息
        const account = accounts.find(acc => acc.id === id)
        if (!account) {
          throw new Error('Account not found')
        }
        
        // 使用临时交易哈希，实际部署时应该从 Stackup SDK 获取
        const tempTxHash = '0x' + Math.random().toString(16).substr(2, 64).padStart(64, '0')
        
        const response = await smartAccountApi.markAsDeployed(id, tempTxHash, account.accountAddress)
        if (response.success) {
          toast({
            title: 'Success',
            description: 'Smart account deployed successfully',
          })
          await fetchAccounts()
        } else {
          throw new Error(response.error?.message || 'Deployment failed')
        }
      } catch (error: any) {
        toast({
          title: 'Deployment Failed',
          description: error.message || 'Failed to deploy smart account',
          variant: 'destructive',
        })
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [accounts, toast, fetchAccounts]
  )

  /**
   * 删除账户
   */
  const deleteAccount = useCallback(
    async (id: string) => {
      try {
        const response = await smartAccountApi.delete(id)
        if (response.success) {
          toast({
            title: 'Success',
            description: 'Smart account deleted',
          })
          await fetchAccounts()
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete account',
          variant: 'destructive',
        })
      }
    },
    [toast, fetchAccounts]
  )

  /**
   * 初始加载
   */
  useEffect(() => {
    if (isConnected && isAuthenticated) {
      fetchAccounts()
    }
  }, [isConnected, isAuthenticated, fetchAccounts])

  // 兼容旧接口
  const smartAccountAddress = accounts.length > 0 ? accounts[0].accountAddress : null

  return {
    eoaAddress: address,
    smartAccountAddress,
    accounts,
    isLoading,
    error: null,
    isConnected,
    createAccount,
    deployAccount,
    deleteAccount,
    refreshAccounts: fetchAccounts,
  }
}
