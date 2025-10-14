'use client'

import { useState } from 'react'
import { useSubscriptions } from '@/hooks/use-subscriptions'
import { useSmartAccount } from '@/hooks/use-smart-account'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Play, 
  Pause, 
  Trash2,
  Loader2,
  Bell,
  BellOff
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CreateSubscriptionDialog } from '@/components/dialogs/create-subscription-dialog'

export default function SubscriptionsPage() {
  const { subscriptions, isLoading, toggleSubscription, deleteSubscription } = useSubscriptions()
  const { accounts } = useSmartAccount()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = 
      sub.eventType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.contractAddress && sub.contractAddress.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesFilter = 
      filterStatus === 'all' || 
      (filterStatus === 'active' && sub.isActive) ||
      (filterStatus === 'inactive' && !sub.isActive)
    
    return matchesSearch && matchesFilter
  })

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'Transfer': return '💵'
      case 'Swap': return '🔄'
      case 'Stake': return '📊'
      case 'NFTReceived': return '🖼️'
      default: return '🔐'
    }
  }

  const getChainName = (chainId: number) => {
    switch (chainId) {
      case 1: return 'Ethereum'
      case 10143: return 'Monad Testnet'
      case 11155111: return 'Sepolia'
      case 97: return 'BSC Testnet'
      default: return `Chain ${chainId}`
    }
  }

  const getSmartAccountName = (smartAccountId?: string) => {
    if (!smartAccountId) return 'All Accounts'
    const account = accounts.find(acc => acc.id === smartAccountId)
    return account 
      ? `${account.accountAddress.slice(0, 6)}...${account.accountAddress.slice(-4)}`
      : 'Unknown Account'
  }

  const handleToggle = async (id: string, currentStatus: boolean) => {
    await toggleSubscription(id, !currentStatus)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      await deleteSubscription(id)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0F1C] p-5">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#DDEBFF]">Event Subscriptions</h1>
            <p className="text-[#6B7B89] mt-1">
              Manage your blockchain event monitoring and notifications
            </p>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2 rounded-xl bg-[#00E6A8] px-4 py-2.5 text-sm font-medium text-[#001217] transition-all duration-200 hover:bg-[#00D29A] hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-105 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            New Subscription
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 flex items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7B89]" />
          <Input
            placeholder="Search by event type or contract address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl border-[#162032] bg-[#0F1724] text-[#E6F0FF] placeholder:text-[#6B7B89]"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#6B7B89]" />
          <div className="flex rounded-xl border border-[#162032] bg-[#0F1724] p-1">
            {(['all', 'active', 'inactive'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  filterStatus === status
                    ? 'bg-[#00E6A8] text-[#001217]'
                    : 'text-[#C9E9FF] hover:bg-[#162032]'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#162032] bg-[#071427] p-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-[#00E6A8]" />
            <span className="text-sm font-medium text-[#C9E9FF]">Total Subscriptions</span>
          </div>
          <p className="text-2xl font-bold text-[#DDEBFF] mt-2">{subscriptions.length}</p>
        </div>
        
        <div className="rounded-xl border border-[#162032] bg-[#071427] p-4">
          <div className="flex items-center gap-2">
            <Play className="h-5 w-5 text-[#00D27A]" />
            <span className="text-sm font-medium text-[#C9E9FF]">Active</span>
          </div>
          <p className="text-2xl font-bold text-[#DDEBFF] mt-2">
            {subscriptions.filter(s => s.isActive).length}
          </p>
        </div>
        
        <div className="rounded-xl border border-[#162032] bg-[#071427] p-4">
          <div className="flex items-center gap-2">
            <BellOff className="h-5 w-5 text-[#6B7B89]" />
            <span className="text-sm font-medium text-[#C9E9FF]">Inactive</span>
          </div>
          <p className="text-2xl font-bold text-[#DDEBFF] mt-2">
            {subscriptions.filter(s => !s.isActive).length}
          </p>
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="rounded-xl border border-[#162032] bg-[#071427]">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#6B7B89]" />
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-[#6B7B89] mx-auto mb-4" />
            <p className="text-lg font-medium text-[#DDEBFF] mb-2">
              {searchQuery || filterStatus !== 'all' ? 'No subscriptions found' : 'No subscriptions yet'}
            </p>
            <p className="text-[#6B7B89] mb-4">
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first subscription to start monitoring blockchain events'
              }
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="rounded-xl bg-[#00E6A8] text-[#001217] hover:bg-[#00D29A]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Subscription
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#162032]">
            {filteredSubscriptions.map((subscription) => (
              <div key={subscription.id} className="p-4 hover:bg-[#091733] transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Event Icon */}
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#091733]">
                      <span className="text-lg">{getEventIcon(subscription.eventType)}</span>
                    </div>
                    
                    {/* Subscription Info */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-[#DDEBFF]">{subscription.eventType}</h3>
                        <Badge 
                          variant={subscription.isActive ? "default" : "secondary"}
                          className={`text-xs ${
                            subscription.isActive 
                              ? 'bg-[#00D27A] text-[#001217]' 
                              : 'bg-[#6B7B89] text-[#DDEBFF]'
                          }`}
                        >
                          {subscription.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-[#6B7B89]">
                        <span>Chain: {getChainName(subscription.chainId)}</span>
                        <span>Account: {getSmartAccountName(subscription.smartAccountId)}</span>
                        {subscription.contractAddress && (
                          <span>Contract: {subscription.contractAddress.slice(0, 6)}...{subscription.contractAddress.slice(-4)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {/* Toggle Button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggle(subscription.id, subscription.isActive)}
                      className={`rounded-xl px-3 py-2 text-sm transition-all duration-200 hover:scale-105 active:scale-95 ${
                        subscription.isActive
                          ? 'bg-[#00D27A] text-[#001217] hover:bg-[#00B86A]'
                          : 'bg-[#6B7B89] text-[#DDEBFF] hover:bg-[#7B8B99]'
                      }`}
                    >
                      {subscription.isActive ? (
                        <>
                          <Pause className="mr-1 h-3 w-3" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="mr-1 h-3 w-3" />
                          Resume
                        </>
                      )}
                    </Button>

                    {/* More Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-xl bg-[#091733] text-[#C9E9FF] hover:bg-[#0A1A3A] p-2"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-[#0F1724] border-[#162032]">
                        <DropdownMenuItem 
                          onClick={() => handleDelete(subscription.id)}
                          className="text-red-400 hover:bg-[#162032] hover:text-red-300"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Subscription Dialog */}
      <CreateSubscriptionDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  )
}
