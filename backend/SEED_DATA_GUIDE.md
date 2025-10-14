# 📊 **数据库模拟数据插入指南**

## 🎯 **两种方式对比**

| 方式 | 命令 | 优点 | 缺点 | 推荐场景 |
|------|------|------|------|----------|
| **Prisma Seed** | `npm run db:seed` | ✅ 类型安全<br>✅ 易维护<br>✅ 可复用<br>✅ 自动关系处理 | ⚠️ 需要 Node.js | ⭐⭐⭐⭐⭐ 开发环境 |
| **直接 SQL** | `psql -f database/seed-mock-data.sql` | ✅ 快速<br>✅ 直接 | ⚠️ 手动管理关系<br>⚠️ 无类型检查 | ⭐⭐⭐⭐ 快速测试 |

---

## 🚀 **方式 1: Prisma Seed（推荐）**

### **快速开始**

```bash
# 进入 backend 目录
cd backend

# 执行 seed 脚本
npm run db:seed

# 或者使用 Prisma 命令
npm run prisma:seed

# 或者使用 Prisma 自带的 seed
npx prisma db seed
```

### **执行流程**

1. ✅ 清空现有数据（按依赖顺序）
2. ✅ 创建 3 个用户
3. ✅ 创建 7 个智能账户
4. ✅ 创建 7 个事件订阅
5. ✅ 创建 3 个自动化规则
6. ✅ 创建 9 条通知
7. ✅ 创建 2 个 Telegram 配置
8. ✅ 创建 2 个 Discord 配置
9. ✅ 显示统计信息

### **预期输出**

```
🌱 开始插入模拟数据...
🗑️  清空现有数据...
👥 创建用户...
✅ 创建了 3 个用户
🤖 创建智能账户...
✅ 创建了 7 个智能账户
🔔 创建事件订阅...
✅ 创建了 7 个事件订阅
⚙️  创建自动化规则...
✅ 创建了 3 个自动化规则
📬 创建通知...
✅ 创建了 9 条通知
🔗 创建集成配置...
✅ 创建了 2 个 Telegram 配置
✅ 创建了 2 个 Discord 配置

📊 数据插入完成！
========================================
👥 用户: 3
🤖 智能账户: 7
🔔 事件订阅: 7
⚙️  自动化规则: 3
📬 通知: 9
📱 Telegram 配置: 2
💬 Discord 配置: 2
========================================
✅ 所有模拟数据已成功插入！
```

### **优点**

- ✅ **类型安全**: TypeScript + Prisma 确保数据类型正确
- ✅ **自动关系处理**: Prisma 自动处理外键关系
- ✅ **易于维护**: 代码结构清晰，易于修改
- ✅ **可复用**: 可以在测试中复用
- ✅ **错误提示**: 详细的错误信息

### **适用场景**

- 🎯 开发环境日常使用
- 🎯 自动化测试前的数据准备
- 🎯 需要频繁修改数据结构
- 🎯 需要条件性插入数据

---

## 📝 **方式 2: 直接 SQL**

### **快速开始**

```bash
# 方法 1: 使用 psql（推荐）
psql $DATABASE_URL -f database/seed-mock-data.sql

# 方法 2: 使用 Docker
docker exec -i chainpulse-db psql -U postgres -d chainpulse < database/seed-mock-data.sql

# 方法 3: 使用 Supabase SQL Editor
# 复制 database/seed-mock-data.sql 的内容到 SQL Editor 执行
```

### **优点**

- ✅ **快速**: 一次性批量插入
- ✅ **直接**: 不需要 Node.js 环境
- ✅ **简单**: 只需要 SQL 客户端

### **适用场景**

- 🎯 快速测试
- 🎯 生产环境初始化（谨慎使用）
- 🎯 不想启动 Node.js 环境
- 🎯 需要精确控制 SQL

---

## 📊 **插入的数据详情**

### **用户数据 (3 个)**

| 用户 | 钱包地址 | ENS | 智能账户 | 订阅 | 规则 | 通知 |
|------|---------|-----|---------|------|------|------|
| **Alice** | `0x742d...beb2` | alice.eth | 3 | 3 | 2 | 4 |
| **Bob** | `0x1dbc...9837` | bob.eth | 2 | 2 | 1 | 2 |
| **Charlie** | `0x8ba1...ba72` | charlie.eth | 1 | 1 | 0 | 1 |

### **智能账户 (7 个)**

| 用户 | 链 | 地址 | 状态 |
|------|-----|------|------|
| Alice | Monad Testnet (10143) | `0xa1b2...abcd` | ✅ 已部署 |
| Alice | Sepolia (11155111) | `0xb2c3...cdef` | ⏳ 未部署 |
| Alice | Ethereum (1) | `0xc3d4...efab` | ✅ 已部署 |
| Bob | Monad Testnet (10143) | `0xd4e5...abcd` | ✅ 已部署 |
| Bob | BSC Testnet (97) | `0xe5f6...cdef` | ⏳ 未部署 |
| Charlie | Sepolia (11155111) | `0xf678...def0` | ✅ 已部署 |

### **事件订阅 (7 个)**

| 用户 | 类型 | 合约 | 链 | 渠道 | 状态 |
|------|------|------|-----|------|------|
| Alice | Transfer | WETH | Monad | Web, Telegram | ✅ 活跃 |
| Alice | Swap | Uniswap | Monad | Web, Discord | ✅ 活跃 |
| Alice | NFTReceived | - | Sepolia | Web | ❌ 非活跃 |
| Bob | Transfer | USDC | Monad | Web, Telegram | ✅ 活跃 |
| Bob | Stake | - | Monad | Web | ✅ 活跃 |
| Charlie | Transfer | USDT | Sepolia | Web, Telegram, Discord | ✅ 活跃 |

### **自动化规则 (3 个)**

| 用户 | 规则名称 | 触发条件 | 动作 | 状态 |
|------|---------|---------|------|------|
| Alice | Auto Swap WETH to USDC | WETH > 1 ETH | Swap 0.5 ETH | ✅ 活跃 |
| Alice | Auto Transfer to Cold Wallet | ETH > 10 ETH | Transfer 5 ETH | ❌ 非活跃 |
| Bob | Auto Stake USDC | USDC > 1000 | Stake 500 USDC | ✅ 活跃 |

### **通知 (9 条)**

| 用户 | 标题 | 优先级 | 渠道 | 状态 |
|------|------|--------|------|------|
| Alice | 💵 Large Transfer Detected | High | Web | ✅ 已读 |
| Alice | 🔄 Swap Executed | Medium | Web | ✅ 已读 |
| Alice | 💵 Transfer Received | Medium | Telegram | ⏳ 未读 |
| Alice | 🔄 Swap Completed | Low | Discord | ⏳ 未读 |
| Bob | 💵 USDC Transfer | High | Web | ✅ 已读 |
| Bob | 📊 Staking Reward | Medium | Web | ⏳ 未读 |
| Charlie | 💵 USDT Transfer | High | Telegram | ⏳ 未读 |

---

## 🧪 **测试场景**

### **场景 1: 用户登录**
```bash
# 使用 Alice 的钱包地址登录
钱包地址: 0x742d35cc6634c0532925a3b844bc9e7595f0beb2

预期结果:
- ✅ 能看到 3 个智能账户
- ✅ 能看到 3 个订阅
- ✅ 能看到 4 条通知（2 条未读）
```

### **场景 2: 智能账户管理**
```bash
# 查看 Alice 的智能账户
- ✅ Monad Testnet: 已部署
- ⏳ Sepolia: 未部署（可测试部署功能）
- ✅ Ethereum: 已部署
```

### **场景 3: 订阅管理**
```bash
# 查看 Bob 的订阅
- ✅ USDC Transfer: 活跃
- ✅ Stake: 活跃
- 可测试: 暂停、恢复、删除订阅
```

### **场景 4: 通知系统**
```bash
# 查看 Alice 的通知
- 总计: 4 条
- 未读: 2 条
- 可测试: 标记已读、筛选、搜索
```

---

## 🔍 **数据验证**

### **验证所有数据**
```sql
SELECT 
    'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Smart Accounts', COUNT(*) FROM smart_accounts
UNION ALL
SELECT 'Event Subscriptions', COUNT(*) FROM event_subscriptions
UNION ALL
SELECT 'Automation Rules', COUNT(*) FROM automation_rules
UNION ALL
SELECT 'Notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'Telegram Configs', COUNT(*) FROM telegram_configs
UNION ALL
SELECT 'Discord Configs', COUNT(*) FROM discord_configs;
```

### **验证特定用户数据**
```sql
-- 查看 Alice 的所有数据
SELECT 
    u.wallet_address,
    u.ens_name,
    COUNT(DISTINCT sa.id) as smart_accounts,
    COUNT(DISTINCT es.id) as subscriptions,
    COUNT(DISTINCT ar.id) as rules,
    COUNT(DISTINCT n.id) as notifications
FROM users u
LEFT JOIN smart_accounts sa ON u.id = sa.user_id
LEFT JOIN event_subscriptions es ON u.id = es.user_id
LEFT JOIN automation_rules ar ON u.id = ar.user_id
LEFT JOIN notifications n ON u.id = n.user_id
WHERE u.wallet_address = '0x742d35cc6634c0532925a3b844bc9e7595f0beb2'
GROUP BY u.id, u.wallet_address, u.ens_name;
```

### **使用 Prisma Studio 查看**
```bash
cd backend
npm run prisma:studio
```

---

## 🔄 **重置数据**

### **使用 Prisma Seed**
```bash
# 重新执行 seed 脚本（会自动清空并重新插入）
npm run db:seed
```

### **使用 SQL**
```bash
# 重新执行 SQL 脚本
psql $DATABASE_URL -f database/seed-mock-data.sql
```

---

## ⚠️ **注意事项**

### **安全警告**
- ❌ **不要在生产环境使用**
- ❌ **不要提交包含真实用户数据的文件**
- ✅ 仅用于开发和测试环境

### **数据约束**
- ✅ 所有外键关系正确
- ✅ UUID 格式正确
- ✅ 钱包地址格式正确（42 字符，0x 开头）
- ✅ 时间戳使用相对时间
- ✅ 枚举值符合数据库约束

### **常见问题**

**Q: 执行 Prisma Seed 时报错 "Cannot find module"**
```bash
# 确保安装了依赖
npm install

# 确保生成了 Prisma Client
npm run prisma:generate
```

**Q: 执行 SQL 时报错 "relation does not exist"**
```bash
# 先确保数据库 schema 已创建
cd backend
npx prisma db push
# 然后再执行 seed
```

**Q: 如何修改模拟数据？**
```typescript
// 编辑 backend/prisma/seed.ts
// 修改相应的数据
// 重新执行 npm run db:seed
```

**Q: 如何只插入特定用户的数据？**
```typescript
// 在 seed.ts 中注释掉不需要的用户创建代码
// 或者添加条件判断
if (process.env.SEED_USER === 'alice') {
  // 只创建 Alice 的数据
}
```

---

## 📚 **相关文档**

- [数据库设计文档](../docs/数据库设计.md)
- [API 设计文档](../docs/API设计.md)
- [Prisma Schema](./prisma/schema.prisma)
- [SQL 脚本](../database/seed-mock-data.sql)

---

## 🎯 **推荐工作流**

### **开发环境**
```bash
# 1. 初始化数据库
cd backend
npx prisma db push

# 2. 插入模拟数据
npm run db:seed

# 3. 启动开发服务器
npm run dev

# 4. 查看数据（可选）
npm run prisma:studio
```

### **测试环境**
```bash
# 1. 重置数据库
npx prisma migrate reset --force

# 2. 插入模拟数据
npm run db:seed

# 3. 运行测试
npm test
```

---

**最后更新**: 2025-01-14  
**版本**: v1.0
