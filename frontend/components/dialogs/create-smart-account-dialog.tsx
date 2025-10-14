'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useSmartAccount } from '@/hooks/use-smart-account'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Wallet, Shield } from 'lucide-react'

interface CreateSmartAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SUPPORTED_CHAINS = [
  { id: 10143, name: 'Monad Testnet', icon: '🟣' },
  { id: 11155111, name: 'Sepolia', icon: '🔵' },
  { id: 97, name: 'BSC Testnet', icon: '🟡' },
  { id: 1, name: 'Ethereum Mainnet', icon: '⚪' },
]

export function CreateSmartAccountDialog({ open, onOpenChange }: CreateSmartAccountDialogProps) {
  const { address } = useAccount()
  const { createAccount } = useSmartAccount()
  const { toast } = useToast()
  
  const [selectedChainId, setSelectedChainId] = useState<number>(10143) // Default to Monad Testnet
  const [isCreating, setIsCreating] = useState(false)

  // 确保 address 是字符串类型
  const walletAddress = address as string

  const handleCreate = async () => {
    if (!walletAddress) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      })
      return
    }

    setIsCreating(true)
    try {
      console.log('[CreateSmartAccount] Creating account with:', {
        ownerAddress: walletAddress,
        chainId: selectedChainId,
        accountType: 'erc4337',
      })

      await createAccount(walletAddress, selectedChainId)

      toast({
        title: 'Smart Account Created',
        description: 'Your smart account has been created successfully',
      })

      onOpenChange(false)
    } catch (error: any) {
      console.error('Failed to create smart account:', error)
      toast({
        title: 'Creation Failed',
        description: error.message || 'Failed to create smart account',
        variant: 'destructive',
      })
    } finally {
      setIsCreating(false)
    }
  }

  const selectedChain = SUPPORTED_CHAINS.find(chain => chain.id === selectedChainId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-[#071427] border-[#162032]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#DDEBFF]">
            <Shield className="h-5 w-5 text-[#00E6A8]" />
            Create Smart Account
          </DialogTitle>
          <DialogDescription className="text-[#6B7B89]">
            Create a new ERC-4337 smart account for advanced features like gas abstraction and batch transactions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Owner Address */}
          <div className="space-y-2">
            <Label htmlFor="owner-address" className="text-sm font-medium text-[#C9E9FF]">
              Owner Address
            </Label>
            <div className="flex items-center gap-2 rounded-xl border border-[#162032] bg-[#0F1724] px-3 py-2">
              <Wallet className="h-4 w-4 text-[#6B7B89]" />
              <span className="text-sm text-[#E6F0FF] font-mono">
                {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Not connected'}
              </span>
            </div>
            <p className="text-xs text-[#6B7B89]">
              This wallet will own and control the smart account
            </p>
          </div>

          {/* Chain Selection */}
          <div className="space-y-2">
            <Label htmlFor="chain" className="text-sm font-medium text-[#C9E9FF]">
              Blockchain Network
            </Label>
            <Select value={selectedChainId.toString()} onValueChange={(value) => setSelectedChainId(Number(value))}>
              <SelectTrigger className="rounded-xl border-[#162032] bg-[#0F1724] text-[#E6F0FF]">
                <SelectValue placeholder="Select a blockchain" />
              </SelectTrigger>
              <SelectContent className="bg-[#0F1724] border-[#162032]">
                {SUPPORTED_CHAINS.map((chain) => (
                  <SelectItem 
                    key={chain.id} 
                    value={chain.id.toString()}
                    className="text-[#E6F0FF] focus:bg-[#162032] focus:text-[#E6F0FF]"
                  >
                    <div className="flex items-center gap-2">
                      <span>{chain.icon}</span>
                      <span>{chain.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-[#6B7B89]">
              Choose the blockchain where your smart account will be created
            </p>
          </div>

          {/* Account Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#C9E9FF]">
              Account Type
            </Label>
            <div className="rounded-xl border border-[#162032] bg-[#0F1724] px-3 py-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-[#00E6A8]" />
                <span className="text-sm text-[#E6F0FF]">ERC-4337 Smart Account</span>
              </div>
            </div>
            <p className="text-xs text-[#6B7B89]">
              Industry standard for smart contract wallets with advanced features
            </p>
          </div>

          {/* Features Info */}
          <div className="rounded-xl bg-[#091733] p-3 space-y-2">
            <h4 className="text-sm font-medium text-[#C9E9FF]">Smart Account Features:</h4>
            <ul className="text-xs text-[#6B7B89] space-y-1">
              <li>• Gas abstraction (pay fees with ERC-20 tokens)</li>
              <li>• Batch transactions (multiple operations in one tx)</li>
              <li>• Social recovery and account security</li>
              <li>• Programmable transaction logic</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="rounded-xl border border-[#162032] bg-[#0F1724] text-[#C9E9FF] hover:bg-[#162032]"
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!walletAddress || isCreating}
            className="rounded-xl bg-[#00E6A8] text-[#001217] hover:bg-[#00D29A] disabled:opacity-50"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}