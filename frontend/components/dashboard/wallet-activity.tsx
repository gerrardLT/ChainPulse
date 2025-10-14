'use client'

import { useState, useMemo } from 'react'
import { useSmartAccount } from '@/hooks/use-smart-account'
import { useSubscriptions } from '@/hooks/use-subscriptions'
import { Loader2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'

export function WalletActivity() {
  const [timeRange, setTimeRange] = useState('24h')
  const { accounts, isLoading: accountsLoading } = useSmartAccount()
  const { subscriptions, isLoading: subscriptionsLoading } = useSubscriptions()

  const isLoading = accountsLoading || subscriptionsLoading

  // 计算统计数据
  const stats = {
    smartAccounts: accounts.length,
    deployedAccounts: accounts.filter((a) => a.isDeployed).length,
    activeSubscriptions: subscriptions.filter((s) => s.isActive).length,
    totalSubscriptions: subscriptions.length,
  }

  // 生成图表数据
  const chartData = useMemo(() => [
    { name: 'Accounts', value: stats.smartAccounts, color: '#7C5CFF' },
    { name: 'Deployed', value: stats.deployedAccounts, color: '#00E6A8' },
    { name: 'Subscriptions', value: stats.totalSubscriptions, color: '#00D9FF' },
    { name: 'Active', value: stats.activeSubscriptions, color: '#FFB86B' },
  ], [stats])

  return (
    <div className="rounded-3xl border border-[#162032] bg-[#071427] p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#DDEBFF]">My Activity</h2>
          <p className="text-xs text-[#6B7B89]">Your smart accounts and subscriptions</p>
        </div>
        {/* Time Range Selector (placeholder for future) */}
        <div className="flex gap-1.5 rounded-full bg-[#091733] p-1">
          {['24h', '7d'].map((range) => (
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
      </div>

      {/* Chart Area */}
      <div className="relative mb-3 h-[220px] overflow-hidden rounded-xl border border-[#162032] bg-gradient-to-b from-[#091733] to-transparent p-3">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-cyan-500" />
          </div>
        ) : chartData.every(d => d.value === 0) ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="text-sm text-[#6B7B89] mb-2">No activity yet</div>
              <div className="text-xs text-[#6B7B89]/70">Connect a wallet and create smart accounts</div>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#162032" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#6B7B89" 
                style={{ fontSize: '11px' }}
                tick={{ fill: '#6B7B89' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#6B7B89" 
                style={{ fontSize: '11px' }}
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
                  fontSize: '12px',
                }}
                labelStyle={{ color: '#DDEBFF' }}
                cursor={{ fill: 'rgba(0, 230, 168, 0.1)' }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-[#6B7B89]" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-[#091733] p-3">
            <p className="mb-1 text-xs text-[#6B7B89]">Smart Accounts</p>
            <div className="flex items-baseline gap-2">
              <p className="text-lg font-semibold text-[#DDEBFF]">{stats.smartAccounts}</p>
              <p className="text-xs text-[#00E6A8]">
                {stats.deployedAccounts} deployed
              </p>
            </div>
          </div>
          <div className="rounded-xl bg-[#091733] p-3">
            <p className="mb-1 text-xs text-[#6B7B89]">Subscriptions</p>
            <div className="flex items-baseline gap-2">
              <p className="text-lg font-semibold text-[#DDEBFF]">{stats.totalSubscriptions}</p>
              <p className="text-xs text-[#00E6A8]">
                {stats.activeSubscriptions} active
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
