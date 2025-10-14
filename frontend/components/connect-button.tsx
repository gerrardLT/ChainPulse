"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Button } from "./ui/button"
import { useNetworkSwitch } from "@/hooks/use-network-switch"

export function CustomConnectButton({ variant = 'default' }: { variant?: 'default' | 'sidebar' }) {
  const { isOnMonadTestnet, switchToMonadTestnet } = useNetworkSwitch()
  
  // 🔥 安全的网络切换处理函数
  const handleNetworkSwitch = () => {
    try {
      switchToMonadTestnet()
    } catch (error) {
      console.error('[ConnectButton] Failed to switch network:', error)
    }
  }
  
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted
        const connected = ready && account && chain

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                if (variant === 'sidebar') {
                  return (
                    <button
                      onClick={openConnectModal}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00E6A8] px-3 py-2.5 text-sm font-medium text-[#001217] transition-colors hover:bg-[#00D29A]"
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M9 1.5V16.5M16.5 9H1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      Connect Wallet
                    </button>
                  )
                }
                return (
                  <Button
                    onClick={openConnectModal}
                    size="default"
                    className="neon-button bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 border-none shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:shadow-[0_0_30px_rgba(0,255,255,0.5)] transition-all duration-200"
                  >
                    Connect Wallet
                  </Button>
                )
              }

              if (chain.unsupported) {
                if (variant === 'sidebar') {
                  return (
                    <button
                      onClick={openChainModal}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600"
                    >
                      Wrong network
                    </button>
                  )
                }
                return (
                  <Button
                    onClick={openChainModal}
                    variant="destructive"
                    size="default"
                    className="shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                  >
                    Wrong network
                  </Button>
                )
              }

              if (variant === 'sidebar') {
                return (
                  <button
                    onClick={openAccountModal}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#052833] px-3 py-2.5 text-sm font-medium text-[#BFFFE7] transition-colors hover:bg-[#063844]"
                  >
                    Manage Wallet
                  </button>
                )
              }

              return (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={isOnMonadTestnet ? openChainModal : handleNetworkSwitch}
                    variant="outline"
                    size="default"
                    className={`gap-2 glass-card transition-all duration-200 bg-transparent ${
                      isOnMonadTestnet 
                        ? 'border-cyan-500/30 hover:border-cyan-500/50 hover:bg-cyan-500/10' 
                        : 'border-yellow-500/50 hover:border-yellow-500/70 hover:bg-yellow-500/10'
                    }`}
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 16,
                          height: 16,
                          borderRadius: 999,
                          overflow: "hidden",
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? "Chain icon"}
                            src={chain.iconUrl || "/placeholder.svg"}
                            style={{ width: 16, height: 16 }}
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                    {!isOnMonadTestnet && (
                      <span className="text-yellow-400 text-xs">⚠️</span>
                    )}
                  </Button>

                  <Button
                    onClick={openAccountModal}
                    size="default"
                    className="neon-button bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 border border-cyan-500/30 hover:border-cyan-500/50 shadow-[0_0_15px_rgba(0,255,255,0.2)] hover:shadow-[0_0_25px_rgba(0,255,255,0.4)] transition-all duration-200"
                  >
                    {account.displayName}
                  </Button>
                </div>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}
