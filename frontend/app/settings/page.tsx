"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Bell, MessageSquare, Webhook, Wallet } from "lucide-react"
import { CreateSmartAccountDialog } from "@/components/dialogs/create-smart-account-dialog"
import { useSmartAccount } from "@/hooks/use-smart-account"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export default function SettingsPage() {
  const { accounts, isLoading: accountsLoading, deleteAccount } = useSmartAccount()
  const [telegramChatId, setTelegramChatId] = useState("")
  const [discordWebhook, setDiscordWebhook] = useState("")
  const [browserNotifications, setBrowserNotifications] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)

  // 链ID映射
  const CHAIN_NAMES: Record<number, string> = {
    1: "Ethereum",
    137: "Polygon",
    42161: "Arbitrum",
    10: "Optimism",
    11155111: "Sepolia",
  }

  const handleSaveTelegram = () => {
    toast.success("Telegram settings saved successfully")
  }

  const handleSaveDiscord = () => {
    toast.success("Discord settings saved successfully")
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-balance bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-fade-in-scale">
            Settings
          </h1>
          <p className="text-muted-foreground mt-2 text-balance">Configure notifications and integrations</p>
        </div>

        <div className="grid gap-6">
          {/* Smart Accounts Section */}
          <Card className="glass-card hover:scale-[1.01] transition-all duration-200 hover:border-primary/50 animate-fade-in-scale">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  <CardTitle>Smart Accounts</CardTitle>
                </div>
                <CreateSmartAccountDialog />
              </div>
              <CardDescription>Manage your ERC-4337 smart accounts</CardDescription>
            </CardHeader>
            <CardContent>
              {accountsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="glass-card p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                        <Skeleton className="h-9 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : accounts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Wallet className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No smart accounts yet</p>
                  <p className="text-xs mt-1">Create your first smart account to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {accounts.map((account) => (
                    <div
                      key={account.id}
                      className="glass-card p-4 rounded-lg hover:border-cyan-500/50 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <code className="text-sm text-cyan-400 break-all">
                              {account.accountAddress}
                            </code>
                            <Badge
                              variant={account.isDeployed ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {account.isDeployed ? "Deployed" : "Not Deployed"}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {CHAIN_NAMES[account.chainId] || `Chain ${account.chainId}`}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Owner: {account.ownerAddress.slice(0, 6)}...{account.ownerAddress.slice(-4)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteAccount(account.id)}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card hover:scale-[1.01] transition-all duration-200 hover:border-primary/50 animate-fade-in-scale">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle>Notification Preferences</CardTitle>
              </div>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Browser Notifications</Label>
                  <p className="text-sm text-muted-foreground">Show desktop notifications for new events</p>
                </div>
                <Switch checked={browserNotifications} onCheckedChange={setBrowserNotifications} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sound Alerts</Label>
                  <p className="text-sm text-muted-foreground">Play sound when new events arrive</p>
                </div>
                <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
              </div>
            </CardContent>
          </Card>

          <Card
            className="glass-card hover:scale-[1.01] transition-all duration-200 hover:border-primary/50 animate-fade-in-scale"
            style={{ animationDelay: "100ms" }}
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <CardTitle>Telegram Integration</CardTitle>
              </div>
              <CardDescription>Receive notifications via Telegram bot</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="telegram">Telegram Chat ID</Label>
                <Input
                  id="telegram"
                  placeholder="Enter your Telegram chat ID"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  className="glass-card"
                />
                <p className="text-xs text-muted-foreground">Get your chat ID by messaging @userinfobot on Telegram</p>
              </div>
              <Button
                onClick={handleSaveTelegram}
                className="transition-all duration-200 hover:neon-glow hover:scale-105"
              >
                Save Telegram Settings
              </Button>
            </CardContent>
          </Card>

          <Card
            className="glass-card hover:scale-[1.01] transition-all duration-200 hover:border-secondary/50 animate-fade-in-scale"
            style={{ animationDelay: "200ms" }}
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <Webhook className="h-5 w-5 text-secondary" />
                <CardTitle>Discord Integration</CardTitle>
              </div>
              <CardDescription>Send notifications to Discord channel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="discord">Discord Webhook URL</Label>
                <Input
                  id="discord"
                  placeholder="https://discord.com/api/webhooks/..."
                  value={discordWebhook}
                  onChange={(e) => setDiscordWebhook(e.target.value)}
                  className="glass-card"
                />
                <p className="text-xs text-muted-foreground">Create a webhook in your Discord server settings</p>
              </div>
              <Button
                onClick={handleSaveDiscord}
                className="transition-all duration-200 hover:neon-glow-purple hover:scale-105"
              >
                Save Discord Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
