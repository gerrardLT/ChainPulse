'use client'

import { formatDistanceToNow } from 'date-fns'
import { CheckCircle, AlertCircle, Info, Zap, ArrowRightLeft } from 'lucide-react'

interface NotificationItemProps {
  notification: {
    id: string
    title: string
    content: string
    eventType: string
    priority: string
    isRead: boolean
    createdAt: string
  }
  onDismiss: () => void
}

export function NotificationItem({ notification, onDismiss }: NotificationItemProps) {
  const getIcon = () => {
    switch (notification.eventType) {
      case 'Transfer':
        return <CheckCircle className="h-[18px] w-[18px] text-[#DDEBFF]" />
      case 'Swap':
        return <ArrowRightLeft className="h-[18px] w-[18px] text-[#DDEBFF]" />
      case 'Stake':
        return <Zap className="h-[18px] w-[18px] text-[#DDEBFF]" />
      case 'Error':
        return <AlertCircle className="h-[18px] w-[18px] text-[#DDEBFF]" />
      default:
        return <Info className="h-[18px] w-[18px] text-[#DDEBFF]" />
    }
  }
  
  const getTimeAgo = () => {
    return formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
      .replace('about ', '')
      .replace(' ago', ' ago')
  }
  
  const getActionButton = () => {
    switch (notification.eventType) {
      case 'Transfer':
        return 'Open'
      case 'Swap':
        return 'Details'
      case 'Error':
        return 'Inspect'
      default:
        return 'View'
    }
  }
  
  const getTimeClass = () => {
    if (notification.priority === 'urgent') {
      return 'bg-[#FFB86B] text-[#3A2100]'
    }
    return 'bg-[#071322] text-[#6B7B89]'
  }
  
  return (
    <div className={`flex items-center justify-center gap-2.5 rounded-xl border p-3 transition-colors ${
      notification.isRead 
        ? 'border-[#162032] opacity-70' 
        : 'border-[#162032] bg-[#071427]'
    }`}>
      {/* Icon */}
      <div className="flex items-center justify-center">
        {getIcon()}
      </div>
      
      {/* Content */}
      <div className="flex-1">
        <div className="mb-0.5">
          <h3 className="text-sm font-semibold leading-tight text-[#DDEBFF]">
            {notification.title}
          </h3>
        </div>
        <div>
          <p className="text-xs leading-tight text-[#6B7B89]">
            {notification.content}
          </p>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-2">
        <div className={`rounded-full px-2 py-1 text-xs leading-tight ${getTimeClass()}`}>
          {getTimeAgo()}
        </div>
        <button 
          className="rounded-xl bg-[#091733] px-3 py-2 text-sm font-medium leading-tight text-[#C9E9FF] transition-colors hover:bg-[#0A1A3A]"
          onClick={() => {
            // TODO: Implement view/open logic
            console.log('View notification:', notification.id)
          }}
        >
          {getActionButton()}
        </button>
        <button 
          className="rounded-xl bg-[#091733] px-3 py-2 text-sm font-medium leading-tight text-[#C9E9FF] transition-colors hover:bg-[#0A1A3A]"
          onClick={onDismiss}
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}

