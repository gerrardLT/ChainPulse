import { prisma } from '../utils/prisma'
import { NotFoundError, ValidationError } from '../utils/errors'
import { log } from '../utils/logger'
import { CreateUserDto, UpdateUserDto } from '../types'

export class UserService {
  /**
   * 根据 ID 获取用户
   */
  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        walletAddress: true,
        ensName: true,
        avatarUrl: true,
        email: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      throw new NotFoundError('User')
    }

    return user
  }

  /**
   * 根据钱包地址获取用户
   */
  async getUserByWalletAddress(walletAddress: string) {
    const user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
      select: {
        id: true,
        walletAddress: true,
        ensName: true,
        avatarUrl: true,
        email: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      throw new NotFoundError('User')
    }

    return user
  }

  /**
   * 创建用户
   */
  async createUser(data: CreateUserDto) {
    // 检查钱包地址是否已存在
    const existing = await prisma.user.findUnique({
      where: { walletAddress: data.walletAddress.toLowerCase() },
    })

    if (existing) {
      throw new ValidationError('Wallet address already registered')
    }

    const user = await prisma.user.create({
      data: {
        walletAddress: data.walletAddress.toLowerCase(),
        ensName: data.ensName,
        avatarUrl: data.avatarUrl,
      },
      select: {
        id: true,
        walletAddress: true,
        ensName: true,
        avatarUrl: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    log.info(`User created: ${user.id}`)
    return user
  }

  /**
   * 更新用户信息
   */
  async updateUser(userId: string, data: UpdateUserDto) {
    // 检查用户是否存在
    const existing = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!existing) {
      throw new NotFoundError('User')
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ensName: data.ensName,
        avatarUrl: data.avatarUrl,
        email: data.email,
      },
      select: {
        id: true,
        walletAddress: true,
        ensName: true,
        avatarUrl: true,
        email: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    log.info(`User updated: ${user.id}`)
    return user
  }

  /**
   * 删除用户（软删除）
   */
  async deleteUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new NotFoundError('User')
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    })

    log.info(`User deactivated: ${userId}`)
  }

  /**
   * 获取用户统计信息
   */
  async getUserStats(userId: string) {
    const [smartAccountsCount, subscriptionsCount, notificationsCount] =
      await Promise.all([
        prisma.smartAccount.count({
          where: { userId },
        }),
        prisma.eventSubscription.count({
          where: { userId, isActive: true },
        }),
        prisma.notification.count({
          where: { userId },
        }),
      ])

    return {
      smartAccountsCount,
      subscriptionsCount,
      notificationsCount,
    }
  }
}

export const userService = new UserService()

