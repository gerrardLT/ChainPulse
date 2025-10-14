'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { FileCode, Loader2 } from 'lucide-react'
import { useEvents } from '@/hooks/use-events'

export function TopContractsCard() {
  const { events, isLoading } = useEvents({ timeRange: '24h', limit: 100 })

  // 计算 Top Contracts
  const topContracts = useMemo(() => {
    const contractCounts = new Map<string, number>()
    
    events.forEach(event => {
      const address = event.contractAddress
      if (address) {
        contractCounts.set(address, (contractCounts.get(address) || 0) + 1)
      }
    })
    
    return Array.from(contractCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([address, count]) => ({
        name: `${address.slice(0, 6)}...${address.slice(-4)}`,
        fullAddress: address,
        count: count.toString(),
      }))
  }, [events])

  return (
    <Card className="glass-card flex flex-col border-[#162032] bg-[#071427]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <h3 className="text-base font-semibold text-[#DDEBFF]">Top Contracts</h3>
        <div className="rounded-full bg-[#071322] px-2 py-1 text-xs text-[#6B7B89]">
          By events
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-[#6B7B89]" />
          </div>
        ) : topContracts.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-[#6B7B89]">No contract data available</p>
          </div>
        ) : (
          topContracts.map((contract, index) => (
          <div
            key={index}
            className="flex items-center justify-center gap-3 rounded-xl border border-[#162032] px-3 py-3"
          >
            <div className="flex h-[18px] w-[18px] items-center justify-center">
              <FileCode className="h-4 w-4 text-[#DDEBFF]" />
            </div>
            <div className="flex-1">
              <p className="whitespace-pre-line text-base text-[#DDEBFF]">
                {contract.name}
              </p>
            </div>
            <div className="rounded-full bg-[#071322] px-2 py-1 text-xs text-[#6B7B89]">
              {contract.count}
            </div>
          </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

