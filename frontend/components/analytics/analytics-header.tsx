'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Download } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = ['Overview', 'Transfers', 'Swaps', 'Errors'] as const
type TabType = typeof tabs[number]

const filters = [
  { label: 'Contract: 0x…abcd', value: 'contract' },
  { label: 'Wallet: Any', value: 'wallet' },
  { label: 'Chain: Ethereum', value: 'chain' },
  { label: 'Range: 24h', value: 'range' },
] as const

export function AnalyticsHeader() {
  const [activeTab, setActiveTab] = useState<TabType>('Overview')

  return (
    <div className="glass-card rounded-3xl border border-[#162032] bg-[#071427] p-4">
      {/* Title and Tabs */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-[#DDEBFF]">Analytics</h1>
          <p className="text-xs text-[#6B7B89]">
            Explore real-time on-chain metrics and trends
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1.5 rounded-full bg-[#091733] p-1">
          {tabs.map((tab) => (
            <Button
              key={tab}
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab(tab)}
              className={cn(
                'rounded-full px-3 py-1.5 text-[13px] transition-colors',
                activeTab === tab
                  ? 'bg-[#0B1020] text-[#E6F0FF]'
                  : 'text-[#C9E9FF] hover:bg-[#0A1A3A]'
              )}
            >
              {tab}
            </Button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {filters.slice(0, 3).map((filter) => (
            <div
              key={filter.value}
              className="rounded-xl border border-[#162032] bg-[#0F1724] px-3 py-2 text-sm text-[#E6F0FF]"
            >
              {filter.label}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="rounded-xl border border-[#162032] bg-[#0F1724] px-3 py-2 text-sm text-[#E6F0FF]">
            {filters[3].label}
          </div>
          <Button
            size="sm"
            className="glass-card rounded-xl bg-[#091733] px-3 py-2.5 text-sm font-medium text-[#C9E9FF] hover:bg-[#0A1A3A]"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>
    </div>
  )
}

