'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { 
  LayoutDashboard, 
  Bell, 
  BarChart3, 
  Wallet, 
  Rss, 
  Plug 
} from 'lucide-react'
import { useAccount } from 'wagmi'
import { CustomConnectButton } from '@/components/connect-button'
import { useAuthContext } from '@/components/auth-provider'
import { useNetworkSwitch } from '@/hooks/use-network-switch'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, section: 'Overview' },
  { name: 'Notifications', href: '/notifications', icon: Bell, section: 'Overview' },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, section: 'Overview' },
  { name: 'Smart Accounts', href: '/smart-accounts', icon: Wallet, section: 'Automation' },
  { name: 'Subscriptions', href: '/subscriptions', icon: Rss, section: 'Automation' },
  { name: 'Integrations', href: '/integrations', icon: Plug, section: 'Automation' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { address, isConnected, chain } = useAccount()
  const { login, isLoading: authLoading, isAuthenticated } = useAuthContext()
  const { isOnMonadTestnet } = useNetworkSwitch()

  // 🔥 移除重复的认证触发逻辑 - 现在由 AuthProvider 统一管理
  // useEffect(() => {
  //   if (isConnected && address && !isAuthenticated && !authLoading) {
  //     console.log('[Sidebar] 钱包已连接，开始认证流程...')
  //     login()
  //   }
  // }, [isConnected, address, isAuthenticated, authLoading, login])

  // Group navigation items by section
  const overviewItems = navigation.filter(item => item.section === 'Overview')
  const automationItems = navigation.filter(item => item.section === 'Automation')

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[187px] border-r border-[#162032] bg-[#06101B] p-4">
      {/* Logo */}
      <div className="mb-4 flex h-8 items-center gap-2.5 rounded-xl bg-[#091733] px-2.5">
        <div className="text-lg font-semibold text-[#9FBED9]">ChainPulse</div>
      </div>

      {/* Search */}
      <div className="mb-4 rounded-xl border border-[#162032] bg-[#0F1724] px-3 py-2.5">
        <input
          type="text"
          placeholder="Search contracts, wallets…"
          className="w-full bg-transparent text-sm text-[#9FBED9] placeholder:text-[#9FBED9] focus:outline-none"
        />
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {/* Overview Section */}
        <div className="space-y-1">
          <div className="px-2 py-3">
            <p className="text-xs text-[#6B7B89]">Overview</p>
          </div>
          {overviewItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-base transition-colors',
                  isActive
                    ? 'bg-[#052833] text-[#BFFFE7]'
                    : 'text-[#9FBED9] hover:bg-[#091733]'
                )}
              >
                <item.icon className="h-[18px] w-[18px]" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>

        {/* Automation Section */}
        <div className="space-y-1 pt-3">
          <div className="px-2 py-3">
            <p className="text-xs text-[#6B7B89]">Automation</p>
          </div>
          {automationItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-base transition-colors',
                  isActive
                    ? 'bg-[#052833] text-[#BFFFE7]'
                    : 'text-[#9FBED9] hover:bg-[#091733]'
                )}
              >
                <item.icon className="h-[18px] w-[18px]" />
                <span className="leading-tight">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Wallet Connection (Bottom) */}
      <div className="absolute bottom-4 left-4 right-4 space-y-2.5">
        {isConnected && address ? (
          <div className="space-y-1.5 rounded-xl bg-[#091733] p-3">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-[#C9E9FF]" />
              <span className="text-[13px] font-semibold text-[#C9E9FF]">Wallet</span>
              {/* 🔥 认证状态指示器 */}
              {authLoading && (
                <div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
              )}
              {isAuthenticated && !authLoading && (
                <div className="h-2 w-2 rounded-full bg-green-400" />
              )}
            </div>
            <p className="text-xs text-[#C9E9FF] font-mono">
              {address.slice(0, 6)}...{address.slice(-4)}
            </p>
            {/* 🔥 网络和认证状态 */}
            <div className="space-y-0.5">
              <p className="text-[10px] text-[#6B7B89]">
                {chain?.name || 'Unknown Network'}
                {!isOnMonadTestnet && chain && (
                  <span className="ml-1 text-yellow-400">⚠️</span>
                )}
              </p>
              <p className="text-[10px] text-[#6B7B89]">
                {authLoading ? 'Authenticating...' : 
                 isAuthenticated ? 'Authenticated ✓' : 'Not authenticated'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5 rounded-xl bg-[#091733] p-3">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-[#C9E9FF]" />
              <span className="text-[13px] font-semibold text-[#C9E9FF]">Wallet</span>
            </div>
            <p className="text-xs text-[#C9E9FF]">Not connected</p>
          </div>
        )}
        
        <div className="w-full">
          <CustomConnectButton variant="sidebar" />
        </div>
        
        <p className="text-center text-xs text-[#6B7B89]">
          Manage accounts and networks
        </p>
      </div>
    </aside>
  )
}

