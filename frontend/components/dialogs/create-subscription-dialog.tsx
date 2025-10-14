'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSubscriptions } from '@/hooks/use-subscriptions'
import { useToast } from '@/hooks/use-toast'

// 支持的事件类型
const EVENT_TYPES = [
  { value: 'Transfer', label: 'Transfer' },
  { value: 'Approval', label: 'Approval' },
  { value: 'Swap', label: 'Swap' },
  { value: 'Deposit', label: 'Deposit' },
  { value: 'Withdrawal', label: 'Withdrawal' },
  { value: 'AccountCreated', label: 'Account Created' },
  { value: 'AccountExecuted', label: 'Account Executed' },
]

// 支持的链
const CHAINS = [
  { value: 1, label: 'Ethereum Mainnet' },
  { value: 11155111, label: 'Sepolia Testnet' },
  { value: 137, label: 'Polygon' },
  { value: 42161, label: 'Arbitrum' },
  { value: 10, label: 'Optimism' },
]

// 通知渠道
const NOTIFICATION_CHANNELS = [
  { value: 'websocket', label: 'WebSocket (Real-time)' },
  { value: 'email', label: 'Email' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'discord', label: 'Discord' },
]

interface CreateSubscriptionDialogProps {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CreateSubscriptionDialog({ trigger, open: externalOpen, onOpenChange }: CreateSubscriptionDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = externalOpen !== undefined ? externalOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen
  const [isLoading, setIsLoading] = useState(false)
  const { createSubscription } = useSubscriptions()
  const { toast } = useToast()

  // 表单状态
  const [eventType, setEventType] = useState<string>('')
  const [chainId, setChainId] = useState<number>(1)
  const [contractAddress, setContractAddress] = useState<string>('')
  const [channels, setChannels] = useState<string[]>(['websocket'])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!eventType) {
      toast({
        title: 'Error',
        description: 'Please select an event type',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await createSubscription({
        eventType,
        chainId,
        contractAddress: contractAddress || undefined,
        // Note: Notification channels are configured separately in settings
      })

      if (result) {
        toast({
          title: 'Success',
          description: 'Event subscription created successfully',
        })
        setOpen(false)
        // 重置表单
        setEventType('')
        setChainId(1)
        setContractAddress('')
        setChannels(['websocket'])
      }
    } catch (error) {
      console.error('Failed to create subscription:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleChannel = (channel: string) => {
    setChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* 只在非受控模式（没有传入 open prop）时渲染 Trigger */}
      {externalOpen === undefined && (
        <DialogTrigger asChild>
          {trigger || (
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Subscription
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px] glass-card border-cyan-500/20">
        <DialogHeader>
          <DialogTitle className="text-cyan-400">Create Event Subscription</DialogTitle>
          <DialogDescription>
            Subscribe to blockchain events and receive real-time notifications
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Event Type */}
            <div className="grid gap-2">
              <Label htmlFor="eventType">Event Type *</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger id="eventType" className="glass-card border-cyan-500/20">
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent className="glass-card border-cyan-500/20">
                  {EVENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Chain */}
            <div className="grid gap-2">
              <Label htmlFor="chain">Blockchain *</Label>
              <Select value={chainId.toString()} onValueChange={(val) => setChainId(parseInt(val))}>
                <SelectTrigger id="chain" className="glass-card border-cyan-500/20">
                  <SelectValue placeholder="Select blockchain" />
                </SelectTrigger>
                <SelectContent className="glass-card border-cyan-500/20">
                  {CHAINS.map((chain) => (
                    <SelectItem key={chain.value} value={chain.value.toString()}>
                      {chain.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Contract Address (Optional) */}
            <div className="grid gap-2">
              <Label htmlFor="contractAddress">
                Contract Address <span className="text-muted-foreground">(Optional)</span>
              </Label>
              <Input
                id="contractAddress"
                placeholder="0x..."
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                className="glass-card border-cyan-500/20"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to monitor all contracts
              </p>
            </div>

            {/* Notification Channels */}
            <div className="grid gap-2">
              <Label>Notification Channels *</Label>
              <div className="grid grid-cols-2 gap-2">
                {NOTIFICATION_CHANNELS.map((channel) => (
                  <Button
                    key={channel.value}
                    type="button"
                    variant={channels.includes(channel.value) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleChannel(channel.value)}
                    className={
                      channels.includes(channel.value)
                        ? 'bg-cyan-500/20 border-cyan-500/50 hover:bg-cyan-500/30'
                        : 'glass-card border-cyan-500/20'
                    }
                  >
                    {channel.label}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Select at least one notification channel
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
              className="glass-card border-cyan-500/20"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !eventType || channels.length === 0}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400"
            >
              {isLoading ? 'Creating...' : 'Create Subscription'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

