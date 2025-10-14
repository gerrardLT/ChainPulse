"use client"

import { Bell, CheckCheck, ExternalLink, Trash2 } from "lucide-react"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { ScrollArea } from "./ui/scroll-area"
import { Skeleton } from "./ui/skeleton"
import { useNotificationsApi } from "@/hooks/use-notifications-api"
import { useAccount } from "wagmi"
import { cn } from "@/lib/utils"

export function NotificationCenter() {
  const { isConnected } = useAccount()
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, clearNotification } = useNotificationsApi()

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      transfer: "💸",
      swap: "🔄",
      deposit: "⬇️",
      withdrawal: "⬆️",
      automation: "🤖",
      subscription: "📢",
      default: "🔔",
    }
    return icons[type.toLowerCase()] || icons.default
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-400"
      case "medium":
        return "text-yellow-400"
      case "low":
        return "text-blue-400"
      default:
        return "text-cyan-400"
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative h-9 w-9 hover:bg-cyan-500/10 hover:border-cyan-500/50 border border-transparent transition-all duration-200",
            unreadCount > 0 && "animate-pulse-glow",
          )}
        >
          <Bell className="h-4 w-4 text-cyan-400" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center bg-gradient-to-r from-cyan-500 to-purple-500 border-none shadow-[0_0_10px_rgba(0,255,255,0.5)] animate-pulse"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0 glass-card border-cyan-500/20 animate-slide-in" align="end">
        <div className="flex items-center justify-between border-b border-cyan-500/20 p-4 bg-gradient-to-r from-cyan-500/5 to-purple-500/5">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-cyan-400">Notifications</h3>
            <div
              className={cn(
                "h-2 w-2 rounded-full transition-all duration-300",
                isConnected ? "bg-cyan-400 shadow-[0_0_8px_rgba(0,255,255,0.6)]" : "bg-muted",
              )}
            />
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-8 gap-2 hover:bg-cyan-500/10 hover:text-cyan-400 transition-all duration-200"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            // 加载骨架屏
            <div className="divide-y divide-cyan-500/10">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="p-4">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-cyan-400/50 mb-4" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                {isConnected ? "You'll see notifications here when events are triggered" : "Connect your wallet to see notifications"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-cyan-500/10">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "group relative p-4 hover:bg-gradient-to-r hover:from-cyan-500/5 hover:to-purple-500/5 transition-all duration-200 cursor-pointer border-l-2 border-transparent hover:border-cyan-500/50",
                    !notification.isRead && "bg-cyan-500/5 border-l-cyan-500",
                  )}
                  onClick={() => !notification.isRead && markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("text-2xl", getPriorityColor(notification.priority))}>
                      {getNotificationIcon(notification.eventType)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium leading-none">{notification.title}</p>
                          {!notification.isRead && <div className="h-2 w-2 rounded-full bg-cyan-400 mt-0.5 shadow-[0_0_6px_rgba(0,255,255,0.6)]" />}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation()
                            clearNotification(notification.id)
                          }}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          {notification.priority}
                        </Badge>
                        <span>•</span>
                        <span>{formatTimestamp(notification.createdAt)}</span>
                        {notification.metadata?.txHash && (
                          <>
                            <span>•</span>
                            <button
                              className="flex items-center gap-1 hover:text-cyan-400 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation()
                                window.open(`https://etherscan.io/tx/${notification.metadata.txHash}`, "_blank")
                              }}
                            >
                              View tx
                              <ExternalLink className="h-3 w-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
