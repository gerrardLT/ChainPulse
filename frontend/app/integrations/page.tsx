'use client'

import { useState } from 'react'
import { useIntegrations } from '@/hooks/use-integrations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Send, 
  Loader2,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Hash,
  Link as LinkIcon,
  Trash2,
  Save,
  AlertCircle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'

export default function IntegrationsPage() {
  const { telegram, discord, isLoading, isSaving, isTesting, saveTelegram, saveDiscord, sendTest } = useIntegrations()
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  
  // Telegram state
  const [telegramUsername, setTelegramUsername] = useState(telegram?.username || '')
  const [telegramChatId, setTelegramChatId] = useState(telegram?.chatId || '')
  
  // Discord state
  const [discordWebhook, setDiscordWebhook] = useState(discord?.webhookUrl || '')

  // Update local state when data loads
  useState(() => {
    if (telegram) {
      setTelegramUsername(telegram.username || '')
      setTelegramChatId(telegram.chatId || '')
    }
    if (discord) {
      setDiscordWebhook(discord.webhookUrl || '')
    }
  })

  const handleSaveTelegram = async () => {
    if (!telegramChatId) {
      toast({
        title: 'Validation Error',
        description: 'Telegram Chat ID is required',
        variant: 'destructive',
      })
      return
    }

    await saveTelegram(telegramChatId, telegramUsername)
  }

  const handleSaveDiscord = async () => {
    if (!discordWebhook) {
      toast({
        title: 'Validation Error',
        description: 'Discord Webhook URL is required',
        variant: 'destructive',
      })
      return
    }

    await saveDiscord(discordWebhook)
  }

  const handleTestTelegram = async () => {
    if (!telegram?.isActive) {
      toast({
        title: 'Configuration Required',
        description: 'Please save Telegram configuration first',
        variant: 'destructive',
      })
      return
    }
    await sendTest('telegram')
  }

  const handleTestDiscord = async () => {
    if (!discord?.isActive) {
      toast({
        title: 'Configuration Required',
        description: 'Please save Discord configuration first',
        variant: 'destructive',
      })
      return
    }
    await sendTest('discord')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] p-5 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-500 mx-auto mb-4" />
          <p className="text-[#6B7B89]">Loading integrations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0F1C] p-5">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#DDEBFF]">Integrations</h1>
        <p className="text-[#6B7B89] mt-1">
          Configure external notification channels and services
        </p>
      </div>

      {/* Statistics */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#162032] bg-[#071427] p-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[#00E6A8]" />
            <span className="text-sm font-medium text-[#C9E9FF]">Active Integrations</span>
          </div>
          <p className="text-2xl font-bold text-[#DDEBFF] mt-2">
            {[telegram?.isActive, discord?.isActive].filter(Boolean).length}
          </p>
        </div>
        
        <div className="rounded-xl border border-[#162032] bg-[#071427] p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[#00D27A]" />
            <span className="text-sm font-medium text-[#C9E9FF]">Telegram</span>
          </div>
          <Badge 
            className={`mt-2 ${
              telegram?.isActive 
                ? 'bg-[#00D27A] text-[#001217]' 
                : 'bg-[#6B7B89] text-[#DDEBFF]'
            }`}
          >
            {telegram?.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        
        <div className="rounded-xl border border-[#162032] bg-[#071427] p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[#7C5CFF]" />
            <span className="text-sm font-medium text-[#C9E9FF]">Discord</span>
          </div>
          <Badge 
            className={`mt-2 ${
              discord?.isActive 
                ? 'bg-[#7C5CFF] text-white' 
                : 'bg-[#6B7B89] text-[#DDEBFF]'
            }`}
          >
            {discord?.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>

      {/* Warning for unauthenticated users */}
      {!isAuthenticated && (
        <div className="mb-6 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-500 mb-1">Authentication Required</h3>
              <p className="text-sm text-yellow-500/80">
                Please connect your wallet to configure integrations
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Telegram Integration */}
        <div className="rounded-xl border border-[#162032] bg-[#071427] p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#091733]">
                <MessageSquare className="h-6 w-6 text-[#00E6A8]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#DDEBFF]">Telegram</h2>
                <p className="text-sm text-[#6B7B89]">
                  Receive notifications via Telegram bot
                </p>
              </div>
            </div>
            {telegram?.isActive && (
              <Badge className="bg-[#00D27A] text-[#001217]">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Active
              </Badge>
            )}
          </div>

          <div className="space-y-4">
            {/* Telegram Username */}
            <div className="space-y-2">
              <Label htmlFor="telegram-username" className="text-sm font-medium text-[#C9E9FF]">
                Telegram Username (Optional)
              </Label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7B89]" />
                <Input
                  id="telegram-username"
                  placeholder="@your_username"
                  value={telegramUsername}
                  onChange={(e) => setTelegramUsername(e.target.value)}
                  className="pl-10 rounded-xl border-[#162032] bg-[#0F1724] text-[#E6F0FF] placeholder:text-[#6B7B89]"
                  disabled={isSaving || !isAuthenticated}
                />
              </div>
              <p className="text-xs text-[#6B7B89]">
                Your Telegram username for identification
              </p>
            </div>

            {/* Telegram Chat ID */}
            <div className="space-y-2">
              <Label htmlFor="telegram-chat-id" className="text-sm font-medium text-[#C9E9FF]">
                Telegram Chat ID *
              </Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7B89]" />
                <Input
                  id="telegram-chat-id"
                  placeholder="123456789"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  className="pl-10 rounded-xl border-[#162032] bg-[#0F1724] text-[#E6F0FF] placeholder:text-[#6B7B89]"
                  disabled={isSaving || !isAuthenticated}
                />
              </div>
              <p className="text-xs text-[#6B7B89]">
                Get your Chat ID from @userinfobot on Telegram
              </p>
            </div>

            {/* Telegram Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={handleSaveTelegram}
                disabled={isSaving || !isAuthenticated || !telegramChatId}
                className="rounded-xl bg-[#00E6A8] text-[#001217] hover:bg-[#00D29A] transition-all duration-200 hover:scale-105 active:scale-95"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Configuration
                  </>
                )}
              </Button>

              <Button
                onClick={handleTestTelegram}
                disabled={isTesting || !telegram?.isActive || !isAuthenticated}
                variant="outline"
                className="rounded-xl border-[#162032] bg-[#0F1724] text-[#C9E9FF] hover:bg-[#162032] transition-all duration-200 hover:scale-105 active:scale-95"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Test
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Discord Integration */}
        <div className="rounded-xl border border-[#162032] bg-[#071427] p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#091733]">
                <MessageSquare className="h-6 w-6 text-[#7C5CFF]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#DDEBFF]">Discord</h2>
                <p className="text-sm text-[#6B7B89]">
                  Send notifications to Discord channel
                </p>
              </div>
            </div>
            {discord?.isActive && (
              <Badge className="bg-[#7C5CFF] text-white">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Active
              </Badge>
            )}
          </div>

          <div className="space-y-4">
            {/* Discord Webhook URL */}
            <div className="space-y-2">
              <Label htmlFor="discord-webhook" className="text-sm font-medium text-[#C9E9FF]">
                Webhook URL *
              </Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7B89]" />
                <Input
                  id="discord-webhook"
                  type="url"
                  placeholder="https://discord.com/api/webhooks/..."
                  value={discordWebhook}
                  onChange={(e) => setDiscordWebhook(e.target.value)}
                  className="pl-10 rounded-xl border-[#162032] bg-[#0F1724] text-[#E6F0FF] placeholder:text-[#6B7B89]"
                  disabled={isSaving || !isAuthenticated}
                />
              </div>
              <p className="text-xs text-[#6B7B89]">
                Create a webhook in your Discord channel settings
              </p>
            </div>

            {/* Discord Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={handleSaveDiscord}
                disabled={isSaving || !isAuthenticated || !discordWebhook}
                className="rounded-xl bg-[#7C5CFF] text-white hover:bg-[#6B4FE6] transition-all duration-200 hover:scale-105 active:scale-95"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Configuration
                  </>
                )}
              </Button>

              <Button
                onClick={handleTestDiscord}
                disabled={isTesting || !discord?.isActive || !isAuthenticated}
                variant="outline"
                className="rounded-xl border-[#162032] bg-[#0F1724] text-[#C9E9FF] hover:bg-[#162032] transition-all duration-200 hover:scale-105 active:scale-95"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Test
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Integration Guide */}
        <div className="rounded-xl border border-[#162032] bg-[#071427] p-6">
          <h3 className="text-lg font-semibold text-[#DDEBFF] mb-4">Integration Guide</h3>
          
          <div className="space-y-4">
            {/* Telegram Guide */}
            <div>
              <h4 className="font-medium text-[#C9E9FF] mb-2">Telegram Setup</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-[#6B7B89]">
                <li>Search for @userinfobot on Telegram</li>
                <li>Start a chat and get your Chat ID</li>
                <li>Enter your Chat ID in the field above</li>
                <li>Save configuration and send a test message</li>
              </ol>
            </div>

            {/* Discord Guide */}
            <div>
              <h4 className="font-medium text-[#C9E9FF] mb-2">Discord Setup</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-[#6B7B89]">
                <li>Open your Discord server settings</li>
                <li>Go to Integrations → Webhooks</li>
                <li>Create a new webhook for your channel</li>
                <li>Copy the webhook URL and paste it above</li>
                <li>Save configuration and send a test message</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
