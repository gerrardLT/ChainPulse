'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { automationRuleApi, AutomationRule } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { useAuthContext } from '@/components/auth-provider'

interface AutomationRuleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  editRule?: AutomationRule | null
}

export function AutomationRuleDialog({
  open,
  onOpenChange,
  onSuccess,
  editRule,
}: AutomationRuleDialogProps) {
  const { isAuthenticated } = useAuthContext()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // Form state
  const [ruleName, setRuleName] = useState('')
  const [description, setDescription] = useState('')
  const [triggerEventType, setTriggerEventType] = useState<string>('')
  const [actionType, setActionType] = useState<'telegram' | 'discord' | 'custom'>('telegram')
  const [actionPayload, setActionPayload] = useState('')
  const [priority, setPriority] = useState<number>(1)

  // Initialize form with edit data
  useEffect(() => {
    if (editRule) {
      setRuleName(editRule.ruleName)
      setDescription(editRule.description || '')
      setTriggerEventType(editRule.triggerEventType)
      setActionType(editRule.actionType)
      setActionPayload(
        typeof editRule.actionPayload === 'string'
          ? editRule.actionPayload
          : JSON.stringify(editRule.actionPayload, null, 2)
      )
      setPriority(editRule.priority)
    } else {
      // Reset for new rule
      setRuleName('')
      setDescription('')
      setTriggerEventType('')
      setActionType('telegram')
      setActionPayload('')
      setPriority(1)
    }
  }, [editRule, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated) {
      toast({
        title: 'Not authenticated',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      })
      return
    }

    if (!ruleName.trim() || !triggerEventType) {
      toast({
        title: 'Validation error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      let parsedPayload: any = {}
      try {
        parsedPayload = actionPayload.trim() ? JSON.parse(actionPayload) : {}
      } catch {
        parsedPayload = { message: actionPayload }
      }

      if (editRule) {
        // Update existing rule
        const response = await automationRuleApi.update(editRule.id, {
          ruleName: ruleName.trim(),
          description: description.trim() || undefined,
          triggerEventType,
          actionType,
          actionPayload: parsedPayload,
          priority,
        })

        if (response.success) {
          toast({
            title: 'Rule updated',
            description: 'Automation rule has been updated successfully',
          })
          onSuccess?.()
          onOpenChange(false)
        } else {
          throw new Error(response.error?.message || 'Failed to update rule')
        }
      } else {
        // Create new rule
        const response = await automationRuleApi.create({
          ruleName: ruleName.trim(),
          description: description.trim() || undefined,
          triggerEventType,
          actionType,
          actionPayload: parsedPayload,
          priority,
        })

        if (response.success) {
          toast({
            title: 'Rule created',
            description: 'New automation rule has been created successfully',
          })
          onSuccess?.()
          onOpenChange(false)
        } else {
          throw new Error(response.error?.message || 'Failed to create rule')
        }
      }
    } catch (error: any) {
      console.error('[AutomationRuleDialog] Error:', error)
      toast({
        title: 'Error',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-[#162032] bg-[#071427]">
        <DialogHeader>
          <DialogTitle className="text-[#DDEBFF]">
            {editRule ? 'Edit Automation Rule' : 'Create New Automation Rule'}
          </DialogTitle>
          <DialogDescription className="text-[#6B7B89]">
            {editRule
              ? 'Update the automation rule settings'
              : 'Set up a new automation rule for event-driven actions'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rule Name */}
          <div className="space-y-2">
            <Label htmlFor="ruleName" className="text-[#C9E9FF]">
              Rule Name <span className="text-red-400">*</span>
            </Label>
            <Input
              id="ruleName"
              placeholder="e.g., Notify on Large Transfer"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              className="border-[#162032] bg-[#0F1724] text-[#E6F0FF]"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-[#C9E9FF]">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Describe what this rule does..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-[#162032] bg-[#0F1724] text-[#E6F0FF] resize-none"
              rows={2}
            />
          </div>

          {/* Trigger Event Type */}
          <div className="space-y-2">
            <Label htmlFor="triggerEventType" className="text-[#C9E9FF]">
              Trigger Event Type <span className="text-red-400">*</span>
            </Label>
            <Select value={triggerEventType} onValueChange={setTriggerEventType}>
              <SelectTrigger className="border-[#162032] bg-[#0F1724] text-[#E6F0FF]">
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent className="border-[#162032] bg-[#0F1724]">
                <SelectItem value="Transfer">Transfer</SelectItem>
                <SelectItem value="Swap">Swap</SelectItem>
                <SelectItem value="Deposit">Deposit</SelectItem>
                <SelectItem value="Withdrawal">Withdrawal</SelectItem>
                <SelectItem value="Error">Error</SelectItem>
                <SelectItem value="FailedCall">Failed Call</SelectItem>
                <SelectItem value="*">All Events</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Type & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="actionType" className="text-[#C9E9FF]">
                Action Type
              </Label>
              <Select
                value={actionType}
                onValueChange={(value: any) => setActionType(value)}
              >
                <SelectTrigger className="border-[#162032] bg-[#0F1724] text-[#E6F0FF]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-[#162032] bg-[#0F1724]">
                  <SelectItem value="telegram">Telegram</SelectItem>
                  <SelectItem value="discord">Discord</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="text-[#C9E9FF]">
                Priority
              </Label>
              <Select
                value={priority.toString()}
                onValueChange={(value) => setPriority(parseInt(value))}
              >
                <SelectTrigger className="border-[#162032] bg-[#0F1724] text-[#E6F0FF]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-[#162032] bg-[#0F1724]">
                  <SelectItem value="1">Low</SelectItem>
                  <SelectItem value="2">Medium</SelectItem>
                  <SelectItem value="3">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Payload */}
          <div className="space-y-2">
            <Label htmlFor="actionPayload" className="text-[#C9E9FF]">
              Action Payload (JSON or Text)
            </Label>
            <Textarea
              id="actionPayload"
              placeholder='{"message": "Alert message"} or plain text'
              value={actionPayload}
              onChange={(e) => setActionPayload(e.target.value)}
              className="border-[#162032] bg-[#0F1724] text-[#E6F0FF] font-mono text-xs resize-none"
              rows={4}
            />
            <p className="text-xs text-[#6B7B89]">
              Enter JSON object or plain text for the action message
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-[#C9E9FF] hover:bg-[#0A1A3A]"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#00E6A8] text-[#001217] hover:bg-[#00D29A]"
              disabled={isLoading || !isAuthenticated}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editRule ? 'Update Rule' : 'Create Rule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

