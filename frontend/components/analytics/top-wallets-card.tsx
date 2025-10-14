'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Wallet, Loader2 } from 'lucide-react'
import { useSmartAccount } from '@/hooks/use-smart-account'

export function TopWalletsCard() {
  const { accounts, isLoading } = useSmartAccount()

  // 计算 Top Wallets（基于智能账户）
  const topWallets = useMemo(() => {
    return accounts
      .slice(0, 3)
      .map((account, index) => ({
        address: `${account.accountAddress.slice(0, 6)}...${account.accountAddress.slice(-4)}`,
        fullAddress: account.accountAddress,
        count: account.isDeployed ? 'Deployed' : 'Pending',
        rank: index + 1,
      }))
  }, [accounts])

  return (
    <Card className="glass-card flex flex-col border-[#162032] bg-[#071427]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <h3 className="text-base font-semibold text-[#DDEBFF]">Top Wallets</h3>
        <div className="rounded-full bg-[#071322] px-2 py-1 text-xs text-[#6B7B89]">
          Smart Accounts
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-[#6B7B89]" />
          </div>
        ) : topWallets.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-[#6B7B89]">No wallet data available</p>
          </div>
        ) : (
          topWallets.map((wallet, index) => (
          <div
            key={index}
            className="flex items-center justify-center gap-3 rounded-xl border border-[#162032] px-3 py-3"
          >
            <div className="flex h-[18px] w-[18px] items-center justify-center">
              <Wallet className="h-4 w-4 text-[#DDEBFF]" />
            </div>
            <div className="flex-1">
              <p className="text-base text-[#DDEBFF]">{wallet.address}</p>
            </div>
            <div className="rounded-full bg-[#071322] px-2 py-1 text-xs text-[#6B7B89]">
              {wallet.count}
            </div>
          </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

