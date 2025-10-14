'use client'

import { Bell, Filter } from 'lucide-react'

interface MutedRuleItemProps {
  rule: {
    id: string
    title: string
    description: string
    isActive: boolean
    type: 'mute' | 'filter'
  }
  onEdit: () => void
  onToggle: () => void
  onDelete: () => void
}

export function MutedRuleItem({ rule, onEdit, onToggle, onDelete }: MutedRuleItemProps) {
  const getIcon = () => {
    switch (rule.type) {
      case 'mute':
        return <Bell className="h-[18px] w-[18px] text-[#DDEBFF]" />
      case 'filter':
        return <Filter className="h-[18px] w-[18px] text-[#DDEBFF]" />
      default:
        return <Bell className="h-[18px] w-[18px] text-[#DDEBFF]" />
    }
  }
  
  return (
    <div className="flex items-center justify-center gap-2.5 rounded-xl border border-[#162032] p-3">
      {/* Icon */}
      <div className="flex items-center justify-center">
        {getIcon()}
      </div>
      
      {/* Content */}
      <div className="flex-1">
        <div className="mb-0.5">
          <h3 className="text-sm font-semibold leading-tight text-[#DDEBFF]">
            {rule.title}
          </h3>
        </div>
        <div>
          <p className="text-xs leading-tight text-[#6B7B89]">
            {rule.description}
          </p>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-2">
        <div className={`rounded-full px-2 py-1 text-xs leading-tight ${
          rule.isActive 
            ? 'bg-[#071322] text-[#6B7B89]' 
            : 'bg-[#071322] text-[#6B7B89]'
        }`}>
          {rule.isActive ? 'Active' : 'Paused'}
        </div>
        <button 
          className="rounded-xl bg-[#091733] px-3 py-2 text-sm font-medium leading-tight text-[#C9E9FF] transition-colors hover:bg-[#0A1A3A]"
          onClick={onEdit}
        >
          Edit
        </button>
        <button 
          className="rounded-xl bg-[#091733] px-3 py-2 text-sm font-medium leading-tight text-[#C9E9FF] transition-colors hover:bg-[#0A1A3A]"
          onClick={onToggle}
        >
          {rule.isActive ? 'Pause' : 'Enable'}
        </button>
        <button 
          className="rounded-xl bg-[#091733] px-3 py-2 text-sm font-medium leading-tight text-[#C9E9FF] transition-colors hover:bg-[#0A1A3A]"
          onClick={onDelete}
        >
          {rule.isActive ? 'Remove' : 'Delete'}
        </button>
      </div>
    </div>
  )
}

