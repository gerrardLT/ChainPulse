import { gql } from '@apollo/client'

// ==========================================
// Smart Account Queries
// ==========================================

export const GET_SMART_ACCOUNT = gql`
  query GetSmartAccount($id: ID!) {
    SmartAccount(id: $id) {
      id
      address
      owner
      factory
      createdAt
      transactionCount
      totalValueTransferred
    }
  }
`

export const GET_SMART_ACCOUNTS = gql`
  query GetSmartAccounts($first: Int, $skip: Int, $orderBy: String, $orderDirection: String) {
    SmartAccount(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      id
      address
      owner
      factory
      createdAt
      transactionCount
      totalValueTransferred
    }
  }
`

export const GET_SMART_ACCOUNTS_BY_OWNER = gql`
  query GetSmartAccountsByOwner($owner: String!) {
    SmartAccount(where: { owner: $owner }) {
      id
      address
      owner
      factory
      createdAt
      transactionCount
      totalValueTransferred
    }
  }
`

// ==========================================
// Transaction Queries
// ==========================================

export const GET_TRANSACTION = gql`
  query GetTransaction($id: ID!) {
    Transaction(id: $id) {
      id
      hash
      smartAccount {
        id
        address
      }
      target
      value
      data
      success
      timestamp
      blockNumber
    }
  }
`

export const GET_TRANSACTIONS = gql`
  query GetTransactions(
    $first: Int
    $skip: Int
    $orderBy: String
    $orderDirection: String
    $where: TransactionFilter
  ) {
    Transaction(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: $where
    ) {
      id
      hash
      smartAccount {
        id
        address
      }
      target
      value
      data
      success
      timestamp
      blockNumber
    }
  }
`

export const GET_TRANSACTIONS_BY_ACCOUNT = gql`
  query GetTransactionsByAccount($accountId: ID!, $first: Int, $skip: Int) {
    Transaction(
      where: { smartAccount_: { id: $accountId } }
      first: $first
      skip: $skip
      orderBy: "timestamp"
      orderDirection: "desc"
    ) {
      id
      hash
      target
      value
      success
      timestamp
      blockNumber
    }
  }
`

// ==========================================
// Ownership Transfer Queries
// ==========================================

export const GET_OWNERSHIP_TRANSFERS = gql`
  query GetOwnershipTransfers($accountId: ID!) {
    OwnershipTransfer(
      where: { smartAccount_: { id: $accountId } }
      orderBy: "timestamp"
      orderDirection: "desc"
    ) {
      id
      smartAccount {
        id
        address
      }
      previousOwner
      newOwner
      timestamp
      transactionHash
    }
  }
`

// ==========================================
// Statistics Queries
// ==========================================

export const GET_DAILY_STATS = gql`
  query GetDailyStats($date: String!) {
    DailyStatistic(id: $date) {
      id
      date
      accountsCreated
      transactionsExecuted
      totalValueTransferred
      activeAccounts
    }
  }
`

export const GET_DAILY_STATS_RANGE = gql`
  query GetDailyStatsRange($startDate: String!, $endDate: String!) {
    DailyStatistic(
      where: { date_gte: $startDate, date_lte: $endDate }
      orderBy: "date"
      orderDirection: "asc"
    ) {
      id
      date
      accountsCreated
      transactionsExecuted
      totalValueTransferred
      activeAccounts
    }
  }
`

export const GET_GLOBAL_STATS = gql`
  query GetGlobalStats {
    GlobalStatistic(id: "global") {
      id
      totalAccounts
      totalTransactions
      totalValueTransferred
      activeAccounts
      lastUpdated
    }
  }
`

// ==========================================
// Event Timeline Query (for dashboard)
// ==========================================

export const GET_RECENT_EVENTS = gql`
  query GetRecentEvents($first: Int, $accountAddress: String) {
    transactions: Transaction(
      first: $first
      orderBy: "timestamp"
      orderDirection: "desc"
      where: $accountAddress ? { smartAccount_: { address: $accountAddress } } : {}
    ) {
      id
      hash
      smartAccount {
        address
      }
      target
      value
      success
      timestamp
      blockNumber
    }
    ownershipTransfers: OwnershipTransfer(
      first: $first
      orderBy: "timestamp"
      orderDirection: "desc"
      where: $accountAddress ? { smartAccount_: { address: $accountAddress } } : {}
    ) {
      id
      smartAccount {
        address
      }
      previousOwner
      newOwner
      timestamp
      transactionHash
    }
  }
`

