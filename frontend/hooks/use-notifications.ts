"use client"

import { useState, useEffect, useCallback } from "react"

export interface Notification {
  id: string
  type: string
  title: string
  message: string
  timestamp: string
  isRead: boolean
  eventData?: any
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "TRANSACTION_EXECUTED",
    title: "Transaction Executed",
    message: "Your smart account executed a transaction",
    timestamp: new Date().toISOString(),
    isRead: false,
    eventData: {
      txHash: "0x1234567890abcdef",
      from: "0xabcd...ef01",
      to: "0x2345...6789",
    },
  },
  {
    id: "2",
    type: "DEPOSIT_RECEIVED",
    title: "Deposit Received",
    message: "100 ETH deposited to your smart account",
    timestamp: new Date(Date.now() - 300000).toISOString(),
    isRead: false,
    eventData: {
      txHash: "0xabcdef1234567890",
      amount: "100",
    },
  },
  {
    id: "3",
    type: "TRANSFER",
    title: "Token Transfer",
    message: "50 USDC transferred",
    timestamp: new Date(Date.now() - 600000).toISOString(),
    isRead: true,
    eventData: {
      txHash: "0x567890abcdef1234",
    },
  },
]

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [isConnected] = useState(true) // Always connected in demo mode

  // Simulate receiving new notifications periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: ["TRANSFER", "TRANSACTION_EXECUTED", "DEPOSIT_RECEIVED"][Math.floor(Math.random() * 3)],
        title: "New Event",
        message: "A new blockchain event was detected",
        timestamp: new Date().toISOString(),
        isRead: false,
        eventData: {
          txHash: `0x${Math.random().toString(16).slice(2, 18)}`,
        },
      }

      setNotifications((prev) => [newNotification, ...prev].slice(0, 10))
    }, 30000) // Add new notification every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }, [])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return {
    notifications,
    unreadCount,
    isConnected,
    isLoading: false,
    error: null,
    markAsRead,
    markAllAsRead,
  }
}
