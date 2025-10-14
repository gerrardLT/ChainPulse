import {
  SmartAccount,
  Transaction,
  OwnershipTransfer,
  DailyAccountStats,
  DailyTransactionStats,
  GlobalStats,
} from "generated";

/**
 * 处理 AccountCreated 事件
 * 当工厂合约创建新账户时触发
 */
export async function handleAccountCreated(
  event: any,
  context: any
): Promise<void> {
  const { account, owner, salt } = event.params;
  const { chainId, blockNumber, blockTimestamp, transactionHash } = event;

  // 创建 SmartAccount 实体
  const smartAccountId = `${chainId}-${account}`;
  
  const smartAccount: SmartAccount = {
    id: smartAccountId,
    accountAddress: account.toLowerCase(),
    owner: owner.toLowerCase(),
    chainId: chainId,
    factory: event.srcAddress.toLowerCase(),
    salt: salt,
    isDeployed: true,
    deploymentTxHash: transactionHash,
    deploymentTimestamp: blockTimestamp,
    currentOwner: owner.toLowerCase(),
    createdAt: blockTimestamp,
    updatedAt: blockTimestamp,
    createdAtBlock: blockNumber,
    updatedAtBlock: blockNumber,
  };

  await context.SmartAccount.set(smartAccount);

  // 更新每日统计
  await updateDailyAccountStats(chainId, blockTimestamp, context);

  // 更新全局统计
  await updateGlobalStats(chainId, blockTimestamp, "accountCreated", context);

  console.log(`[Envio] AccountCreated: ${account} on chain ${chainId}`);
}

/**
 * 处理 AccountInitialized 事件
 * 当账户初始化时触发
 */
export async function handleAccountInitialized(
  event: any,
  context: any
): Promise<void> {
  const { owner } = event.params;
  const { chainId, blockNumber, blockTimestamp } = event;

  const accountAddress = event.srcAddress.toLowerCase();
  const smartAccountId = `${chainId}-${accountAddress}`;

  // 获取或创建账户
  let smartAccount = await context.SmartAccount.get(smartAccountId);

  if (!smartAccount) {
    // 如果账户不存在，创建一个新的（可能是直接部署的账户）
    smartAccount = {
      id: smartAccountId,
      accountAddress: accountAddress,
      owner: owner.toLowerCase(),
      chainId: chainId,
      factory: "0x0000000000000000000000000000000000000000", // 未知工厂
      salt: BigInt(0),
      isDeployed: true,
      deploymentTxHash: event.transactionHash,
      deploymentTimestamp: blockTimestamp,
      currentOwner: owner.toLowerCase(),
      createdAt: blockTimestamp,
      updatedAt: blockTimestamp,
      createdAtBlock: blockNumber,
      updatedAtBlock: blockNumber,
    };
  } else {
    // 更新已存在的账户
    smartAccount.updatedAt = blockTimestamp;
    smartAccount.updatedAtBlock = blockNumber;
  }

  await context.SmartAccount.set(smartAccount);

  console.log(`[Envio] AccountInitialized: ${accountAddress} on chain ${chainId}`);
}

/**
 * 处理 AccountExecuted 事件
 * 当账户执行交易时触发
 */
export async function handleAccountExecuted(
  event: any,
  context: any
): Promise<void> {
  const { target, value, data } = event.params;
  const { chainId, blockNumber, blockTimestamp, transactionHash } = event;

  const accountAddress = event.srcAddress.toLowerCase();
  const smartAccountId = `${chainId}-${accountAddress}`;

  // 创建交易记录
  const transactionId = `${chainId}-${transactionHash}-${event.logIndex}`;

  const transaction: Transaction = {
    id: transactionId,
    smartAccount: smartAccountId,
    target: target.toLowerCase(),
    value: value,
    data: data,
    transactionHash: transactionHash,
    blockNumber: blockNumber,
    timestamp: blockTimestamp,
    gasUsed: BigInt(0), // 需要从 receipt 获取
    success: true,
    chainId: chainId,
  };

  await context.Transaction.set(transaction);

  // 更新账户的最后更新时间
  const smartAccount = await context.SmartAccount.get(smartAccountId);
  if (smartAccount) {
    smartAccount.updatedAt = blockTimestamp;
    smartAccount.updatedAtBlock = blockNumber;
    await context.SmartAccount.set(smartAccount);
  }

  // 更新每日交易统计
  await updateDailyTransactionStats(
    chainId,
    blockTimestamp,
    value,
    BigInt(0),
    true,
    context
  );

  // 更新全局统计
  await updateGlobalStats(chainId, blockTimestamp, "transactionExecuted", context);

  console.log(`[Envio] AccountExecuted: ${accountAddress} -> ${target} on chain ${chainId}`);
}

/**
 * 处理 OwnershipTransferred 事件
 * 当账户所有权转移时触发
 */
export async function handleOwnershipTransferred(
  event: any,
  context: any
): Promise<void> {
  const { previousOwner, newOwner } = event.params;
  const { chainId, blockNumber, blockTimestamp, transactionHash } = event;

  const accountAddress = event.srcAddress.toLowerCase();
  const smartAccountId = `${chainId}-${accountAddress}`;

  // 创建所有权转移记录
  const transferId = `${chainId}-${transactionHash}-${event.logIndex}`;

  const ownershipTransfer: OwnershipTransfer = {
    id: transferId,
    smartAccount: smartAccountId,
    previousOwner: previousOwner.toLowerCase(),
    newOwner: newOwner.toLowerCase(),
    transactionHash: transactionHash,
    blockNumber: blockNumber,
    timestamp: blockTimestamp,
    chainId: chainId,
  };

  await context.OwnershipTransfer.set(ownershipTransfer);

  // 更新账户的当前所有者
  const smartAccount = await context.SmartAccount.get(smartAccountId);
  if (smartAccount) {
    smartAccount.currentOwner = newOwner.toLowerCase();
    smartAccount.updatedAt = blockTimestamp;
    smartAccount.updatedAtBlock = blockNumber;
    await context.SmartAccount.set(smartAccount);
  }

  console.log(
    `[Envio] OwnershipTransferred: ${accountAddress} from ${previousOwner} to ${newOwner} on chain ${chainId}`
  );
}

/**
 * 更新每日账户统计
 */
async function updateDailyAccountStats(
  chainId: number,
  timestamp: bigint,
  context: any
): Promise<void> {
  const date = getDateString(timestamp);
  const statsId = `${chainId}-${date}`;

  let stats = await context.DailyAccountStats.get(statsId);

  if (!stats) {
    stats = {
      id: statsId,
      chainId: chainId,
      date: date,
      accountsCreated: 1,
      totalAccounts: 1,
    };
  } else {
    stats.accountsCreated += 1;
    stats.totalAccounts += 1;
  }

  await context.DailyAccountStats.set(stats);
}

/**
 * 更新每日交易统计
 */
async function updateDailyTransactionStats(
  chainId: number,
  timestamp: bigint,
  value: bigint,
  gasUsed: bigint,
  success: boolean,
  context: any
): Promise<void> {
  const date = getDateString(timestamp);
  const statsId = `${chainId}-${date}`;

  let stats = await context.DailyTransactionStats.get(statsId);

  if (!stats) {
    stats = {
      id: statsId,
      chainId: chainId,
      date: date,
      transactionCount: 1,
      totalValue: value,
      totalGasUsed: gasUsed,
      successfulTransactions: success ? 1 : 0,
      failedTransactions: success ? 0 : 1,
    };
  } else {
    stats.transactionCount += 1;
    stats.totalValue += value;
    stats.totalGasUsed += gasUsed;
    if (success) {
      stats.successfulTransactions += 1;
    } else {
      stats.failedTransactions += 1;
    }
  }

  await context.DailyTransactionStats.set(stats);
}

/**
 * 更新全局统计
 */
async function updateGlobalStats(
  chainId: number,
  timestamp: bigint,
  eventType: "accountCreated" | "transactionExecuted",
  context: any
): Promise<void> {
  const statsId = `global-${chainId}`;

  let stats = await context.GlobalStats.get(statsId);

  if (!stats) {
    stats = {
      id: statsId,
      chainId: chainId,
      totalAccounts: eventType === "accountCreated" ? 1 : 0,
      totalTransactions: eventType === "transactionExecuted" ? 1 : 0,
      totalValue: BigInt(0),
      lastUpdated: timestamp,
    };
  } else {
    if (eventType === "accountCreated") {
      stats.totalAccounts += 1;
    } else if (eventType === "transactionExecuted") {
      stats.totalTransactions += 1;
    }
    stats.lastUpdated = timestamp;
  }

  await context.GlobalStats.set(stats);
}

/**
 * 将时间戳转换为日期字符串 (YYYY-MM-DD)
 */
function getDateString(timestamp: bigint): string {
  const date = new Date(Number(timestamp) * 1000);
  return date.toISOString().split("T")[0];
}

