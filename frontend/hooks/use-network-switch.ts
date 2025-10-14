'use client'

import { useEffect } from 'react'
import { useAccount, useSwitchChain } from 'wagmi'
import { useToast } from './use-toast'
import { ToastAction } from '@/components/ui/toast'
import { monadTestnet } from '@/lib/wagmi-config'

interface NetworkSwitchReturn {
  currentChain: any
  isOnMonadTestnet: boolean
  switchToMonadTestnet: () => void
}

/**
 * 自动网络切换 Hook
 * 确保用户连接到 Monad Testnet
 */
export function useNetworkSwitch(): NetworkSwitchReturn {
  const { isConnected, chain } = useAccount()
  const { switchChain } = useSwitchChain()
  const { toast } = useToast()

  useEffect(() => {
    // 🔥 防御性检查：确保 switchChain 存在且已连接
    if (isConnected && chain && chain.id !== monadTestnet.id && switchChain) {
      // 延迟 1 秒后提示切换网络，给用户时间看到连接状态
      const timeoutId = setTimeout(() => {
        toast({
          title: '网络切换提醒',
          description: `检测到您当前在 ${chain.name}，建议切换到 Monad Testnet 以获得最佳体验`,
          action: (
            <ToastAction
              altText="切换到 Monad Testnet"
              onClick={() => {
                // 🔥 再次检查 switchChain 是否存在
                if (switchChain) {
                  switchChain({ chainId: monadTestnet.id })
                }
              }}
              className="bg-[#00E6A8] text-[#001217] hover:bg-[#00D29A]"
            >
              切换网络
            </ToastAction>
          ),
          duration: 8000, // 8秒后自动消失
        })
      }, 1000)

      return () => clearTimeout(timeoutId)
    }
  }, [isConnected, chain, switchChain, toast])

  return {
    currentChain: chain,
    isOnMonadTestnet: chain?.id === monadTestnet.id,
    // 🔥 关键修复：防御性检查，只在 switchChain 存在时调用
    switchToMonadTestnet: () => {
      if (switchChain) {
        switchChain({ chainId: monadTestnet.id })
      } else {
        console.warn('[useNetworkSwitch] switchChain is not available')
        toast({
          title: '切换失败',
          description: '当前钱包不支持自动切换网络，请手动切换到 Monad Testnet',
          variant: 'destructive',
        })
      }
    },
  }
}
