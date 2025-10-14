import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 开始插入模拟数据...')

  // 清空现有数据
  console.log('🗑️  清空现有数据...')
  await prisma.notification.deleteMany()
  await prisma.automationRule.deleteMany()
  await prisma.eventSubscription.deleteMany()
  await prisma.smartAccount.deleteMany()
  await prisma.telegramConfig.deleteMany()
  await prisma.discordConfig.deleteMany()
  await prisma.user.deleteMany()

  // ============================================
  // 1. 创建用户
  // ============================================
  console.log('👥 创建用户...')
  
  const alice = await prisma.user.create({
    data: {
      id: 'ec962f69-2e5e-4ed0-b74d-c0638771baa4',
      walletAddress: '0x742d35cc6634c0532925a3b844bc9e7595f0beb2',
      ensName: 'alice.eth',
      isActive: true,
    },
  })

  const bob = await prisma.user.create({
    data: {
      id: 'f1a72b8a-3f6d-4be1-b85c-d1749882cbba',
      walletAddress: '0x1dbc1a3cc4be8543c1019894cf5585f7d8b69837',
      ensName: 'bob.eth',
      isActive: true,
    },
  })

  const charlie = await prisma.user.create({
    data: {
      id: 'a3c84d9b-4e7e-5cf2-c96d-e2850993dccb',
      walletAddress: '0x8ba1f109551bd432803012645ac136ddd64dba72',
      ensName: 'charlie.eth',
      isActive: true,
    },
  })

  console.log('✅ 创建了 3 个用户')

  // ============================================
  // 2. 创建智能账户
  // ============================================
  console.log('🤖 创建智能账户...')

  // Alice 的智能账户
  const aliceAccount1 = await prisma.smartAccount.create({
    data: {
      id: '51036444-6f3d-481c-bcea-56437fac2a01',
      userId: alice.id,
      accountAddress: '0xa1b2c3d4e5f6789012345678901234567890abcd',
      ownerAddress: alice.walletAddress,
      accountType: 'erc4337',
      chainId: 10143,
      isDeployed: true,
      deploymentTxHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    },
  })

  const aliceAccount2 = await prisma.smartAccount.create({
    data: {
      id: '62147555-7a4e-592d-cdfa-67548abd3b12',
      userId: alice.id,
      accountAddress: '0xb2c3d4e5f67890123456789012345678901bcdef',
      ownerAddress: alice.walletAddress,
      accountType: 'erc4337',
      chainId: 11155111,
      isDeployed: false,
    },
  })

  const aliceAccount3 = await prisma.smartAccount.create({
    data: {
      id: '73258666-8b5f-603e-defb-78659bce4c23',
      userId: alice.id,
      accountAddress: '0xc3d4e5f678901234567890123456789012cdefab',
      ownerAddress: alice.walletAddress,
      accountType: 'erc4337',
      chainId: 1,
      isDeployed: true,
      deploymentTxHash: '0x2345678901bcdef2345678901bcdef2345678901bcdef2345678901bcdef234',
    },
  })

  // Bob 的智能账户
  const bobAccount1 = await prisma.smartAccount.create({
    data: {
      id: '84369777-9c6a-714f-abcd-89760cdf5d34',
      userId: bob.id,
      accountAddress: '0xd4e5f6789012345678901234567890123defabcd',
      ownerAddress: bob.walletAddress,
      accountType: 'erc4337',
      chainId: 10143,
      isDeployed: true,
      deploymentTxHash: '0x3456789012cdef3456789012cdef3456789012cdef3456789012cdef3456789',
    },
  })

  const bobAccount2 = await prisma.smartAccount.create({
    data: {
      id: '95470888-0d7b-825a-abcd-90871dea6e45',
      userId: bob.id,
      accountAddress: '0xe5f67890123456789012345678901234efabcdef',
      ownerAddress: bob.walletAddress,
      accountType: 'erc4337',
      chainId: 97,
      isDeployed: false,
    },
  })

  // Charlie 的智能账户
  const charlieAccount1 = await prisma.smartAccount.create({
    data: {
      id: 'a6581999-1e8c-936b-abcd-01982efb7f56',
      userId: charlie.id,
      accountAddress: '0xf6789012345678901234567890123456fabcdef0',
      ownerAddress: charlie.walletAddress,
      accountType: 'erc4337',
      chainId: 11155111,
      isDeployed: true,
      deploymentTxHash: '0x4567890123def4567890123def4567890123def4567890123def4567890123de',
    },
  })

  console.log('✅ 创建了 7 个智能账户')

  // ============================================
  // 3. 创建事件订阅
  // ============================================
  console.log('🔔 创建事件订阅...')

  await prisma.eventSubscription.createMany({
    data: [
      // Alice 的订阅
      {
        id: 'b7692aaa-2f9d-047c-bcde-12093fac8a67',
        userId: alice.id,
        smartAccountId: aliceAccount1.id,
        chainId: 10143,
        contractAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        eventType: 'Transfer',
        filterConditions: { minAmount: '1000000000000000000' },
        notificationChannels: ['web', 'telegram'],
        isActive: true,
      },
      {
        id: 'c8703bbb-3a0e-158d-cdef-23104abd9b78',
        userId: alice.id,
        smartAccountId: aliceAccount1.id,
        chainId: 10143,
        contractAddress: '0x7a250d5630b4cf539739df2c5dacb4c659f2488d',
        eventType: 'Swap',
        filterConditions: { minAmount: '500000000000000000' },
        notificationChannels: ['web', 'discord'],
        isActive: true,
      },
      {
        id: 'd9814ccc-4b1f-269e-abcd-34215bce0c89',
        userId: alice.id,
        smartAccountId: aliceAccount2.id,
        chainId: 11155111,
        contractAddress: null,
        eventType: 'NFTReceived',
        filterConditions: {},
        notificationChannels: ['web'],
        isActive: false,
      },
      // Bob 的订阅
      {
        id: 'e0925ddd-5c2a-370f-abcd-45326cdf1d90',
        userId: bob.id,
        smartAccountId: bobAccount1.id,
        chainId: 10143,
        contractAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        eventType: 'Transfer',
        filterConditions: { minAmount: '10000000' },
        notificationChannels: ['web', 'telegram'],
        isActive: true,
      },
      {
        id: 'f1036eee-6d3b-481a-abcd-56437dea2e01',
        userId: bob.id,
        smartAccountId: bobAccount1.id,
        chainId: 10143,
        contractAddress: null,
        eventType: 'Stake',
        filterConditions: {},
        notificationChannels: ['web'],
        isActive: true,
      },
      // Charlie 的订阅
      {
        id: 'a1147fff-7e4c-592b-abcd-67548efb3f12',
        userId: charlie.id,
        smartAccountId: charlieAccount1.id,
        chainId: 11155111,
        contractAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        eventType: 'Transfer',
        filterConditions: { minAmount: '100000000' },
        notificationChannels: ['web', 'telegram', 'discord'],
        isActive: true,
      },
    ],
  })

  console.log('✅ 创建了 7 个事件订阅')

  // ============================================
  // 4. 创建自动化规则
  // ============================================
  console.log('⚙️  创建自动化规则...')

  await prisma.automationRule.createMany({
    data: [
      {
        id: '12258000-8a5d-603c-bcde-78659afc4a23',
        userId: alice.id,
        smartAccountId: aliceAccount1.id,
        name: 'Auto Swap WETH to USDC',
        description: 'Automatically swap WETH to USDC when balance > 1 ETH',
        triggerType: 'balance_threshold',
        triggerConditions: { token: 'WETH', threshold: '1000000000000000000', operator: 'gt' },
        actionType: 'swap',
        actionParams: { fromToken: 'WETH', toToken: 'USDC', amount: '500000000000000000' },
        isActive: true,
      },
      {
        id: '23369111-9b6e-714d-cdef-89760bad5b34',
        userId: alice.id,
        smartAccountId: aliceAccount1.id,
        name: 'Auto Transfer to Cold Wallet',
        description: 'Transfer funds to cold wallet when balance > 10 ETH',
        triggerType: 'balance_threshold',
        triggerConditions: { token: 'ETH', threshold: '10000000000000000000', operator: 'gt' },
        actionType: 'transfer',
        actionParams: { to: '0x0000000000000000000000000000000000000001', amount: '5000000000000000000' },
        isActive: false,
      },
      {
        id: '34470222-0c7f-825e-abcd-90871cbe6c45',
        userId: bob.id,
        smartAccountId: bobAccount1.id,
        name: 'Auto Stake USDC',
        description: 'Stake USDC when balance > 1000 USDC',
        triggerType: 'balance_threshold',
        triggerConditions: { token: 'USDC', threshold: '1000000000', operator: 'gt' },
        actionType: 'stake',
        actionParams: { protocol: 'Aave', token: 'USDC', amount: '500000000' },
        isActive: true,
      },
    ],
  })

  console.log('✅ 创建了 3 个自动化规则')

  // ============================================
  // 5. 创建通知
  // ============================================
  console.log('📬 创建通知...')

  const now = new Date()
  const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

  await prisma.notification.createMany({
    data: [
      // Alice 的通知
      {
        id: '45581333-1d8a-936f-abcd-01982dcf7d56',
        userId: alice.id,
        subscriptionId: 'b7692aaa-2f9d-047c-bcde-12093fac8a67',
        title: '💵 Large Transfer Detected',
        message: 'Received 5.5 ETH from 0x1234...5678',
        priority: 'high',
        channel: 'web',
        isRead: true,
        readAt: daysAgo(6),
        metadata: { amount: '5500000000000000000', from: '0x1234567890abcdef1234567890abcdef12345678', txHash: '0xabcd...ef01' },
        createdAt: daysAgo(7),
      },
      {
        id: '56692444-2e9b-047a-abcd-12093eda8e67',
        userId: alice.id,
        subscriptionId: 'c8703bbb-3a0e-158d-cdef-23104abd9b78',
        title: '🔄 Swap Executed',
        message: 'Swapped 2 ETH for 4,000 USDC',
        priority: 'medium',
        channel: 'web',
        isRead: true,
        readAt: daysAgo(5),
        metadata: { amountIn: '2000000000000000000', amountOut: '4000000000', txHash: '0xbcde...f012' },
        createdAt: daysAgo(6),
      },
      {
        id: '67703555-3f0c-158b-abcd-23104feb9f78',
        userId: alice.id,
        subscriptionId: 'b7692aaa-2f9d-047c-bcde-12093fac8a67',
        title: '💵 Transfer Received',
        message: 'Received 1.2 ETH from 0xabcd...ef01',
        priority: 'medium',
        channel: 'telegram',
        isRead: false,
        metadata: { amount: '1200000000000000000', from: '0xabcdef0123456789abcdef0123456789abcdef01', txHash: '0xcdef...0123' },
        createdAt: daysAgo(2),
      },
      {
        id: '78814666-4a1d-269c-abcd-34215afc0a89',
        userId: alice.id,
        subscriptionId: 'c8703bbb-3a0e-158d-cdef-23104abd9b78',
        title: '🔄 Swap Completed',
        message: 'Swapped 0.5 ETH for 1,000 USDC',
        priority: 'low',
        channel: 'discord',
        isRead: false,
        metadata: { amountIn: '500000000000000000', amountOut: '1000000000', txHash: '0xdef0...1234' },
        createdAt: daysAgo(1),
      },
      // Bob 的通知
      {
        id: '89925777-5b2e-370d-abcd-45326bfd1b90',
        userId: bob.id,
        subscriptionId: 'e0925ddd-5c2a-370f-abcd-45326cdf1d90',
        title: '💵 USDC Transfer',
        message: 'Received 5,000 USDC from 0x9876...5432',
        priority: 'high',
        channel: 'web',
        isRead: true,
        readAt: daysAgo(4),
        metadata: { amount: '5000000000', from: '0x9876543210fedcba9876543210fedcba98765432', txHash: '0xef01...2345' },
        createdAt: daysAgo(5),
      },
      {
        id: '90036888-6c3f-481e-abcd-56437cae2c01',
        userId: bob.id,
        subscriptionId: 'f1036eee-6d3b-481a-abcd-56437dea2e01',
        title: '📊 Staking Reward',
        message: 'Earned 50 USDC from staking',
        priority: 'medium',
        channel: 'web',
        isRead: false,
        metadata: { amount: '50000000', protocol: 'Aave', txHash: '0xf012...3456' },
        createdAt: daysAgo(3),
      },
      // Charlie 的通知
      {
        id: 'b1147999-7d4a-592f-abcd-67548dbf3d12',
        userId: charlie.id,
        subscriptionId: 'a1147fff-7e4c-592b-abcd-67548efb3f12',
        title: '💵 USDT Transfer',
        message: 'Received 10,000 USDT from 0x5555...6666',
        priority: 'high',
        channel: 'telegram',
        isRead: false,
        metadata: { amount: '10000000000', from: '0x5555666677778888999900001111222233334444', txHash: '0x0123...4567' },
        createdAt: daysAgo(1),
      },
    ],
  })

  console.log('✅ 创建了 9 条通知')

  // ============================================
  // 6. 创建集成配置
  // ============================================
  console.log('🔗 创建集成配置...')

  await prisma.telegramConfig.createMany({
    data: [
      {
        id: '12258aaa-8e5a-603d-bcde-78659efc4e23',
        userId: alice.id,
        chatId: '123456789',
        username: '@alice_crypto',
        isActive: true,
      },
      {
        id: '23369bbb-9f6b-714e-cdef-89760fad5f34',
        userId: bob.id,
        chatId: '987654321',
        username: '@bob_defi',
        isActive: true,
      },
    ],
  })

  await prisma.discordConfig.createMany({
    data: [
      {
        id: '34470ccc-0a7c-825f-abcd-90871abe6a45',
        userId: alice.id,
        webhookUrl: 'https://discord.com/api/webhooks/1234567890/abcdefghijklmnopqrstuvwxyz',
        isActive: true,
      },
      {
        id: '45581ddd-1b8d-936a-abcd-01982bcf7b56',
        userId: charlie.id,
        webhookUrl: 'https://discord.com/api/webhooks/0987654321/zyxwvutsrqponmlkjihgfedcba',
        isActive: true,
      },
    ],
  })

  console.log('✅ 创建了 2 个 Telegram 配置')
  console.log('✅ 创建了 2 个 Discord 配置')

  // ============================================
  // 统计
  // ============================================
  console.log('\n📊 数据插入完成！')
  console.log('========================================')
  console.log(`👥 用户: ${await prisma.user.count()}`)
  console.log(`🤖 智能账户: ${await prisma.smartAccount.count()}`)
  console.log(`🔔 事件订阅: ${await prisma.eventSubscription.count()}`)
  console.log(`⚙️  自动化规则: ${await prisma.automationRule.count()}`)
  console.log(`📬 通知: ${await prisma.notification.count()}`)
  console.log(`📱 Telegram 配置: ${await prisma.telegramConfig.count()}`)
  console.log(`💬 Discord 配置: ${await prisma.discordConfig.count()}`)
  console.log('========================================')
  console.log('✅ 所有模拟数据已成功插入！')
}

main()
  .catch((e) => {
    console.error('❌ 插入数据时出错:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

