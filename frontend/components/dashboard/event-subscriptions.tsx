'use client'

import { Button } from '@/components/ui/button'
import { useSubscriptions } from '@/hooks/use-subscriptions'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function EventSubscriptions() {
  const router = useRouter()
  const { subscriptions, isLoading, toggleSubscription, deleteSubscription } = useSubscriptions()
  const [searchQuery, setSearchQuery] = useState('')

  // 首页只显示活跃的订阅
  const filteredSubscriptions = subscriptions.filter(sub => {
    // 首先过滤掉非活跃的订阅
    if (!sub.isActive) return false
    
    // 然后按搜索条件过滤
    if (!searchQuery) return true
    
    return sub.eventType.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (sub.contractAddress && sub.contractAddress.toLowerCase().includes(searchQuery.toLowerCase()))
  })

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'Transfer': return '💵'
      case 'Swap': return '🔄'
      case 'Stake': return '📊'
      case 'NFTReceived': return '🖼️'
      default: return '🔐'
    }
  }
  return (
    <div className="rounded-3xl border border-[#162032] bg-[#071427] p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#DDEBFF]">
            Event Subscriptions
          </h2>
          <p className="text-xs text-[#6B7B89]">
            Subscribe to specific contract events
          </p>
        </div>
        {/* Search Input */}
        <div className="rounded-xl border border-[#162032] bg-[#0F1724] px-3 py-2">
          <input
            type="text"
            placeholder="Search contracts"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[113px] bg-transparent text-sm text-[#E6F0FF] placeholder:text-[#E6F0FF] focus:outline-none"
          />
        </div>
      </div>

      {/* Subscription List */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[#6B7B89]" />
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-[#6B7B89]">
              {searchQuery ? 'No active subscriptions found' : 'No active subscriptions yet'}
            </p>
            <p className="mt-2 text-xs text-[#6B7B89]">
              {searchQuery 
                ? 'Try a different search term or check inactive subscriptions in the Subscriptions page'
                : 'Click "New Subscription" in the top right to get started'
              }
            </p>
          </div>
        ) : (
          filteredSubscriptions.slice(0, 3).map((sub) => (
            <div
              key={sub.id}
              className="flex items-center justify-between rounded-xl border border-[#162032] p-2.5"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#091733]">
                  <span className="text-sm">{getEventIcon(sub.eventType)}</span>
                </div>
                <span className="text-sm font-semibold leading-[34px] text-[#DDEBFF]">
                  {sub.eventType}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-[#071322] px-2 py-1">
                  <span className="text-xs text-[#6B7B89]">
                    {sub.contractAddress ? `${sub.contractAddress.slice(0, 6)}...` : 'All contracts'}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-xl bg-[#091733] px-3 py-2.5 text-sm font-medium text-[#C9E9FF] transition-all duration-200 hover:bg-[#0A1A3A] hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-105 active:scale-95"
                  onClick={() => router.push('/subscriptions')}
                >
                  Manage
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

