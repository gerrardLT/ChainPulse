'use client'

import { TopBar } from '@/components/dashboard/top-bar'
import { NotificationListCard } from '@/components/notifications/notification-list-card'
import { MutedRulesCard } from '@/components/notifications/muted-rules-card'
import { ToastNotification } from '@/components/notifications/toast-notification'

export default function NotificationsPage() {
  return (
    <div className="min-h-screen">
      <TopBar />
      
      <div className="space-y-4 p-5">
        {/* Notification Center Card */}
        <NotificationListCard />
        
        {/* Muted & Rules Card */}
        <MutedRulesCard />
      </div>
      
      {/* Toast Notification (Fixed Bottom Right) */}
      <ToastNotification />
    </div>
  )
}

