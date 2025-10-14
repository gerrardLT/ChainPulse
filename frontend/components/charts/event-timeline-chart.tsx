'use client'

import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { format, parseISO } from 'date-fns'

interface EventData {
  date: string
  transactions: number
  transfers: number
  stakes: number
}

interface Props {
  data: EventData[]
  height?: number
}

export function EventTimelineChart({ data, height = 300 }: Props) {
  const formattedData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      date: format(parseISO(item.date), 'MM/dd'),
    }))
  }, [data])

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#162032" />
        <XAxis
          dataKey="date"
          stroke="#6B7B89"
          style={{ fontSize: '12px' }}
        />
        <YAxis
          stroke="#6B7B89"
          style={{ fontSize: '12px' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#0F1724',
            border: '1px solid #162032',
            borderRadius: '8px',
            color: '#E6F0FF',
          }}
          labelStyle={{ color: '#9FBED9' }}
        />
        <Legend
          wrapperStyle={{
            fontSize: '12px',
            color: '#9FBED9',
          }}
        />
        <Line
          type="monotone"
          dataKey="transactions"
          stroke="#00E6A8"
          strokeWidth={2}
          dot={{ fill: '#00E6A8', r: 4 }}
          activeDot={{ r: 6 }}
          name="Transactions"
        />
        <Line
          type="monotone"
          dataKey="transfers"
          stroke="#7C5CFF"
          strokeWidth={2}
          dot={{ fill: '#7C5CFF', r: 4 }}
          activeDot={{ r: 6 }}
          name="Transfers"
        />
        <Line
          type="monotone"
          dataKey="stakes"
          stroke="#FFB86B"
          strokeWidth={2}
          dot={{ fill: '#FFB86B', r: 4 }}
          activeDot={{ r: 6 }}
          name="Stakes"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
