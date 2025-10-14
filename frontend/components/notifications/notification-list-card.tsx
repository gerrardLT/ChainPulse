'use client'

import { useState } from 'react'
import { useNotificationsApi } from '@/hooks/use-notifications-api'
import { useMutedRules } from '@/hooks/use-muted-rules'
import { NotificationItem } from './notification-item'
import { Loader2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function NotificationListCard() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortBy, setSortBy] = useState('latest')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  
  const { 
    notifications, 
    isLoading, 
    markAllAsRead, 
    clearNotification 
  } = useNotificationsApi()
  
  const { rules } = useMutedRules()
  
  // Filter notifications based on active tab and search
  const filteredNotifications = notifications.filter(notification => {
    // Tab filter
    if (activeTab !== 'all') {
      const tabMatch = {
        'errors': notification.priority === 'urgent',
        'automation': notification.eventType === 'Automation',
        'transfers': notification.eventType === 'Transfer'
      }
      if (tabMatch[activeTab as keyof typeof tabMatch] === false) return false
    }
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        notification.title.toLowerCase().includes(searchLower) ||
        notification.content.toLowerCase().includes(searchLower)
      )
    }
    
    return true
  })
  
  // Sort notifications
  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    if (sortBy === 'latest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    } else {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    }
  })
  
  // Paginate
  const totalPages = Math.ceil(sortedNotifications.length / pageSize)
  const paginatedNotifications = sortedNotifications.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )
  
  // Calculate stats
  const isToday = (date: string) => {
    const today = new Date()
    const notifDate = new Date(date)
    return (
      notifDate.getDate() === today.getDate() &&
      notifDate.getMonth() === today.getMonth() &&
      notifDate.getFullYear() === today.getFullYear()
    )
  }
  
  const isNew = (date: string) => {
    const now = new Date()
    const notifDate = new Date(date)
    const diffMinutes = (now.getTime() - notifDate.getTime()) / 1000 / 60
    return diffMinutes < 5 // New if within 5 minutes
  }
  
  const stats = {
    new: notifications.filter(n => !n.isRead && isNew(n.createdAt)).length,
    today: notifications.filter(n => isToday(n.createdAt)).length,
    muted: rules.length // Real count from automation rules API
  }
  
  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to delete all notifications?')) {
      for (const notification of notifications) {
        await clearNotification(notification.id)
      }
    }
  }
  
  return (
    <div className="rounded-3xl border border-[#162032] bg-[#071427] p-[17px]">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold leading-tight text-[#DDEBFF]">
            Notification Center
          </h2>
          <p className="text-xs leading-tight text-[#6B7B89]">
            Review, filter, and manage all alerts
          </p>
        </div>
        
        {/* Category Tabs */}
        <div className="flex gap-1.5 rounded-full bg-[#091733] p-1">
          {[
            { id: 'all', label: 'All' },
            { id: 'errors', label: 'Errors' },
            { id: 'automation', label: 'Automation' },
            { id: 'transfers', label: 'Transfers' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`rounded-full px-2.5 py-1.5 text-[13px] transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#0B1020] text-[#E6F0FF]'
                  : 'text-[#C9E9FF] hover:text-[#E6F0FF]'
              }`}
              onClick={() => {
                setActiveTab(tab.id)
                setCurrentPage(1) // Reset to first page when changing tab
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Stats Row */}
      <div className="mb-3 flex justify-center gap-3">
        <div className="flex flex-1 items-center justify-between rounded-xl bg-[#091733] p-3">
          <div className="text-xs leading-tight text-[#6B7B89]">New</div>
          <div className="text-lg font-semibold leading-tight text-[#DDEBFF]">{stats.new}</div>
        </div>
        <div className="flex flex-1 items-center justify-between rounded-xl bg-[#091733] p-3">
          <div className="text-xs leading-tight text-[#6B7B89]">Today</div>
          <div className="text-lg font-semibold leading-tight text-[#DDEBFF]">{stats.today}</div>
        </div>
        <div className="flex flex-1 items-center justify-between rounded-xl bg-[#091733] p-3">
          <div className="text-xs leading-tight text-[#6B7B89]">Muted</div>
          <div className="text-lg font-semibold leading-tight text-[#DDEBFF]">{stats.muted}</div>
        </div>
      </div>
      
      {/* Filter Row */}
      <div className="mb-3 flex justify-center gap-2">
        <input
          type="text"
          placeholder="Search: address / tx / label"
          className="flex-1 rounded-xl border border-[#162032] bg-[#0F1724] px-3 py-2 text-sm text-[#E6F0FF] placeholder:text-[#E6F0FF] focus:outline-none focus:ring-1 focus:ring-[#00E6A8]"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
        />
        <Select
          value={typeFilter}
          onValueChange={(value) => {
            setTypeFilter(value)
            setCurrentPage(1)
          }}
        >
          <SelectTrigger className="w-[140px] rounded-xl border-[#162032] bg-[#0F1724] text-[#E6F0FF] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#0F1724] border-[#162032]">
            <SelectItem value="all" className="text-[#E6F0FF] focus:bg-[#162032] focus:text-[#E6F0FF]">
              Type: All
            </SelectItem>
            <SelectItem value="transfer" className="text-[#E6F0FF] focus:bg-[#162032] focus:text-[#E6F0FF]">
              Type: Transfer
            </SelectItem>
            <SelectItem value="swap" className="text-[#E6F0FF] focus:bg-[#162032] focus:text-[#E6F0FF]">
              Type: Swap
            </SelectItem>
            <SelectItem value="stake" className="text-[#E6F0FF] focus:bg-[#162032] focus:text-[#E6F0FF]">
              Type: Stake
            </SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={sortBy}
          onValueChange={setSortBy}
        >
          <SelectTrigger className="w-[130px] rounded-xl border-[#162032] bg-[#0F1724] text-[#E6F0FF] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#0F1724] border-[#162032]">
            <SelectItem value="latest" className="text-[#E6F0FF] focus:bg-[#162032] focus:text-[#E6F0FF]">
              Sort: Latest
            </SelectItem>
            <SelectItem value="oldest" className="text-[#E6F0FF] focus:bg-[#162032] focus:text-[#E6F0FF]">
              Sort: Oldest
            </SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <button 
            className="rounded-xl bg-[#091733] px-3 py-2 text-sm font-medium text-[#C9E9FF] transition-colors hover:bg-[#0A1A3A]"
            onClick={markAllAsRead}
            disabled={notifications.filter(n => !n.isRead).length === 0}
          >
            Mark all read
          </button>
          <button 
            className="rounded-xl bg-[#091733] px-3 py-2 text-sm font-medium text-[#C9E9FF] transition-colors hover:bg-[#0A1A3A]"
            onClick={handleClearAll}
            disabled={notifications.length === 0}
          >
            Clear all
          </button>
        </div>
      </div>
      
      {/* Notification List */}
      <div className="mb-4 space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[#6B7B89]" />
          </div>
        ) : paginatedNotifications.length === 0 ? (
          <div className="rounded-xl border border-[#162032] border-dashed p-4 text-center">
            <p className="text-sm text-[#6B7B89]">No notifications found</p>
          </div>
        ) : (
          paginatedNotifications.map(notification => (
            <NotificationItem 
              key={notification.id} 
              notification={notification}
              onDismiss={() => clearNotification(notification.id)}
            />
          ))
        )}
      </div>
      
      {/* Pagination */}
      {totalPages > 0 && (
        <div className="flex items-center justify-between pt-2">
          <div className="rounded-full bg-[#071322] px-3 py-1 text-xs leading-tight text-[#6B7B89]">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button 
              className="rounded-xl bg-[#091733] px-3 py-2 text-sm font-medium text-[#C9E9FF] transition-colors hover:bg-[#0A1A3A] disabled:opacity-50"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button 
              className="rounded-xl bg-[#00E6A8] px-3 py-2 text-sm font-medium text-[#001217] transition-colors hover:bg-[#00D29A] disabled:opacity-50"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

