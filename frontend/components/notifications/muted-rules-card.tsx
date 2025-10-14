'use client'

import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { MutedRuleItem } from './muted-rule-item'
import { useMutedRules } from '@/hooks/use-muted-rules'
import { AutomationRuleDialog } from '@/components/dialogs/automation-rule-dialog'
import { AutomationRule } from '@/lib/api'

export function MutedRulesCard() {
  const { rules, isLoading, toggleRule, deleteRule, refresh } = useMutedRules()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null)
  
  const handleNewRule = () => {
    setEditingRule(null)
    setDialogOpen(true)
  }
  
  const handleEditRule = (id: string) => {
    const rule = rules.find(r => r.id === id)
    if (rule) {
      setEditingRule(rule)
      setDialogOpen(true)
    }
  }
  
  const handleDialogSuccess = () => {
    refresh()
  }
  
  const handleToggleRule = async (id: string, currentStatus: boolean) => {
    await toggleRule(id, !currentStatus)
  }
  
  const handleDeleteRule = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this rule?')) {
      await deleteRule(id)
    }
  }
  
  return (
    <div className="rounded-3xl border border-[#162032] bg-[#071427] p-[17px]">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold leading-tight text-[#DDEBFF]">
            Muted & Rules
          </h2>
          <p className="text-xs leading-tight text-[#6B7B89]">
            Manage muted notifications and rules
          </p>
        </div>
        
        <button 
          className="group flex items-center gap-2 rounded-xl bg-[#091733] px-3 py-2 text-sm font-medium text-[#C9E9FF] transition-all duration-200 hover:bg-[#0A1A3A] hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-105 active:scale-95"
          onClick={handleNewRule}
        >
          <Plus className="h-[18px] w-[18px] transition-transform duration-200 group-hover:rotate-90" />
          New Rule
        </button>
      </div>
      
      {/* Rules List */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[#6B7B89]" />
          </div>
        ) : rules.length === 0 ? (
          <div className="rounded-xl border border-[#162032] border-dashed p-4 text-center">
            <p className="text-sm text-[#6B7B89]">No automation rules</p>
          </div>
        ) : (
          rules.map(rule => (
            <MutedRuleItem
              key={rule.id}
              rule={{
                id: rule.id,
                title: rule.ruleName,
                description: rule.description || `${rule.triggerEventType} → ${rule.actionType}`,
                isActive: rule.isActive,
                type: rule.actionType === 'custom' ? 'mute' : 'filter'
              }}
              onEdit={() => handleEditRule(rule.id)}
              onToggle={() => handleToggleRule(rule.id, rule.isActive)}
              onDelete={() => handleDeleteRule(rule.id)}
            />
          ))
        )}
      </div>
      
      {/* Automation Rule Dialog */}
      <AutomationRuleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleDialogSuccess}
        editRule={editingRule}
      />
    </div>
  )
}

