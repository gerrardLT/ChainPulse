"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Activity, ArrowUpRight, Clock, Bell, BellOff, Trash2 } from "lucide-react"
import { useSubscriptions } from "@/hooks/use-subscriptions"
import { CreateSubscriptionDialog } from "@/components/dialogs/create-subscription-dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"

// 链ID映射
const CHAIN_NAMES: Record<number, string> = {
  1: "Ethereum",
  137: "Polygon",
  42161: "Arbitrum",
  10: "Optimism",
  11155111: "Sepolia",
}

export default function EventsPage() {
  const { subscriptions, isLoading, error, toggleSubscription, deleteSubscription } = useSubscriptions()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    await deleteSubscription(id)
    setDeletingId(null)
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-balance bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-fade-in-scale">
              Event Subscriptions
            </h1>
            <p className="text-muted-foreground mt-2 text-balance">
              Manage your blockchain event subscriptions and monitoring rules
            </p>
          </div>
          <CreateSubscriptionDialog />
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-primary">Active Subscriptions</CardTitle>
            <CardDescription>
              {subscriptions.length} subscription{subscriptions.length !== 1 ? 's' : ''} configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              // 加载骨架屏
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index} className="glass-card">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <Skeleton className="h-10 w-10 rounded-lg" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-4 w-64" />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Skeleton className="h-9 w-9" />
                          <Skeleton className="h-9 w-9" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              // 错误状态
              <div className="text-center py-8">
                <p className="text-destructive">Failed to load subscriptions. Please try again.</p>
              </div>
            ) : subscriptions.length === 0 ? (
              // 空状态
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No event subscriptions yet.</p>
                <p className="text-sm text-muted-foreground mt-1">Create your first subscription to start monitoring events.</p>
              </div>
            ) : (
              // 订阅列表
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                  {subscriptions.map((subscription, index) => (
                    <Card
                      key={subscription.id}
                      className="glass-card group hover:scale-[1.02] transition-all duration-200 hover:border-primary/50 animate-fade-in-scale"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${subscription.isActive ? 'bg-primary/10' : 'bg-muted'} group-hover:neon-glow transition-all duration-200`}>
                              <Activity className={`h-5 w-5 ${subscription.isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                            </div>
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">{subscription.eventType}</p>
                                <Badge variant={subscription.isActive ? "default" : "secondary"}>
                                  {subscription.isActive ? "Active" : "Inactive"}
                                </Badge>
                                <Badge variant="outline">
                                  {CHAIN_NAMES[subscription.chainId] || `Chain ${subscription.chainId}`}
                                </Badge>
                              </div>
                              {subscription.contractAddress && (
                                <p className="text-sm text-muted-foreground">
                                  Contract: <code className="text-xs bg-muted/50 px-1 py-0.5 rounded">{subscription.contractAddress}</code>
                                </p>
                              )}
                              {subscription.smartAccountId && (
                                <p className="text-sm text-muted-foreground">
                                  Smart Account: <code className="text-xs bg-muted/50 px-1 py-0.5 rounded">{subscription.smartAccountId.slice(0, 8)}...</code>
                                </p>
                              )}
                              {subscription.notificationChannels && subscription.notificationChannels.length > 0 && (
                                <p className="text-sm text-muted-foreground">
                                  Channels: {subscription.notificationChannels.join(', ')}
                                </p>
                              )}
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                Created {new Date(subscription.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleSubscription(subscription.id, !subscription.isActive)}
                              className="hover:bg-primary/10"
                            >
                              {subscription.isActive ? (
                                <Bell className="h-4 w-4 text-primary" />
                              ) : (
                                <BellOff className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(subscription.id)}
                              disabled={deletingId === subscription.id}
                              className="hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
