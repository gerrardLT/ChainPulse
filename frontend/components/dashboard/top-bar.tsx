'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAccount } from 'wagmi'
import { useState } from 'react'
import { CreateSubscriptionDialog } from '@/components/dialogs/create-subscription-dialog'

export function TopBar() {
  const { chain } = useAccount()
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const getNetworkName = (chainId?: number) => {
    switch (chainId) {
      case 1: return 'Mainnet'
      case 5: return 'Goerli'
      case 11155111: return 'Sepolia'
      case 137: return 'Polygon'
      case 10: return 'Optimism'
      case 42161: return 'Arbitrum'
      case 8453: return 'Base'
      case 10143: return 'Monad Testnet' // 🔥 Added Monad Testnet
      default: return 'Unknown'
    }
  }

  return (
    <>
      <div className="border-b border-[#162032] px-5 py-4">
        <div className="flex items-center justify-between">
          {/* Network Badges */}
          <div className="flex items-center gap-3">
            {chain && (
              <div className="rounded-full bg-[#071322] px-2.5 py-1.5">
                <span className="text-xs font-medium text-[#6B7B89]">
                  {chain.name}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button 
              className="group flex items-center gap-2 rounded-xl bg-[#00E6A8] px-3 py-2.5 text-sm font-medium text-[#001217] transition-all duration-200 hover:bg-[#00D29A] hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-105 active:scale-95"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="h-[18px] w-[18px] transition-transform duration-200 group-hover:rotate-90" />
              New Subscription
            </Button>
          </div>
        </div>
      </div>

      <CreateSubscriptionDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
      />
    </>
  )
}

