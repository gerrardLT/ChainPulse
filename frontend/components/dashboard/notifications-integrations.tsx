'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Send, Save } from 'lucide-react'
import { useIntegrations } from '@/hooks/use-integrations'
import { useAuthContext } from '@/components/auth-provider'

export function NotificationsIntegrations() {
  const { isAuthenticated } = useAuthContext()
  const {
    telegram,
    discord,
    isLoading,
    isSaving,
    isTesting,
    saveTelegram,
    saveDiscord,
    sendTest,
    refresh,
  } = useIntegrations()

  const { toast } = useToast()
  const [telegramChatId, setTelegramChatId] = useState('')
  const [telegramUsername, setTelegramUsername] = useState('')
  const [discordWebhookUrl, setDiscordWebhookUrl] = useState('')
  const [emailForAlerts, setEmailForAlerts] = useState('')
  const [sendOnlyCritical, setSendOnlyCritical] = useState(false)
  const [dailyDigest, setDailyDigest] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      refresh()
    }
  }, [isAuthenticated, refresh])

  useEffect(() => {
    if (telegram) {
      setTelegramChatId(telegram.chatId || '')
      setTelegramUsername(telegram.username || '')
    }
    if (discord) {
      setDiscordWebhookUrl(discord.webhookUrl || '')
    }
  }, [telegram, discord])

  const handleSaveSettings = async () => {
    if (!isAuthenticated) {
      toast({ 
        title: 'Not authenticated', 
        description: 'Please connect your wallet first', 
        variant: 'destructive' 
      })
      return
    }

    let success = true
    let saved = false
    
    // Save Telegram if there's data
    if (telegramChatId.trim()) {
      const result = await saveTelegram(telegramChatId.trim(), telegramUsername.trim() || undefined)
      if (result) {
        saved = true
      } else {
        success = false
      }
    }
    
    // Save Discord if there's data
    if (discordWebhookUrl.trim()) {
      const result = await saveDiscord(discordWebhookUrl.trim())
      if (result) {
        saved = true
      } else {
        success = false
      }
    }
    
    if (!saved) {
      toast({ 
        title: 'No changes', 
        description: 'Please fill in at least one integration field', 
        variant: 'destructive' 
      })
      return
    }
    
    if (success) {
      toast({ 
        title: 'Settings saved', 
        description: 'Your integration settings have been updated.' 
      })
    }
  }

  const handleSendTest = async () => {
    // Test Telegram if configured
    if (telegram?.isActive) {
      await sendTest('telegram')
    }
    // Otherwise test Discord if configured
    else if (discord?.isActive) {
      await sendTest('discord')
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-[#162032] bg-[#071427] p-4">
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
          <p className="mt-4 text-[#6B7B89]">Loading integrations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-[#162032] bg-[#071427] p-4">
      <div className="mb-3">
        <h3 className="text-base font-semibold text-[#DDEBFF]">Notifications & Integrations</h3>
        <p className="text-xs text-[#6B7B89]">Configure external alerts and channels</p>
      </div>
      <div className="space-y-3">
        {/* 第一行输入框 */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label htmlFor="telegram-username" className="text-xs text-[#6B7B89]">
              Telegram Username (Optional)
            </Label>
            <Input
              id="telegram-username"
              placeholder="@your_username"
              value={telegramUsername}
              onChange={(e) => setTelegramUsername(e.target.value)}
              className="h-9 rounded-xl border border-[#162032] bg-[#0F1724] text-[#E6F0FF] placeholder:text-[#6B7B89]"
              disabled={isSaving || !isAuthenticated}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="telegram-chat-id" className="text-xs text-[#6B7B89]">
              Telegram Chat ID
            </Label>
            <Input
              id="telegram-chat-id"
              placeholder="@your_channel or chat_id"
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value)}
              className="h-9 rounded-xl border border-[#162032] bg-[#0F1724] text-[#E6F0FF] placeholder:text-[#6B7B89]"
              disabled={isSaving || !isAuthenticated}
            />
          </div>
        </div>

        {/* 第二行输入框 */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label htmlFor="discord-webhook-url" className="text-xs text-[#6B7B89]">
              Discord Webhook URL
            </Label>
            <Input
              id="discord-webhook-url"
              placeholder="https://discord.com/api/webhooks/..."
              value={discordWebhookUrl}
              onChange={(e) => setDiscordWebhookUrl(e.target.value)}
              className="h-9 rounded-xl border border-[#162032] bg-[#0F1724] text-[#E6F0FF] placeholder:text-[#6B7B89]"
              disabled={isSaving || !isAuthenticated}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email-alerts" className="text-xs text-[#6B7B89]">
              Email for Alerts
            </Label>
            <Input
              id="email-alerts"
              placeholder="you@domain.com"
              value={emailForAlerts}
              onChange={(e) => setEmailForAlerts(e.target.value)}
              className="h-9 rounded-xl border border-[#162032] bg-[#0F1724] text-[#E6F0FF] placeholder:text-[#6B7B89]"
              disabled={isSaving || !isAuthenticated}
            />
          </div>
        </div>

        {/* 复选框 */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="send-critical"
              checked={sendOnlyCritical}
              onChange={(e) => setSendOnlyCritical(e.target.checked)}
              className="h-3.5 w-3.5 rounded border border-[#162032] bg-[#091733] text-[#00E6A8] focus:ring-0 focus:ring-offset-0"
              disabled={isSaving || !isAuthenticated}
            />
            <Label htmlFor="send-critical" className="text-[13px] text-[#E6F0FF] cursor-pointer">
              Send only critical errors
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="daily-digest"
              checked={dailyDigest}
              onChange={(e) => setDailyDigest(e.target.checked)}
              className="h-3.5 w-3.5 rounded border border-[#162032] bg-[#091733] text-[#00E6A8] focus:ring-0 focus:ring-offset-0"
              disabled={isSaving || !isAuthenticated}
            />
            <Label htmlFor="daily-digest" className="text-[13px] text-[#E6F0FF] cursor-pointer">
              Daily digest summary
            </Label>
          </div>
        </div>

        {/* 按钮区域 */}
        <div className="flex justify-start gap-2 pt-1">
          <Button
            size="sm"
            onClick={handleSendTest}
            disabled={isTesting || isSaving || (!telegram?.isActive && !discord?.isActive) || !isAuthenticated}
            className="group glass-card rounded-xl bg-[#091733] px-3 py-2.5 text-sm font-medium text-[#C9E9FF] transition-all duration-200 hover:bg-[#0A1A3A] hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            {isTesting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
            )}
            Send Test
          </Button>
          <Button
            size="sm"
            onClick={handleSaveSettings}
            disabled={isSaving || !isAuthenticated}
            className="group glass-card rounded-xl bg-[#00E6A8] px-3 py-2.5 text-sm font-medium text-[#001217] transition-all duration-200 hover:bg-[#00D29A] hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:-rotate-6" />
            )}
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
