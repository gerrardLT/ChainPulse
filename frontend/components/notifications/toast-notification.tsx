'use client'

import { useEffect, useState } from 'react'
import { X, Bell } from 'lucide-react'
import { useWebSocket } from '@/hooks/use-websocket'

interface ToastData {
  id: string
  title: string
  content: string
  timestamp: string
}

export function ToastNotification() {
  const [toasts, setToasts] = useState<ToastData[]>([])
  const { lastNotification } = useWebSocket()
  
  // Listen for new notifications from WebSocket
  useEffect(() => {
    if (lastNotification) {
      const newToast: ToastData = {
        id: lastNotification.id || Date.now().toString(),
        title: `New Event: ${lastNotification.eventType || 'Notification'}`,
        content: `${lastNotification.title || lastNotification.content} • now`,
        timestamp: new Date().toISOString()
      }
      
      setToasts(prev => [...prev, newToast])
      
      // Auto dismiss after 5 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newToast.id))
      }, 5000)
    }
  }, [lastNotification])
  
  const handleDismiss = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }
  
  if (toasts.length === 0) return null
  
  return (
    <div className="fixed bottom-5 right-5 z-50 space-y-3">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="flex w-[340px] items-center gap-2.5 rounded-3xl border border-[#162032] bg-[#071427] p-[13px] shadow-lg"
        >
          {/* Icon */}
          <div className="flex items-center justify-center">
            <Bell className="h-[18px] w-[18px] text-[#E6F0FF]" />
          </div>
          
          {/* Content */}
          <div className="flex-1 px-5">
            <div className="mb-0.5">
              <h3 className="text-sm font-semibold leading-tight text-[#E6F0FF]">
                {toast.title}
              </h3>
            </div>
            <div>
              <p className="whitespace-pre-line text-xs leading-tight text-[#6B7B89]">
                {toast.content}
              </p>
            </div>
          </div>
          
          {/* Dismiss Button */}
          <button 
            className="rounded-xl bg-[#091733] px-3 py-2 text-sm font-medium leading-tight text-[#C9E9FF] transition-colors hover:bg-[#0A1A3A]"
            onClick={() => handleDismiss(toast.id)}
          >
            Dismiss
          </button>
        </div>
      ))}
    </div>
  )
}

