'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { useEvents } from '@/hooks/use-events'
import { Loader2 } from 'lucide-react'
import { formatDistanceToNow, parseISO, format, subHours } from 'date-fns'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const legendItems = [
  { label: 'Transfers', color: '#7C5CFF' },
  { label: 'Contract Calls', color: '#00E6A8' },
  { label: 'Errors', color: '#FFB86B' },
]

export function TransactionEventTimeline() {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h')
  const [filterQuery, setFilterQuery] = useState('')
  
  // 🔥 使用真实的 Events Hook
  const { events, isLoading, refresh } = useEvents({ timeRange, limit: 10 })

  // 客户端过滤
  const filteredEvents = events.filter(event => {
    if (!filterQuery) return true
    const query = filterQuery.toLowerCase()
    return (
      event.contractAddress.toLowerCase().includes(query) ||
      event.eventType.toLowerCase().includes(query) ||
      event.transactionHash.toLowerCase().includes(query)
    )
  })

  const getEventStatus = (eventType: string) => {
    const type = eventType.toLowerCase()
    if (type.includes('transfer')) {
      return {
        color: '#00D27A',
        text: 'Success',
        textColor: '#002E21',
      }
    } else if (type.includes('error') || type.includes('fail')) {
      return {
        color: '#FFB86B',
        text: 'Warning',
        textColor: '#3A2100',
      }
    } else {
      return {
        color: '#071322',
        text: 'New Event',
        textColor: '#6B7B89',
      }
    }
  }

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch {
      return 'recently'
    }
  }

  // 生成图表数据（按小时分组）
  const chartData = useMemo(() => {
    const now = new Date()
    const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720 // 24h, 7d, 30d
    const interval = timeRange === '24h' ? 1 : timeRange === '7d' ? 6 : 24 // 1h, 6h, 1d
    
    const hourlyData = new Map<string, number>()
    
    // 初始化所有时间点为 0
    for (let i = 0; i < hours / interval; i++) {
      const time = subHours(now, (hours / interval - i - 1) * interval)
      const key = format(time, timeRange === '24h' ? 'HH:mm' : 'MM/dd')
      hourlyData.set(key, 0)
    }
    
    // 统计事件数量
    events.forEach(event => {
      try {
        const eventTime = parseISO(event.blockTimestamp)
        const key = format(eventTime, timeRange === '24h' ? 'HH:mm' : 'MM/dd')
        if (hourlyData.has(key)) {
          hourlyData.set(key, (hourlyData.get(key) || 0) + 1)
        }
      } catch {
        // Ignore invalid timestamps
      }
    })
    
    return Array.from(hourlyData.entries()).map(([time, count]) => ({
      time,
      events: count,
    }))
  }, [events, timeRange])

  return (
    <div className="rounded-3xl border border-[#162032] bg-[#071427] p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold leading-[60px] text-[#DDEBFF]">
            Transaction Event Timeline
          </h2>
          <p className="text-xs leading-[45px] text-[#6B7B89]">
            Real-time stream of on-chain events
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Time Range Selector */}
          <div className="flex gap-1.5 rounded-full bg-[#091733] p-1">
            {(['24h', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`rounded-full px-2.5 py-1.5 text-[13px] transition-all duration-200 ${
                  timeRange === range
                    ? 'bg-[#0B1020] text-[#E6F0FF] shadow-md'
                    : 'text-[#C9E9FF] hover:bg-[#0A1A3A] hover:scale-105 active:scale-95'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          {/* Filter Input */}
          <div className="rounded-xl border border-[#162032] bg-[#0F1724] px-3 py-2">
            <input
              type="text"
              placeholder="Filter: address / topic"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-[103px] bg-transparent text-sm text-[#E6F0FF] placeholder:text-[#E6F0FF] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative mb-3 h-[220px] overflow-hidden rounded-xl border border-[#162032] bg-gradient-to-b from-[#091733] to-transparent p-3">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-cyan-500" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-sm text-[#6B7B89]">No events in this time range</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00E6A8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00E6A8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#162032" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#6B7B89" 
                style={{ fontSize: '11px' }}
                tick={{ fill: '#6B7B89' }}
                tickLine={false}
              />
              <YAxis 
                stroke="#6B7B89" 
                style={{ fontSize: '11px' }}
                tick={{ fill: '#6B7B89' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#091733',
                  border: '1px solid #162032',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: '#DDEBFF' }}
                itemStyle={{ color: '#00E6A8' }}
              />
              <Area
                type="monotone"
                dataKey="events"
                stroke="#00E6A8"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorEvents)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend */}
      <div className="mb-3 flex gap-3">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div
              className="h-2 w-2 rounded"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-[#6B7B89]">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Event List */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[#6B7B89]" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-[#6B7B89]">
              {filterQuery ? 'No events match your filter' : 'No events found'}
            </p>
            <Button
              size="sm"
              variant="ghost"
              className="mt-2 text-[#C9E9FF] hover:text-[#E6F0FF]"
              onClick={refresh}
            >
              Refresh
            </Button>
          </div>
        ) : (
          filteredEvents.map((event) => {
            const status = getEventStatus(event.eventType)
            return (
              <div
                key={event.id}
                className="flex items-center gap-3 rounded-xl border border-[#162032] p-2.5"
              >
                {/* Status Badge */}
                <div
                  className="rounded-full px-2 py-1"
                  style={{ backgroundColor: status.color }}
                >
                  <span
                    className="text-xs"
                    style={{ color: status.textColor }}
                  >
                    {status.text}
                  </span>
                </div>

                {/* Event Details */}
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-[#DDEBFF]">
                    {event.eventType}
                  </h3>
                  <p className="text-xs text-[#6B7B89]">
                    {event.contractAddress.slice(0, 6)}...{event.contractAddress.slice(-4)} • 
                    tx: {event.transactionHash.slice(0, 6)}…{event.transactionHash.slice(-4)} • 
                    {formatTime(event.blockTimestamp)}
                  </p>
                </div>

                {/* Action Button */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-xl bg-[#091733] px-3 py-2.5 text-sm font-medium text-[#C9E9FF] transition-all duration-200 hover:bg-[#0A1A3A] hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-105 active:scale-95"
                  onClick={() => {
                    // TODO: Open event details modal or navigate to explorer
                    window.open(
                      `https://sepolia.etherscan.io/tx/${event.transactionHash}`,
                      '_blank'
                    )
                  }}
                >
                  View
                </Button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
