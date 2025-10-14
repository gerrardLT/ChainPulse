'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AnalyticsHeader } from '@/components/analytics/analytics-header'
import { EventVolumeCard } from '@/components/analytics/event-volume-card'
import { TopContractsCard } from '@/components/analytics/top-contracts-card'
import { KPIsCard } from '@/components/analytics/kpis-card'
import { GasUsageTrendCard } from '@/components/analytics/gas-usage-trend-card'
import { TopWalletsCard } from '@/components/analytics/top-wallets-card'
import { RecentEventsTimelineCard } from '@/components/analytics/recent-events-timeline-card'
import { Bell, X } from 'lucide-react'
import { useAuthContext } from '@/components/auth-provider'

export default function AnalyticsPage() {
  const { isAuthenticated } = useAuthContext()
  const [showNotification, setShowNotification] = useState(true)

  return (
    <div className="min-h-screen bg-[#06101B]">
      {/* Main Content */}
      <div className="space-y-4 p-5">
        {/* Analytics Header */}
        <AnalyticsHeader />

        {/* Content Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Left Column: Event Volume + Top Contracts */}
          <div className="flex flex-col gap-4">
            <EventVolumeCard />
            <TopContractsCard />
          </div>

          {/* Right Column: KPIs + Gas Usage Trend + Top Wallets */}
          <div className="flex flex-col gap-4">
            <KPIsCard />
            <GasUsageTrendCard />
            <TopWalletsCard />
          </div>
        </div>

        {/* Recent Events Timeline - Full Width */}
        <RecentEventsTimelineCard />
      </div>

      {/* Toast Notification (Bottom Right) */}
      {showNotification && (
        <div className="fixed bottom-5 right-5 z-50 w-[340px]">
          <Card className="glass-card border-[#162032] bg-[#071427] shadow-lg">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#091733]">
                <Bell className="h-5 w-5 text-[#E6F0FF]" />
              </div>
              <div className="flex-1 space-y-0.5 py-4">
                <h4 className="text-sm font-semibold text-[#E6F0FF]">
                  Analytics Loaded
                </h4>
                <p className="text-xs text-[#6B7B89]">
                  Metrics updated for the last 24 hours
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotification(false)}
                className="glass-card rounded-xl bg-[#091733] px-3 py-2 text-sm font-medium text-[#C9E9FF] hover:bg-[#0A1A3A]"
              >
                Dismiss
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

