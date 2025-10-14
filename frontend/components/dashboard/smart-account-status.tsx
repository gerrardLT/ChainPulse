'use client'

import { useSmartAccount } from '@/hooks/use-smart-account'
import { Loader2, Plus, Rocket } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CreateSmartAccountDialog } from '@/components/dialogs/create-smart-account-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function SmartAccountStatus() {
  const { accounts, isLoading, deployAccount } = useSmartAccount()
  const [selectedAccountId, setSelectedAccountId] = useState<string>('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [isDeploying, setIsDeploying] = useState<string | null>(null)

  const selectedAccount = accounts.find(acc => acc.id === selectedAccountId) || accounts[0]

  const handleDeploy = async (accountId: string) => {
    setIsDeploying(accountId)
    try {
      await deployAccount(accountId)
    } finally {
      setIsDeploying(null)
    }
  }

  const getStatusItems = () => {
    if (!selectedAccount) return []
    
    return [
      {
        id: 1,
        color: selectedAccount.isDeployed ? '#00D27A' : '#FFB86B',
        title: selectedAccount.isDeployed ? 'Account Deployed' : 'Not Deployed',
        badge: selectedAccount.isDeployed ? 'Active' : 'Deploy required',
        badgeColor: selectedAccount.isDeployed ? undefined : '#FFB86B',
        badgeTextColor: selectedAccount.isDeployed ? undefined : '#3A2100',
      },
      {
        id: 2,
        color: '#7C5CFF',
        title: 'Chain',
        badge: `Chain ID: ${selectedAccount.chainId}`,
      },
      {
        id: 3,
        color: '#00D27A',
        title: 'Account Type',
        badge: selectedAccount.accountType || 'ERC-4337',
      },
    ]
  }
  return (
    <div className="rounded-3xl border border-[#162032] bg-[#071427] p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#DDEBFF]">
            Smart Account Status
          </h2>
          <p className="text-xs text-[#6B7B89]">Automation and execution health</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Create Account Button */}
          <Button
            size="sm"
            variant="ghost"
            className="group flex items-center gap-1.5 rounded-xl bg-[#091733] px-3 py-2 text-sm font-medium text-[#C9E9FF] transition-all duration-200 hover:bg-[#0A1A3A] hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-105 active:scale-95"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
            Create
          </Button>
          
          {/* Account Dropdown */}
          <Select
            value={selectedAccountId || (accounts.length > 0 ? accounts[0].id : '')}
            onValueChange={setSelectedAccountId}
            disabled={isLoading || accounts.length === 0}
          >
            <SelectTrigger className="w-[180px] rounded-xl border-[#162032] bg-[#0F1724] text-[#E6F0FF] text-sm">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent className="bg-[#0F1724] border-[#162032]">
              {accounts.length === 0 ? (
                <SelectItem value="no-accounts" disabled className="text-[#6B7B89]">
                  No smart accounts
                </SelectItem>
              ) : (
                accounts.map((account) => (
                  <SelectItem 
                    key={account.id} 
                    value={account.id}
                    className="text-[#E6F0FF] focus:bg-[#162032] focus:text-[#E6F0FF]"
                  >
                    <span className="font-mono">
                      {account.accountAddress.slice(0, 6)}...{account.accountAddress.slice(-4)}
                    </span>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Status List */}
      <div className="space-y-2.5">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[#6B7B89]" />
          </div>
        ) : !selectedAccount ? (
          <div className="text-center py-8">
            <p className="text-sm text-[#6B7B89]">No smart accounts found</p>
            <p className="mt-2 text-xs text-[#6B7B89]">
              Click "Create" to get started
            </p>
          </div>
        ) : (
          <>
            {getStatusItems().map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-[#162032] p-2.5"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-semibold text-[#DDEBFF]">
                    {item.title}
                  </span>
                </div>
                <div
                  className="rounded-full px-2 py-1"
                  style={{
                    backgroundColor: item.badgeColor || '#071322',
                  }}
                >
                  <span
                    className="text-xs"
                    style={{ color: item.badgeTextColor || '#6B7B89' }}
                  >
                    {item.badge}
                  </span>
                </div>
              </div>
            ))}
            
            {/* Deploy Button for undeployed accounts */}
            {selectedAccount && !selectedAccount.isDeployed && (
              <div className="mt-3 pt-3 border-t border-[#162032]">
                <Button
                  className="group w-full flex items-center justify-center gap-2 rounded-xl bg-[#00E6A8] px-4 py-2.5 text-sm font-medium text-[#001217] transition-all duration-200 hover:bg-[#00D29A] hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleDeploy(selectedAccount.id)}
                  disabled={isDeploying === selectedAccount.id}
                >
                  {isDeploying === selectedAccount.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    <>
                      <Rocket className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                      Deploy Account
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Smart Account Dialog */}
      <CreateSmartAccountDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  )
}

