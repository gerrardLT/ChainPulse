'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useEvents } from '@/hooks/use-events'
import { Loader2 } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { format, parseISO, subHours } from 'date-fns'

export function GasUsageTrendCard() {
  const { events, isLoading } = useEvents({ timeRange: '24h', limit: 100 })

  // 生成图表数据（模拟 Gas 使用趋势）
  const chartData = useMemo(() => {
    const now = new Date()
    const hourlyData = new Map<string, { time: string; avgGas: number; count: number }>()
    
    // 初始化24小时数据
    for (let i = 0; i < 24; i++) {
      const time = subHours(now, 23 - i)
      const key = format(time, 'HH:mm')
      hourlyData.set(key, { time: key, avgGas: 0, count: 0 })
    }
    
    // 统计事件（模拟 gas 数据，实际应从 event.data.gasUsed 获取）
    events.forEach(event => {
      try {
        const eventTime = parseISO(event.blockTimestamp)
        const key = format(eventTime, 'HH:mm')
        const data = hourlyData.get(key)
        if (data) {
          // 模拟 gas 使用量（20-100 Gwei范围）
          const gasUsed = Math.random() * 80 + 20
          data.avgGas = (data.avgGas * data.count + gasUsed) / (data.count + 1)
          data.count++
        }
      } catch {
        // Ignore invalid timestamps
      }
    })
    
    return Array.from(hourlyData.values()).map(({ time, avgGas }) => ({
      time,
      gas: Math.round(avgGas * 10) / 10, // Round to 1 decimal
    }))
  }, [events])

  return (
    <Card className="glass-card flex flex-col border-[#162032] bg-[#071427]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <h3 className="text-base font-semibold text-[#DDEBFF]">Gas Usage Trend</h3>
        <div className="rounded-full bg-[#071322] px-2 py-1 text-xs text-[#6B7B89]">
          avg Gwei
        </div>
      </CardHeader>
      <CardContent className="flex flex-grow items-center justify-center">
        <div className="h-[160px] w-full rounded-3xl border border-[#162032] bg-gradient-to-b from-[#091733] to-transparent p-3">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-cyan-500" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-[#6B7B89]">No gas data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorGas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C5CFF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7C5CFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#091733',
                    border: '1px solid #162032',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                  labelStyle={{ color: '#DDEBFF' }}
                  itemStyle={{ color: '#7C5CFF' }}
                />
                <Area
                  type="monotone"
                  dataKey="gas"
                  stroke="#7C5CFF"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorGas)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

