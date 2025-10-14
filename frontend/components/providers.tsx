'use client'

import '@rainbow-me/rainbowkit/styles.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit'
import { ApolloProvider } from '@apollo/client/react'
import { config } from '@/lib/wagmi-config'
import { apolloClient } from '@/lib/apollo-client'
import { useTheme } from 'next-themes'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const { theme } = useTheme()

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ApolloProvider client={apolloClient}>
          <RainbowKitProvider
            theme={theme === 'dark' ? darkTheme() : lightTheme()}
            modalSize="compact"
            showRecentTransactions={true}
          >
            {children}
          </RainbowKitProvider>
        </ApolloProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

