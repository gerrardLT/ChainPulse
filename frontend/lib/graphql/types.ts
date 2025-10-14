// ==========================================
// GraphQL Types (Generated from Envio Schema)
// ==========================================

export interface SmartAccount {
  id: string
  address: string
  owner: string
  factory: string
  createdAt: string
  transactionCount: number
  totalValueTransferred: string
}

export interface Transaction {
  id: string
  hash: string
  smartAccount: {
    id: string
    address: string
  }
  target: string
  value: string
  data: string
  success: boolean
  timestamp: string
  blockNumber: number
}

export interface OwnershipTransfer {
  id: string
  smartAccount: {
    id: string
    address: string
  }
  previousOwner: string
  newOwner: string
  timestamp: string
  transactionHash: string
}

export interface DailyStatistic {
  id: string
  date: string
  accountsCreated: number
  transactionsExecuted: number
  totalValueTransferred: string
  activeAccounts: number
}

export interface GlobalStatistic {
  id: string
  totalAccounts: number
  totalTransactions: number
  totalValueTransferred: string
  activeAccounts: number
  lastUpdated: string
}

// Query Variables
export interface GetSmartAccountVariables {
  id: string
}

export interface GetSmartAccountsVariables {
  first?: number
  skip?: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}

export interface GetSmartAccountsByOwnerVariables {
  owner: string
}

export interface GetTransactionVariables {
  id: string
}

export interface GetTransactionsVariables {
  first?: number
  skip?: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
  where?: {
    smartAccount_?: {
      id?: string
      address?: string
    }
    success?: boolean
    timestamp_gte?: string
    timestamp_lte?: string
  }
}

export interface GetTransactionsByAccountVariables {
  accountId: string
  first?: number
  skip?: number
}

export interface GetOwnershipTransfersVariables {
  accountId: string
}

export interface GetDailyStatsVariables {
  date: string
}

export interface GetDailyStatsRangeVariables {
  startDate: string
  endDate: string
}

export interface GetRecentEventsVariables {
  first?: number
  accountAddress?: string
}

// Subscription Variables
export interface SubscribeNewTransactionVariables {
  accountAddress?: string
}

export interface SubscribeAccountUpdatesVariables {
  accountId: string
}

export interface SubscribeOwnershipTransferVariables {
  accountAddress?: string
}

