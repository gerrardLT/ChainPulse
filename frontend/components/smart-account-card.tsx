"use client"

import { useSmartAccount } from "@/hooks/use-smart-account"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Copy, ExternalLink, Loader2, Wallet, Zap } from "lucide-react"
import { Button } from "./ui/button"
import { toast } from "sonner"
import { Badge } from "./ui/badge"

export function SmartAccountCard() {
  const { eoaAddress, smartAccountAddress, isLoading, error, isConnected } = useSmartAccount()

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (!isConnected) {
    return (
      <Card className="glass-card border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,255,0.1)]">
        <CardHeader>
          <CardTitle className="text-cyan-400">Smart Account</CardTitle>
          <CardDescription>Connect your wallet to view smart account details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Wallet className="h-12 w-12 text-cyan-400/50 mb-4" />
            <p className="text-sm text-muted-foreground">No wallet connected</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-card border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,255,0.1)] animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-cyan-400 animate-pulse-glow" />
          <span className="text-gradient">Smart Account</span>
        </CardTitle>
        <CardDescription>Your ERC-4337 smart account details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-cyan-400">EOA Address</span>
            <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">
              Connected
            </Badge>
          </div>
          <div className="flex items-center gap-2 rounded-lg glass-card border border-cyan-500/20 p-3">
            <code className="flex-1 text-sm font-mono text-cyan-300">
              {eoaAddress ? truncateAddress(eoaAddress) : "N/A"}
            </code>
            {eoaAddress && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-cyan-500/10 hover:text-cyan-400 transition-all duration-200"
                  onClick={() => copyToClipboard(eoaAddress, "EOA Address")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-cyan-500/10 hover:text-cyan-400 transition-all duration-200"
                  onClick={() => window.open(`https://etherscan.io/address/${eoaAddress}`, "_blank")}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-purple-400">Smart Account Address</span>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />}
            {smartAccountAddress && (
              <Badge className="bg-gradient-to-r from-cyan-500 to-purple-500 border-none shadow-[0_0_10px_rgba(0,255,255,0.3)]">
                Smart Account
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 rounded-lg glass-card border border-purple-500/20 p-3">
            {isLoading ? (
              <span className="flex-1 text-sm text-muted-foreground">Loading smart account...</span>
            ) : error ? (
              <span className="flex-1 text-sm text-destructive">Failed to load smart account</span>
            ) : smartAccountAddress ? (
              <>
                <code className="flex-1 text-sm font-mono">{truncateAddress(smartAccountAddress)}</code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-cyan-500/10 hover:text-cyan-400 transition-all duration-200"
                  onClick={() => copyToClipboard(smartAccountAddress, "Smart Account Address")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-cyan-500/10 hover:text-cyan-400 transition-all duration-200"
                  onClick={() => window.open(`https://etherscan.io/address/${smartAccountAddress}`, "_blank")}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <span className="flex-1 text-sm text-muted-foreground">No smart account found</span>
            )}
          </div>
        </div>

        <div className="rounded-lg glass-card border border-cyan-500/20 p-4 space-y-2 bg-gradient-to-br from-cyan-500/5 to-purple-500/5">
          <h4 className="text-sm font-semibold text-cyan-400">Smart Account Features</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_5px_rgba(0,255,255,0.6)]" />
              Gas-less transactions with Paymaster
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-purple-400 shadow-[0_0_5px_rgba(107,75,255,0.6)]" />
              Batch transaction execution
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_5px_rgba(0,255,255,0.6)]" />
              Automated event responses
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
