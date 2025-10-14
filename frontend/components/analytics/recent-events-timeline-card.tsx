'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { useEvents } from '@/hooks/use-events'
import { formatDistanceToNow } from 'date-fns'

export function RecentEventsTimelineCard() {
  const { events, isLoading } = useEvents({ timeRange: '24h', limit: 5 })

  const getEventIcon = (eventType: string) => {
    const type = eventType.toLowerCase()
    if (type.includes('transfer')) return '💸'
    if (type.includes('swap')) return '🔄'
    if (type.includes('deposit')) return '⬇️'
    if (type.includes('withdrawal')) return '⬆️'
    if (type.includes('error') || type.includes('fail')) return '❌'
    return '📝'
  }

  const formatEventDescription = (event: any) => {
    const address = `${event.contractAddress.slice(0, 6)}...${event.contractAddress.slice(-4)}`
    return `${event.eventType} at ${address}`
  }

  return (
    <Card className="glass-card border-[#162032] bg-[#071427]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <h3 className="text-base font-semibold text-[#DDEBFF]">
            Recent Events Timeline
          </h3>
          <p className="text-xs text-[#6B7B89]">
            Chronological stream of key on-chain activities
          </p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-[#6B7B89]" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-[#6B7B89]">No recent events</p>
          </div>
        ) : (
          events.slice(0, 3).map((event, index) => (
          <div
            key={index}
            className="flex items-center justify-center gap-3 rounded-xl border border-[#162032] px-3 py-3"
          >
            <div className="flex h-[18px] w-[18px] items-center justify-center">
              <span className="text-sm">{getEventIcon(event.eventType)}</span>
            </div>
            <div className="flex-1">
              <p className="text-base text-[#DDEBFF]">{formatEventDescription(event)}</p>
            </div>
            <div className="rounded-full bg-[#071322] px-2 py-1 text-xs text-[#6B7B89]">
              {formatDistanceToNow(new Date(event.blockTimestamp), { addSuffix: true })}
            </div>
          </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

