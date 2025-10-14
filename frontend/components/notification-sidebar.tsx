'use client'

import { Bell, CheckCheck, Settings, Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import { useNotificationsApi } from '@/hooks/use-notifications-api'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'

export function NotificationSidebar() {
  const router = useRouter()
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotificationsApi()
  return (
    <aside className="fixed right-0 top-0 z-40 h-screen w-[217px] border-l border-[#162032] bg-[#071427]">
      {/* Header */}
      <div className="border-b border-[#162032] p-4">
        <div className="mb-4 flex items-center gap-2.5">
          <Bell className="h-[18px] w-[18px] text-[#E6F0FF]" />
          <h2 className="text-base font-semibold leading-tight text-[#E6F0FF]">
            Notification Center
          </h2>
        </div>
        {unreadCount > 0 && (
          <div className="inline-flex rounded-full bg-[#071322] px-3 py-1">
            <p className="text-xs leading-[30px] text-[#6B7B89]">{unreadCount} new</p>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="space-y-3 p-4">
        <div className="flex justify-center gap-2">
          <div className="rounded-xl border border-[#162032] bg-[#0F1724] px-3 py-2">
            <span className="text-sm text-[#E6F0FF]">Type: All</span>
          </div>
          <div className="rounded-xl border border-[#162032] bg-[#0F1724] px-3 py-2">
            <span className="text-sm leading-[34px] text-[#E6F0FF]">Sort: Latest</span>
          </div>
        </div>

        {/* Notification List */}
        <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#6B7B89]" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 mx-auto mb-2 text-[#6B7B89]" />
              <p className="text-sm text-[#6B7B89]">No notifications yet</p>
            </div>
          ) : (
            notifications.slice(0, 10).map((notification) => {
              const icon = notification.eventType === 'Transfer' ? '⇄' : 
                          notification.eventType === 'Stake' ? '📊' :
                          notification.priority === 'urgent' ? '⚠' : '✓'
              
              return (
                <div
                  key={notification.id}
                  className={`flex gap-2.5 rounded-xl border p-2.5 ${
                    notification.isRead 
                      ? 'border-[#162032] opacity-60' 
                      : 'border-[#00E6A8]/30 bg-[#00E6A8]/5'
                  }`}
                  onClick={() => !notification.isRead && markAsRead(notification.id)}
                >
                  <div className="flex h-full items-start pt-2">
                    <div className="flex h-[18px] w-[18px] items-center justify-center text-xs">
                      {icon}
                    </div>
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <h3 className="text-xs font-semibold leading-[30px] text-[#E6F0FF]">
                      {notification.title}
                    </h3>
                    <p className="text-xs leading-[60px] text-[#6B7B89]">
                      {notification.content} • {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-auto rounded-xl bg-[#091733] px-3 py-2.5 text-sm font-medium text-[#C9E9FF] hover:bg-[#0A1A3A]"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push('/notifications')
                    }}
                  >
                    Details
                  </Button>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-[#162032] p-4">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            className="flex-1 rounded-xl bg-[#091733] px-3 py-2.5 text-sm font-medium leading-[34px] text-[#C9E9FF] hover:bg-[#0A1A3A]"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            Mark all read
          </Button>
          <Button 
            className="flex-1 rounded-xl bg-[#00E6A8] px-3 py-2.5 text-sm font-medium leading-[34px] text-[#001217] hover:bg-[#00D29A]"
            onClick={() => router.push('/settings')}
          >
            Notification Settings
          </Button>
        </div>
      </div>
    </aside>
  )
}

