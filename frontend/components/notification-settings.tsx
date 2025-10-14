"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Label } from "./ui/label"
import { Switch } from "./ui/switch"
import { useState, useEffect } from "react"
import { saveSettings, getSettings } from "@/lib/storage/settings"
import { toast } from "sonner"

export function NotificationSettings() {
  const [settings, setSettings] = useState({
    sound: true,
    desktop: true,
    telegram: false,
    discord: false,
  })

  useEffect(() => {
    try {
      const stored = getSettings()
      setSettings(stored.notifications)
    } catch (error) {
      console.error("[v0] Failed to load notification settings:", error)
    }
  }, [])

  const updateSetting = (key: keyof typeof settings, value: boolean) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)

    try {
      saveSettings({
        notifications: newSettings,
      })
      console.log(`[v0] Updated notification setting: ${key} = ${value}`)
    } catch (error) {
      console.error("[v0] Failed to save notification setting:", error)
      toast.error("Failed to save notification setting")
    }
  }

  return (
    <Card className="glass-card border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,255,0.1)] animate-fade-in">
      <CardHeader>
        <CardTitle className="text-gradient">Notification Settings</CardTitle>
        <CardDescription>Configure how you receive notifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-3 rounded-lg glass-card border border-cyan-500/10 hover:border-cyan-500/30 transition-all duration-200">
          <div className="space-y-0.5">
            <Label htmlFor="sound" className="text-cyan-400">
              Sound Notifications
            </Label>
            <p className="text-sm text-muted-foreground">Play a sound when new events are detected</p>
          </div>
          <Switch id="sound" checked={settings.sound} onCheckedChange={(checked) => updateSetting("sound", checked)} />
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg glass-card border border-cyan-500/10 hover:border-cyan-500/30 transition-all duration-200">
          <div className="space-y-0.5">
            <Label htmlFor="desktop" className="text-cyan-400">
              Desktop Notifications
            </Label>
            <p className="text-sm text-muted-foreground">Show browser notifications</p>
          </div>
          <Switch
            id="desktop"
            checked={settings.desktop}
            onCheckedChange={(checked) => updateSetting("desktop", checked)}
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg glass-card border border-purple-500/10 hover:border-purple-500/30 transition-all duration-200">
          <div className="space-y-0.5">
            <Label htmlFor="telegram" className="text-purple-400">
              Telegram Notifications
            </Label>
            <p className="text-sm text-muted-foreground">Receive notifications via Telegram bot</p>
          </div>
          <Switch
            id="telegram"
            checked={settings.telegram}
            onCheckedChange={(checked) => updateSetting("telegram", checked)}
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg glass-card border border-purple-500/10 hover:border-purple-500/30 transition-all duration-200">
          <div className="space-y-0.5">
            <Label htmlFor="discord" className="text-purple-400">
              Discord Notifications
            </Label>
            <p className="text-sm text-muted-foreground">Receive notifications via Discord webhook</p>
          </div>
          <Switch
            id="discord"
            checked={settings.discord}
            onCheckedChange={(checked) => updateSetting("discord", checked)}
          />
        </div>
      </CardContent>
    </Card>
  )
}
