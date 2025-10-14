'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface WalletData {
  address: string
  transactions: number
  shortAddress?: string
}

interface Props {
  data: WalletData[]
  height?: number
}

const COLORS = ['#00E6A8', '#7C5CFF', '#FFB86B', '#00D27A', '#C9E9FF', '#9FBED9', '#6B7B89', '#52A8FF', '#FF6B9D', '#FFD93D']

export function ActiveWalletsChart({ data, height = 300 }: Props) {
  // Format addresses for display
  const formattedData = data.map((item) => ({
    ...item,
    shortAddress: `${item.address.slice(0, 6)}...${item.address.slice(-4)}`,
  }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={formattedData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        layout="vertical"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#162032" />
        <XAxis type="number" stroke="#6B7B89" style={{ fontSize: '12px' }} />
        <YAxis
          type="category"
          dataKey="shortAddress"
          stroke="#6B7B89"
          style={{ fontSize: '11px' }}
          width={80}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#0F1724',
            border: '1px solid #162032',
            borderRadius: '8px',
            color: '#E6F0FF',
          }}
          labelStyle={{ color: '#9FBED9' }}
          formatter={(value: number, name: string, props: any) => [
            value,
            'Transactions',
          ]}
          labelFormatter={(label: string, payload: any) => {
            if (payload && payload.length > 0) {
              return payload[0].payload.address
            }
            return label
          }}
        />
        <Bar dataKey="transactions" radius={[0, 8, 8, 0]}>
          {formattedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
