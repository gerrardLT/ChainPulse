import { gql } from '@apollo/client'

// ==========================================
// Real-time Subscriptions
// ==========================================

export const SUBSCRIBE_NEW_SMART_ACCOUNT = gql`
  subscription OnNewSmartAccount {
    SmartAccount(orderBy: "createdAt", orderDirection: "desc", first: 1) {
      id
      address
      owner
      factory
      createdAt
    }
  }
`

export const SUBSCRIBE_NEW_TRANSACTION = gql`
  subscription OnNewTransaction($accountAddress: String) {
    Transaction(
      orderBy: "timestamp"
      orderDirection: "desc"
      first: 1
      where: $accountAddress ? { smartAccount_: { address: $accountAddress } } : {}
    ) {
      id
      hash
      smartAccount {
        id
        address
      }
      target
      value
      success
      timestamp
      blockNumber
    }
  }
`

export const SUBSCRIBE_ACCOUNT_UPDATES = gql`
  subscription OnAccountUpdates($accountId: ID!) {
    SmartAccount(where: { id: $accountId }) {
      id
      address
      owner
      transactionCount
      totalValueTransferred
    }
  }
`

export const SUBSCRIBE_OWNERSHIP_TRANSFER = gql`
  subscription OnOwnershipTransfer($accountAddress: String) {
    OwnershipTransfer(
      orderBy: "timestamp"
      orderDirection: "desc"
      first: 1
      where: $accountAddress ? { smartAccount_: { address: $accountAddress } } : {}
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

export const SUBSCRIBE_GLOBAL_STATS = gql`
  subscription OnGlobalStatsUpdate {
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

