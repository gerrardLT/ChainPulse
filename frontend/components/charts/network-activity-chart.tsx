'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { useMemo } from 'react'

interface NetworkActivityData {
  date: string
  gasUsed: number
  activeAccounts: number
}

interface Props {
  data: NetworkActivityData[]
  height?: number
}

export function NetworkActivityChart({ data, height = 300 }: Props) {
  const formattedData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      date: format(parseISO(item.date), 'MM/dd'),
    }))
  }, [data])

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorGas" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00E6A8" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#00E6A8" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorAccounts" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7C5CFF" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#7C5CFF" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#162032" />
        <XAxis dataKey="date" stroke="#6B7B89" style={{ fontSize: '12px' }} />
        <YAxis stroke="#6B7B89" style={{ fontSize: '12px' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#0F1724',
            border: '1px solid #162032',
            borderRadius: '8px',
            color: '#E6F0FF',
          }}
          labelStyle={{ color: '#9FBED9' }}
        />
        <Area
          type="monotone"
          dataKey="gasUsed"
          stroke="#00E6A8"
          fillOpacity={1}
          fill="url(#colorGas)"
          name="Gas Used"
        />
        <Area
          type="monotone"
          dataKey="activeAccounts"
          stroke="#7C5CFF"
          fillOpacity={1}
          fill="url(#colorAccounts)"
          name="Active Accounts"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
