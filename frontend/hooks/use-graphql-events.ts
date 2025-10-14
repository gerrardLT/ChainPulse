'use client'

import { useQuery, useSubscription } from '@apollo/client'
import {
  GET_RECENT_EVENTS,
  GET_TRANSACTIONS_BY_ACCOUNT,
  GET_GLOBAL_STATS,
} from '@/lib/graphql/queries'
import {
  SUBSCRIBE_NEW_TRANSACTION,
  SUBSCRIBE_GLOBAL_STATS,
} from '@/lib/graphql/subscriptions'
import type {
  Transaction,
  GlobalStatistic,
  GetRecentEventsVariables,
  GetTransactionsByAccountVariables,
  SubscribeNewTransactionVariables,
} from '@/lib/graphql/types'

// ==========================================
// Hook: Recent Events (for Timeline)
// ==========================================

export function useRecentEvents(accountAddress?: string, limit: number = 20) {
  const { data, loading, error, refetch } = useQuery<
    {
      transactions: Transaction[]
      ownershipTransfers: any[]
    },
    GetRecentEventsVariables
  >(GET_RECENT_EVENTS, {
    variables: {
      first: limit,
      accountAddress,
    },
    pollInterval: 30000, // Poll every 30 seconds
  })

  // Subscribe to new transactions
  useSubscription<
    { Transaction: Transaction[] },
    SubscribeNewTransactionVariables
  >(SUBSCRIBE_NEW_TRANSACTION, {
    variables: { accountAddress },
    onData: () => {
      refetch()
    },
  })

  return {
    transactions: data?.transactions || [],
    ownershipTransfers: data?.ownershipTransfers || [],
    loading,
    error,
    refetch,
  }
}

// ==========================================
// Hook: Account Transactions
// ==========================================

export function useAccountTransactions(
  accountId: string,
  page: number = 0,
  pageSize: number = 10
) {
  const { data, loading, error, refetch } = useQuery<
    { Transaction: Transaction[] },
    GetTransactionsByAccountVariables
  >(GET_TRANSACTIONS_BY_ACCOUNT, {
    variables: {
      accountId,
      first: pageSize,
      skip: page * pageSize,
    },
  })

  return {
    transactions: data?.Transaction || [],
    loading,
    error,
    refetch,
  }
}

// ==========================================
// Hook: Global Statistics
// ==========================================

export function useGlobalStats() {
  const { data, loading, error } = useQuery<{
    GlobalStatistic: GlobalStatistic | null
  }>(GET_GLOBAL_STATS)

  // Subscribe to stats updates
  useSubscription<{ GlobalStatistic: GlobalStatistic }>(
    SUBSCRIBE_GLOBAL_STATS,
    {
      onData: ({ client, data: subData }) => {
        if (subData.data?.GlobalStatistic) {
          client.cache.modify({
            fields: {
              GlobalStatistic() {
                return subData.data?.GlobalStatistic
              },
            },
          })
        }
      },
    }
  )

  return {
    stats: data?.GlobalStatistic || null,
    loading,
    error,
  }
}

