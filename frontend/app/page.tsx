import { TopBar } from '@/components/dashboard/top-bar'
import { TransactionEventTimeline } from '@/components/dashboard/transaction-event-timeline'
import { WalletActivity } from '@/components/dashboard/wallet-activity'
import { SmartAccountStatus } from '@/components/dashboard/smart-account-status'
import { EventSubscriptions } from '@/components/dashboard/event-subscriptions'
import { NotificationsIntegrations } from '@/components/dashboard/notifications-integrations'

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <TopBar />
      <div className="space-y-4 p-5">
        {/* First Row: Timeline and Wallet Activity */}
        <div className="grid grid-cols-2 gap-4">
          <TransactionEventTimeline />
          <WalletActivity />
        </div>

        {/* Second Row: Smart Account Status and Event Subscriptions */}
        <div className="grid grid-cols-2 gap-4">
          <SmartAccountStatus />
          <EventSubscriptions />
        </div>

        {/* Third Row: Notifications & Integrations (Full Width) */}
        <NotificationsIntegrations />
      </div>
    </div>
  )
}
