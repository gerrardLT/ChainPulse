'use client'

import { useState } from 'react'
import { useSmartAccount } from '@/hooks/use-smart-account'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Rocket, 
  Trash2,
  Loader2,
  Wallet,
  ExternalLink,
  Copy,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CreateSmartAccountDialog } from '@/components/dialogs/create-smart-account-dialog'
import { useToast } from '@/hooks/use-toast'

export default function SmartAccountsPage() {
  const { accounts, isLoading, deployAccount, deleteAccount } = useSmartAccount()
  const { toast } = useToast()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'deployed' | 'undeployed'>('all')
  const [filterChain, setFilterChain] = useState<number | 'all'>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [deployingId, setDeployingId] = useState<string | null>(null)

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = 
      account.accountAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.ownerAddress.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'deployed' && account.isDeployed) ||
      (filterStatus === 'undeployed' && !account.isDeployed)
    
    const matchesChain = 
      filterChain === 'all' || 
      account.chainId === filterChain
    
    return matchesSearch && matchesStatus && matchesChain
  })

  const getChainName = (chainId: number) => {
    switch (chainId) {
      case 1: return 'Ethereum'
      case 10143: return 'Monad Testnet'
      case 11155111: return 'Sepolia'
      case 97: return 'BSC Testnet'
      default: return `Chain ${chainId}`
    }
  }

  const getChainIcon = (chainId: number) => {
    switch (chainId) {
      case 1: return '⚪'
      case 10143: return '🟣'
      case 11155111: return '🔵'
      case 97: return '🟡'
      default: return '⚫'
    }
  }

  const handleDeploy = async (accountId: string) => {
    setDeployingId(accountId)
    try {
      await deployAccount(accountId)
    } finally {
      setDeployingId(null)
    }
  }

  const handleDelete = async (accountId: string) => {
    if (window.confirm('Are you sure you want to delete this smart account?')) {
      await deleteAccount(accountId)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard`,
    })
  }

  const uniqueChains = Array.from(new Set(accounts.map(acc => acc.chainId)))

  return (
    <div className="min-h-screen bg-[#0A0F1C] p-5">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#DDEBFF]">Smart Accounts</h1>
            <p className="text-[#6B7B89] mt-1">
              Manage your ERC-4337 smart contract accounts
            </p>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2 rounded-xl bg-[#00E6A8] px-4 py-2.5 text-sm font-medium text-[#001217] transition-all duration-200 hover:bg-[#00D29A] hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-105 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Create Account
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7B89]" />
          <Input
            placeholder="Search by account or owner address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl border-[#162032] bg-[#0F1724] text-[#E6F0FF] placeholder:text-[#6B7B89]"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#6B7B89]" />
          <div className="flex rounded-xl border border-[#162032] bg-[#0F1724] p-1">
            {(['all', 'deployed', 'undeployed'] as const).map((status) => (
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

        {/* Chain Filter */}
        {uniqueChains.length > 1 && (
          <div className="flex rounded-xl border border-[#162032] bg-[#0F1724] p-1">
            <button
              onClick={() => setFilterChain('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                filterChain === 'all'
                  ? 'bg-[#00E6A8] text-[#001217]'
                  : 'text-[#C9E9FF] hover:bg-[#162032]'
              }`}
            >
              All Chains
            </button>
            {uniqueChains.map((chainId) => (
              <button
                key={chainId}
                onClick={() => setFilterChain(chainId)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  filterChain === chainId
                    ? 'bg-[#00E6A8] text-[#001217]'
                    : 'text-[#C9E9FF] hover:bg-[#162032]'
                }`}
              >
                {getChainIcon(chainId)} {getChainName(chainId)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#162032] bg-[#071427] p-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-[#00E6A8]" />
            <span className="text-sm font-medium text-[#C9E9FF]">Total Accounts</span>
          </div>
          <p className="text-2xl font-bold text-[#DDEBFF] mt-2">{accounts.length}</p>
        </div>
        
        <div className="rounded-xl border border-[#162032] bg-[#071427] p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[#00D27A]" />
            <span className="text-sm font-medium text-[#C9E9FF]">Deployed</span>
          </div>
          <p className="text-2xl font-bold text-[#DDEBFF] mt-2">
            {accounts.filter(a => a.isDeployed).length}
          </p>
        </div>
        
        <div className="rounded-xl border border-[#162032] bg-[#071427] p-4">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-[#FFB86B]" />
            <span className="text-sm font-medium text-[#C9E9FF]">Undeployed</span>
          </div>
          <p className="text-2xl font-bold text-[#DDEBFF] mt-2">
            {accounts.filter(a => !a.isDeployed).length}
          </p>
        </div>
        
        <div className="rounded-xl border border-[#162032] bg-[#071427] p-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌐</span>
            <span className="text-sm font-medium text-[#C9E9FF]">Networks</span>
          </div>
          <p className="text-2xl font-bold text-[#DDEBFF] mt-2">{uniqueChains.length}</p>
        </div>
      </div>

      {/* Accounts List */}
      <div className="rounded-xl border border-[#162032] bg-[#071427]">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#6B7B89]" />
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="text-center py-12">
            <Wallet className="h-12 w-12 text-[#6B7B89] mx-auto mb-4" />
            <p className="text-lg font-medium text-[#DDEBFF] mb-2">
              {searchQuery || filterStatus !== 'all' || filterChain !== 'all' 
                ? 'No accounts found' 
                : 'No smart accounts yet'}
            </p>
            <p className="text-[#6B7B89] mb-4">
              {searchQuery || filterStatus !== 'all' || filterChain !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first smart account to get started'
              }
            </p>
            {!searchQuery && filterStatus === 'all' && filterChain === 'all' && (
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="rounded-xl bg-[#00E6A8] text-[#001217] hover:bg-[#00D29A]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Account
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#162032]">
            {filteredAccounts.map((account) => (
              <div key={account.id} className="p-4 hover:bg-[#091733] transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Account Address */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#091733]">
                        <Wallet className="h-5 w-5 text-[#00E6A8]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-[#DDEBFF]">
                            {account.accountAddress.slice(0, 10)}...{account.accountAddress.slice(-8)}
                          </span>
                          <button
                            onClick={() => copyToClipboard(account.accountAddress, 'Account address')}
                            className="text-[#6B7B89] hover:text-[#C9E9FF] transition-colors"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                          <a
                            href={`https://etherscan.io/address/${account.accountAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#6B7B89] hover:text-[#C9E9FF] transition-colors"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant={account.isDeployed ? "default" : "secondary"}
                            className={`text-xs ${
                              account.isDeployed 
                                ? 'bg-[#00D27A] text-[#001217]' 
                                : 'bg-[#FFB86B] text-[#3A2100]'
                            }`}
                          >
                            {account.isDeployed ? 'Deployed' : 'Not Deployed'}
                          </Badge>
                          <span className="text-xs text-[#6B7B89]">
                            {getChainIcon(account.chainId)} {getChainName(account.chainId)}
                          </span>
                          <span className="text-xs text-[#6B7B89]">
                            {account.accountType.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Owner Address */}
                    <div className="ml-12 mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#6B7B89]">Owner:</span>
                        <span className="font-mono text-xs text-[#C9E9FF]">
                          {account.ownerAddress.slice(0, 10)}...{account.ownerAddress.slice(-8)}
                        </span>
                        <button
                          onClick={() => copyToClipboard(account.ownerAddress, 'Owner address')}
                          className="text-[#6B7B89] hover:text-[#C9E9FF] transition-colors"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {/* Deploy Button */}
                    {!account.isDeployed && (
                      <Button
                        size="sm"
                        onClick={() => handleDeploy(account.id)}
                        disabled={deployingId === account.id}
                        className="rounded-xl bg-[#00E6A8] text-[#001217] hover:bg-[#00D29A] transition-all duration-200 hover:scale-105 active:scale-95"
                      >
                        {deployingId === account.id ? (
                          <>
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            Deploying...
                          </>
                        ) : (
                          <>
                            <Rocket className="mr-1 h-3 w-3" />
                            Deploy
                          </>
                        )}
                      </Button>
                    )}

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
                          onClick={() => handleDelete(account.id)}
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

      {/* Create Account Dialog */}
      <CreateSmartAccountDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  )
}
