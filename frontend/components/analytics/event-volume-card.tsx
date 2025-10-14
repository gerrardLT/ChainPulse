'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useEvents } from '@/hooks/use-events'
import { Loader2 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { format, parseISO, subHours } from 'date-fns'

export function EventVolumeCard() {
  const { events, isLoading } = useEvents({ timeRange: '24h', limit: 100 })

  // 生成图表数据（按小时分组，按事件类型分类）
  const chartData = useMemo(() => {
    const now = new Date()
    const hourlyData = new Map<string, { time: string; transfers: number; swaps: number; errors: number }>()
    
    // 初始化24小时数据
    for (let i = 0; i < 24; i++) {
      const time = subHours(now, 23 - i)
      const key = format(time, 'HH:mm')
      hourlyData.set(key, { time: key, transfers: 0, swaps: 0, errors: 0 })
    }
    
    // 统计事件
    events.forEach(event => {
      try {
        const eventTime = parseISO(event.blockTimestamp)
        const key = format(eventTime, 'HH:mm')
        const data = hourlyData.get(key)
        if (data) {
          const type = event.eventType.toLowerCase()
          if (type.includes('transfer')) data.transfers++
          else if (type.includes('swap')) data.swaps++
          else if (type.includes('error') || type.includes('fail')) data.errors++
        }
      } catch {
        // Ignore invalid timestamps
      }
    })
    
    return Array.from(hourlyData.values())
  }, [events])

  const legendItems = [
    { label: 'Transfers', color: '#00E6A8', dataKey: 'transfers' },
    { label: 'Swaps', color: '#FFB86B', dataKey: 'swaps' },
    { label: 'Errors', color: '#FF6B6B', dataKey: 'errors' },
  ]

  return (
    <Card className="glass-card flex flex-col border-[#162032] bg-[#071427]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <h3 className="text-base font-semibold text-[#DDEBFF]">Event Volume</h3>
        <div className="rounded-full bg-[#071322] px-2 py-1 text-xs text-[#6B7B89]">
          Last 24h
        </div>
      </CardHeader>
      <CardContent className="flex flex-grow flex-col">
        {/* Chart */}
        <div className="mb-3 h-[220px] rounded-3xl border border-[#162032] bg-gradient-to-b from-[#091733] to-transparent p-3">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-cyan-500" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-[#6B7B89]">No event data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#162032" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="#6B7B89" 
                  style={{ fontSize: '10px' }}
                  tick={{ fill: '#6B7B89' }}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#6B7B89" 
                  style={{ fontSize: '10px' }}
                  tick={{ fill: '#6B7B89' }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#091733',
                    border: '1px solid #162032',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                  labelStyle={{ color: '#DDEBFF' }}
                />
                {legendItems.map((item) => (
                  <Line
                    key={item.dataKey}
                    type="monotone"
                    dataKey={item.dataKey}
                    stroke={item.color}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Legend */}
        <div className="flex gap-3">
          {legendItems.map((item) => (
            <div key={item.label} className="flex items-center gap-2 rounded-full bg-[#071322] px-2 py-1">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-[#6B7B89]">{item.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

