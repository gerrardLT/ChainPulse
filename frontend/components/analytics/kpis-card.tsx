'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { useAuthContext } from '@/components/auth-provider'
import { eventsApi } from '@/lib/api'
import { Loader2 } from 'lucide-react'

interface KPIData {
  totalEvents: number
  uniqueWallets: number
  errorRate: string
}

export function KPIsCard() {
  const { isAuthenticated } = useAuthContext()
  const [kpis, setKpis] = useState<KPIData>({
    totalEvents: 0,
    uniqueWallets: 0,
    errorRate: '0%',
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return

    const fetchKPIs = async () => {
      setIsLoading(true)
      try {
        // Fetch total events
        const eventsResponse = await eventsApi.listEvents({ timeRange: '24h', limit: 1000 })
        if (eventsResponse.success && eventsResponse.data) {
          const events = eventsResponse.data
          const totalEvents = events.length

          // Calculate unique wallets
          const uniqueAddresses = new Set(events.map(e => e.contractAddress))
          const uniqueWallets = uniqueAddresses.size

          // Calculate error rate
          const errorEvents = events.filter(e => 
            e.eventType.toLowerCase().includes('error') || 
            e.eventType.toLowerCase().includes('failed')
          )
          const errorRate = totalEvents > 0 
            ? ((errorEvents.length / totalEvents) * 100).toFixed(1) 
            : '0.0'

          setKpis({
            totalEvents,
            uniqueWallets,
            errorRate: `${errorRate}%`,
          })
        }
      } catch (error) {
        console.error('[KPIsCard] Error fetching KPIs:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchKPIs()
  }, [isAuthenticated])

  return (
    <Card className="glass-card flex flex-col border-[#162032] bg-[#071427]">
      <CardHeader className="flex flex-row items-center space-y-0 pb-3">
        <h3 className="text-base font-semibold text-[#DDEBFF]">KPIs</h3>
      </CardHeader>
      <CardContent className="flex gap-3">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-cyan-500" />
          </div>
        ) : (
          <>
            <div className="flex flex-1 flex-col justify-between rounded-xl bg-[#091733] px-3 py-3">
              <p className="whitespace-pre-line text-xs text-[#6B7B89]">
                Total{'\n'}Events
              </p>
              <p className="text-lg font-semibold text-[#DDEBFF]">
                {kpis.totalEvents.toLocaleString()}
              </p>
            </div>
            <div className="flex flex-1 flex-col justify-between rounded-xl bg-[#091733] px-3 py-3">
              <p className="whitespace-pre-line text-xs text-[#6B7B89]">
                Unique{'\n'}Wallets
              </p>
              <p className="text-lg font-semibold text-[#DDEBFF]">
                {kpis.uniqueWallets}
              </p>
            </div>
            <div className="flex flex-1 flex-col justify-between rounded-xl bg-[#091733] px-3 py-3">
              <p className="whitespace-pre-line text-xs text-[#6B7B89]">
                Error{'\n'}Rate
              </p>
              <p className="text-lg font-semibold text-[#DDEBFF]">
                {kpis.errorRate}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

