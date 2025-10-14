import { prisma } from '../utils/prisma'
import { NotFoundError, ValidationError } from '../utils/errors'
import { log } from '../utils/logger'
import { CreateSmartAccountDto, UpdateSmartAccountDto } from '../types'

export class SmartAccountService {
  /**
   * 创建智能账户
   */
  async createSmartAccount(userId: string, data: CreateSmartAccountDto) {
    // 检查同一用户在同一链上是否已有相同类型的账户
    const existing = await prisma.smartAccount.findFirst({
      where: {
        userId,
        ownerAddress: data.ownerAddress.toLowerCase(),
        chainId: data.chainId,
      },
    })

    if (existing) {
      throw new ValidationError(
        'Smart account already exists for this wallet on this chain'
      )
    }

    // TODO: 集成 Stackup SDK 创建链上账户
    // const accountAddress = await stackupService.createAccount(data.ownerAddress, data.chainId)

    // 生成临时的账户地址（实际应该从 Stackup SDK 获取）
    const tempAccountAddress = data.accountAddress?.toLowerCase() || 
      `0x${Math.random().toString(16).substr(2, 40).padStart(40, '0')}`

    const smartAccount = await prisma.smartAccount.create({
      data: {
        userId,
        ownerAddress: data.ownerAddress.toLowerCase(),
        accountAddress: tempAccountAddress,
        chainId: data.chainId,
        accountType: data.accountType || 'erc4337',
        isDeployed: false,
      },
    })

    log.info(`Smart account created: ${smartAccount.id}`)
    return smartAccount
  }

  /**
   * 获取用户的智能账户列表
   */
  async getUserSmartAccounts(userId: string, chainId?: number) {
    const where: any = { userId }
    if (chainId) {
      where.chainId = chainId
    }

    const accounts = await prisma.smartAccount.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return accounts
  }

  /**
   * 根据 ID 获取智能账户
   */
  async getSmartAccountById(accountId: string, userId: string) {
    const account = await prisma.smartAccount.findFirst({
      where: {
        id: accountId,
        userId,
      },
    })

    if (!account) {
      throw new NotFoundError('Smart account')
    }

    return account
  }

  /**
   * 根据账户地址获取智能账户
   */
  async getSmartAccountByAddress(accountAddress: string, userId: string) {
    const account = await prisma.smartAccount.findFirst({
      where: {
        accountAddress: accountAddress.toLowerCase(),
        userId,
      },
    })

    if (!account) {
      throw new NotFoundError('Smart account')
    }

    return account
  }

  /**
   * 更新智能账户信息
   */
  async updateSmartAccount(
    accountId: string,
    userId: string,
    data: UpdateSmartAccountDto
  ) {
    const existing = await prisma.smartAccount.findFirst({
      where: {
        id: accountId,
        userId,
      },
    })

    if (!existing) {
      throw new NotFoundError('Smart account')
    }

    const account = await prisma.smartAccount.update({
      where: { id: accountId },
      data: {
        accountAddress: data.accountAddress?.toLowerCase(),
        isDeployed: data.isDeployed,
        deploymentTxHash: data.deploymentTxHash,
      },
    })

    log.info(`Smart account updated: ${account.id}`)
    return account
  }

  /**
   * 删除智能账户
   */
  async deleteSmartAccount(accountId: string, userId: string) {
    const account = await prisma.smartAccount.findFirst({
      where: {
        id: accountId,
        userId,
      },
    })

    if (!account) {
      throw new NotFoundError('Smart account')
    }

    // 检查是否有关联的订阅或自动化规则
    const [subscriptionsCount, automationRulesCount] = await Promise.all([
      prisma.eventSubscription.count({
        where: { smartAccountId: accountId },
      }),
      prisma.automationRule.count({
        where: { smartAccountId: accountId },
      }),
    ])

    if (subscriptionsCount > 0 || automationRulesCount > 0) {
      throw new ValidationError(
        'Cannot delete smart account with active subscriptions or automation rules'
      )
    }

    await prisma.smartAccount.delete({
      where: { id: accountId },
    })

    log.info(`Smart account deleted: ${accountId}`)
  }

  /**
   * 获取智能账户统计信息
   */
  async getSmartAccountStats(accountId: string, userId: string) {
    const account = await prisma.smartAccount.findFirst({
      where: {
        id: accountId,
        userId,
      },
    })

    if (!account) {
      throw new NotFoundError('Smart account')
    }

    const [subscriptionsCount, automationRulesCount, eventsCount] =
      await Promise.all([
        prisma.eventSubscription.count({
          where: { smartAccountId: accountId, isActive: true },
        }),
        prisma.automationRule.count({
          where: { smartAccountId: accountId, isActive: true },
        }),
        prisma.eventsCache.count({
          where: { smartAccountAddress: account.accountAddress || undefined },
        }),
      ])

    return {
      subscriptionsCount,
      automationRulesCount,
      eventsCount,
    }
  }

  /**
   * 更新智能账户余额
   * TODO: 实现余额查询功能，从区块链获取实时余额
   */
  async updateBalance(accountId: string, balance: string) {
    // 暂时移除，因为 schema 中没有 balance 字段
    // 实际应该从区块链查询余额并缓存到 Redis 或其他存储
    log.info(`Balance update requested for account ${accountId}: ${balance}`)
    
    // 返回账户信息（不更新 balance 字段）
    const account = await prisma.smartAccount.findUnique({
      where: { id: accountId },
    })
    
    if (!account) {
      throw new NotFoundError('Smart account')
    }
    
    return account
  }

  /**
   * 标记智能账户为已部署
   */
  async markAsDeployed(
    accountId: string,
    userId: string,
    txHash: string,
    accountAddress: string
  ) {
    const existing = await prisma.smartAccount.findFirst({
      where: {
        id: accountId,
        userId,
      },
    })

    if (!existing) {
      throw new NotFoundError('Smart account')
    }

    const account = await prisma.smartAccount.update({
      where: { id: accountId },
      data: {
        isDeployed: true,
        deploymentTxHash: txHash,
        accountAddress: accountAddress.toLowerCase(),
      },
    })

    log.info(`Smart account marked as deployed: ${accountId}`)
    return account
  }
}

export const smartAccountService = new SmartAccountService()

