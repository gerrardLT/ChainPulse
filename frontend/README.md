# ChainPulse Frontend Application

> 实时链上事件通知与可视化系统 - 前端应用

## ⚠️ 重要说明

**UI 设计已完成，请勿修改！**

本项目的 UI 设计和组件已经完整实现，包括：
- ✅ 页面布局和导航
- ✅ 组件样式和交互
- ✅ 主题系统和动画效果
- ✅ 响应式设计

**后续开发要求**：
- ✅ **保持现有 UI 设计不变**
- ✅ **仅进行功能集成**（WebSocket, GraphQL, API）
- ✅ **复用已有组件**
- ✅ **添加数据绑定和业务逻辑**

## 📋 项目概述

ChainPulse 前端是一个基于 Next.js 15 的现代化 Web3 应用，提供实时区块链事件监控、智能账户管理和数据可视化功能。

**当前状态**: UI 设计和基础功能已完成，等待后端服务集成。

## 🎯 核心功能

### ✅ 已实现功能

1. **仪表板 (Dashboard)**
   - ✅ 实时统计数据展示 (活跃钱包、交易总数、智能账户执行、Gas 费节省)
   - ✅ 事件时间轴图表
   - ✅ 事件类型分布图
   - ✅ 网络活动图表
   - ✅ 活跃钱包趋势图

2. **事件监控 (Events)**
   - ✅ 事件列表展示
   - ✅ 事件过滤和搜索
   - ✅ 事件详情查看

3. **钱包连接 (Wallet)**
   - ✅ RainbowKit 集成
   - ✅ 多钱包支持 (MetaMask, WalletConnect, etc.)
   - ✅ 连接状态管理

4. **智能账户 (Smart Accounts)**
   - ✅ 智能账户卡片展示
   - ✅ 账户信息查看

5. **通知系统 (Notifications)**
   - ✅ 通知中心
   - ✅ 通知设置面板
   - ✅ Toast 通知

6. **用户体验 (UX)**
   - ✅ 国际化支持 (中英文切换)
   - ✅ 主题切换 (明暗模式)
   - ✅ 响应式设计
   - ✅ 动画效果 (渐入、缩放、霓虹光效)
   - ✅ 玻璃态 UI 设计

### 🚧 待实现功能

- [ ] WebSocket 实时通知
- [ ] GraphQL 数据查询集成
- [ ] 用户认证和授权
- [ ] 自动化规则配置
- [ ] 第三方集成 (Telegram, Discord)
- [ ] 历史数据查询和导出

## 🛠 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **核心框架** |
| Next.js | 15.2.4 | React 框架，支持 App Router |
| React | 19.x | UI 库 |
| TypeScript | 5.x | 类型安全 |
| **样式** |
| Tailwind CSS | 4.1.9 | 样式框架 |
| Tailwindcss Animate | 1.0.7 | 动画工具 |
| CSS Variables | - | 主题和玻璃态效果 |
| **UI 组件** |
| Radix UI | Latest | 无障碍 UI 组件基础 |
| Shadcn/UI | - | UI 组件集合 (50+ 组件) |
| Lucide React | 0.454.0 | 图标库 |
| **表单和验证** |
| React Hook Form | 7.60.0 | 表单管理 |
| Zod | 3.25.76 | 数据验证 |
| @hookform/resolvers | 3.10.0 | 表单验证集成 |
| **数据可视化** |
| Recharts | Latest | 图表库 |
| **Web3** |
| Wagmi | Latest | 以太坊 React Hooks |
| Viem | Latest | 以太坊工具库 |
| RainbowKit | Latest | 钱包连接 UI |
| @tanstack/react-query | Latest | 数据请求管理 |
| **主题和国际化** |
| next-themes | Latest | 主题管理 |
| 自定义 i18n | - | 国际化实现 |
| **其他** |
| Sonner | Latest | Toast 通知 |
| class-variance-authority | 0.7.1 | 样式变体管理 |
| clsx / tailwind-merge | - | 类名合并工具 |

## 📁 项目结构

```
frontend/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # 首页 (Dashboard)
│   ├── layout.tsx                # 根布局
│   ├── globals.css               # 全局样式
│   ├── events/                   # 事件监控页面
│   │   └── page.tsx
│   └── settings/                 # 设置页面
│       └── page.tsx
│
├── components/                   # React 组件
│   ├── ui/                       # Shadcn/UI 基础组件 (50+)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── tabs.tsx
│   │   ├── table.tsx
│   │   ├── toast.tsx
│   │   ├── skeleton.tsx
│   │   ├── badge.tsx
│   │   ├── avatar.tsx
│   │   ├── switch.tsx
│   │   ├── select.tsx
│   │   ├── checkbox.tsx
│   │   ├── radio-group.tsx
│   │   ├── slider.tsx
│   │   ├── progress.tsx
│   │   ├── sheet.tsx
│   │   ├── sidebar.tsx
│   │   ├── calendar.tsx
│   │   ├── popover.tsx
│   │   ├── tooltip.tsx
│   │   ├── accordion.tsx
│   │   ├── alert.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── command.tsx
│   │   ├── context-menu.tsx
│   │   ├── hover-card.tsx
│   │   ├── menubar.tsx
│   │   ├── navigation-menu.tsx
│   │   ├── pagination.tsx
│   │   ├── scroll-area.tsx
│   │   ├── separator.tsx
│   │   ├── form.tsx
│   │   ├── label.tsx
│   │   ├── textarea.tsx
│   │   ├── toggle.tsx
│   │   ├── toggle-group.tsx
│   │   ├── chart.tsx
│   │   ├── carousel.tsx
│   │   ├── collapsible.tsx
│   │   ├── drawer.tsx
│   │   ├── empty.tsx
│   │   ├── field.tsx
│   │   ├── input-group.tsx
│   │   ├── input-otp.tsx
│   │   ├── item.tsx
│   │   ├── kbd.tsx
│   │   ├── resizable.tsx
│   │   ├── spinner.tsx
│   │   └── ... (更多组件)
│   │
│   ├── charts/                   # 图表组件
│   │   ├── event-timeline-chart.tsx        # 事件时间轴图
│   │   ├── event-distribution-chart.tsx    # 事件分布饼图
│   │   ├── network-activity-chart.tsx      # 网络活动图
│   │   └── active-wallets-chart.tsx        # 活跃钱包趋势图
│   │
│   ├── header.tsx                # 顶部导航栏
│   ├── connect-button.tsx        # 钱包连接按钮
│   ├── theme-toggle.tsx          # 主题切换按钮
│   ├── theme-provider.tsx        # 主题提供器
│   ├── language-switcher.tsx     # 语言切换器
│   ├── notification-center.tsx   # 通知中心
│   ├── notification-settings.tsx # 通知设置
│   ├── smart-account-card.tsx    # 智能账户卡片
│   └── background-effects.tsx    # 背景动效
│
├── hooks/                        # 自定义 Hooks
│   ├── use-mobile.ts             # 移动端检测
│   ├── use-toast.ts              # Toast 通知
│   ├── use-notifications.ts      # 通知管理
│   └── use-smart-account.ts      # 智能账户管理
│
├── lib/                          # 工具函数和配置
│   ├── utils.ts                  # 通用工具函数
│   ├── i18n/                     # 国际化
│   │   ├── language-context.tsx  # 语言上下文
│   │   └── translations.ts       # 翻译文件
│   └── storage/                  # 本地存储
│       └── settings.ts           # 设置存储
│
├── public/                       # 静态资源
│   ├── images/                   # 图片资源
│   │   ├── data-flow.jpg
│   │   ├── grid-pattern.jpg
│   │   ├── neon-background.jpg
│   │   └── network-nodes.jpg
│   ├── placeholder-logo.svg
│   └── placeholder-user.jpg
│
├── styles/                       # 样式文件
│   └── globals.css               # 全局样式 (CSS 变量、动画)
│
├── components.json               # Shadcn/UI 配置
├── next.config.mjs               # Next.js 配置
├── tailwind.config.ts            # Tailwind 配置
├── tsconfig.json                 # TypeScript 配置
├── postcss.config.mjs            # PostCSS 配置
├── package.json                  # 依赖管理
└── README.md                     # 本文档
```

## 🎨 设计系统

### 主题变量

项目使用 CSS 变量实现主题系统，支持明暗模式：

```css
/* 明亮模式 */
--background: 0 0% 100%;
--foreground: 240 10% 3.9%;
--primary: 262 83% 58%;    /* 霓虹紫 */
--secondary: 197 100% 59%; /* 霓虹青 */
--accent: 280 89% 60%;     /* 霓虹粉 */

/* 暗黑模式 */
--background: 240 10% 3.9%;
--foreground: 0 0% 98%;
--primary: 262 83% 58%;
--secondary: 197 100% 59%;
--accent: 280 89% 60%;
```

### 特效样式

- **玻璃态效果**: `glass-card` class
- **霓虹光效**: `neon-glow`, `neon-glow-purple` classes
- **动画**: 渐入、缩放、悬停效果

## 🚀 快速开始

### 前置要求

- Node.js 20.x 或更高
- pnpm (推荐) 或 npm

### 安装依赖

```bash
cd frontend
pnpm install
```

### 开发环境

```bash
pnpm dev
```

访问 [http://localhost:3001](http://localhost:3001)

### 生产构建

```bash
pnpm build
pnpm start
```

### 代码检查

```bash
pnpm lint
```

## 📝 开发规范

### 组件规范

1. **文件命名**: kebab-case (例如: `event-timeline-chart.tsx`)
2. **组件命名**: PascalCase (例如: `EventTimelineChart`)
3. **使用 'use client'**: 仅在需要客户端特性时使用
4. **TypeScript**: 所有组件必须定义 Props interface

```typescript
'use client' // 仅在需要时

import { ComponentProps } from '@/types'

interface EventTimelineChartProps {
  data: EventData[]
  timeRange: string
}

export function EventTimelineChart({ data, timeRange }: EventTimelineChartProps) {
  // 实现
}
```

### 样式规范

1. **优先使用 Tailwind CSS**: 避免自定义 CSS
2. **响应式设计**: 移动优先 (`md:`, `lg:`)
3. **使用 cn() 函数**: 合并类名

```typescript
import { cn } from '@/lib/utils'

<div className={cn("base-class", isActive && "active-class")} />
```

### 状态管理

1. **本地状态**: 使用 `useState`
2. **全局状态**: 使用 Context API 或 Zustand (待集成)
3. **服务器状态**: 使用 SWR 或 React Query

## 🎯 页面路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | Dashboard | 仪表板 - 数据概览和图表 |
| `/events` | Events | 事件列表和详情 |
| `/settings` | Settings | 用户设置和配置 |
| `/smart-accounts` | Smart Accounts | 智能账户管理 (待实现) |
| `/notifications` | Notifications | 通知中心 (待实现) |

## 🔌 集成计划

### 待集成功能

1. **WebSocket**
   - Socket.IO Client 集成
   - 实时事件监听
   - 自动重连机制

2. **GraphQL**
   - Apollo Client 配置
   - 查询和 Subscription
   - 缓存管理

3. **Web3**
   - 完整的钱包连接流程
   - 签名验证
   - 智能账户交互

4. **状态管理**
   - Zustand 全局状态
   - 用户数据管理
   - 通知状态管理

## 🧪 测试

```bash
# 单元测试 (待配置)
pnpm test

# E2E 测试 (待配置)
pnpm test:e2e
```

## 📊 性能优化

- ✅ Next.js Image 优化
- ✅ 代码分割 (动态导入)
- ✅ CSS 优化 (Tailwind CSS Purge)
- ⬜ React Query 缓存
- ⬜ 懒加载图表组件
- ⬜ Service Worker (PWA)

## 🔒 安全考虑

- ✅ TypeScript 类型安全
- ✅ XSS 防护 (React 自动转义)
- ✅ HTTPS (生产环境)
- ⬜ CSP Headers
- ⬜ Input 验证 (Zod)

## 📚 参考文档

- [Next.js Documentation](https://nextjs.org/docs)
- [Shadcn/UI Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [RainbowKit](https://www.rainbowkit.com/)
- [Recharts](https://recharts.org/)

## 🤝 开发团队

- **前端负责人**: _待分配_
- **UI/UX 设计**: _待分配_
- **技术栈**: Next.js 15, React 19, TypeScript 5

## 📄 许可证

MIT

---

**最后更新**: 2025-10-11  
**版本**: v1.0.0  
**状态**: ✅ 基础功能完成，待集成后端服务

