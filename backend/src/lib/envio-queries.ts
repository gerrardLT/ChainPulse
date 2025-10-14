import { gql } from '@apollo/client/core'

/**
 * Envio GraphQL 查询定义
 * 基于 indexer/schema.graphql
 */

/**
 * 查询交易列表（用于事件展示）
 */
export const GET_TRANSACTIONS = gql`
  query GetTransactions(
    $first: Int
    $skip: Int
    $where: TransactionFilter
    $orderBy: TransactionOrderBy
    $orderDirection: OrderDirection
  ) {
    transactions(
      first: $first
      skip: $skip
      where: $where
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      id
      smartAccount {
        id
        accountAddress
        owner
      }
      target
      value
      data
      transactionHash
      blockNumber
      timestamp
      gasUsed
      success
      chainId
    }
  }
`

/**
 * 查询单个交易
 */
export const GET_TRANSACTION = gql`
  query GetTransaction($id: ID!) {
    transaction(id: $id) {
      id
      smartAccount {
        id
        accountAddress
        owner
        currentOwner
      }
      target
      value
      data
      transactionHash
      blockNumber
      timestamp
      gasUsed
      success
      chainId
    }
  }
`

/**
 * 查询智能账户列表
 */
export const GET_SMART_ACCOUNTS = gql`
  query GetSmartAccounts(
    $first: Int
    $skip: Int
    $where: SmartAccountFilter
    $orderBy: SmartAccountOrderBy
    $orderDirection: OrderDirection
  ) {
    smartAccounts(
      first: $first
      skip: $skip
      where: $where
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      id
      accountAddress
      owner
      chainId
      factory
      salt
      isDeployed
      deploymentTxHash
      deploymentTimestamp
      currentOwner
      createdAt
      updatedAt
      createdAtBlock
      updatedAtBlock
    }
  }
`

/**
 * 查询单个智能账户
 */
export const GET_SMART_ACCOUNT = gql`
  query GetSmartAccount($id: ID!) {
    smartAccount(id: $id) {
      id
      accountAddress
      owner
      chainId
      factory
      salt
      isDeployed
      deploymentTxHash
      deploymentTimestamp
      currentOwner
      createdAt
      updatedAt
      createdAtBlock
      updatedAtBlock
      transactions(first: 10, orderBy: timestamp, orderDirection: desc) {
        id
        target
        value
        transactionHash
        timestamp
        success
      }
      ownershipTransfers(first: 10, orderBy: timestamp, orderDirection: desc) {
        id
        previousOwner
        newOwner
        transactionHash
        timestamp
      }
    }
  }
`

/**
 * 查询账户的交易历史
 */
export const GET_ACCOUNT_TRANSACTIONS = gql`
  query GetAccountTransactions($accountId: ID!, $first: Int, $skip: Int) {
    smartAccount(id: $accountId) {
      id
      accountAddress
      transactions(first: $first, skip: $skip, orderBy: timestamp, orderDirection: desc) {
        id
        target
        value
        data
        transactionHash
        blockNumber
        timestamp
        gasUsed
        success
        chainId
      }
    }
  }
`

/**
 * 查询每日统计
 */
export const GET_DAILY_STATS = gql`
  query GetDailyStats($chainId: Int!, $date: String!) {
    dailyAccountStats(where: { chainId: $chainId, date: $date }) {
      id
      chainId
      date
      accountsCreated
      totalAccounts
    }
    dailyTransactionStats(where: { chainId: $chainId, date: $date }) {
      id
      chainId
      date
      transactionCount
      totalValue
      totalGasUsed
      successfulTransactions
      failedTransactions
    }
  }
`

/**
 * 查询全局统计
 */
export const GET_GLOBAL_STATS = gql`
  query GetGlobalStats($chainId: Int!) {
    globalStats(where: { chainId: $chainId }) {
      id
      chainId
      totalAccounts
      totalTransactions
      totalValue
      lastUpdated
    }
  }
`

/**
 * 查询所有权转移记录
 */
export const GET_OWNERSHIP_TRANSFERS = gql`
  query GetOwnershipTransfers(
    $first: Int
    $skip: Int
    $where: OwnershipTransferFilter
    $orderBy: OwnershipTransferOrderBy
    $orderDirection: OrderDirection
  ) {
    ownershipTransfers(
      first: $first
      skip: $skip
      where: $where
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      id
      smartAccount {
        id
        accountAddress
      }
      previousOwner
      newOwner
      transactionHash
      blockNumber
      timestamp
      chainId
    }
  }
`

/**
 * 订阅新交易
 */
export const SUBSCRIBE_NEW_TRANSACTIONS = gql`
  subscription OnNewTransaction {
    transaction {
      id
      smartAccount {
        accountAddress
      }
      target
      value
      transactionHash
      timestamp
      success
      chainId
    }
  }
`

/**
 * 订阅新智能账户
 */
export const SUBSCRIBE_NEW_ACCOUNTS = gql`
  subscription OnNewAccount {
    smartAccount {
      id
      accountAddress
      owner
      chainId
      isDeployed
      createdAt
    }
  }
`

