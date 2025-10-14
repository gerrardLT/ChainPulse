export const translations = {
  en: {
    common: {
      appName: "ChainPulse",
      tagline: "Real-time Monitoring",
      connectWallet: "Connect Wallet",
    },
    nav: {
      dashboard: "Dashboard",
      events: "Events",
      settings: "Settings",
    },
    dashboard: {
      title: "Real-time Blockchain Monitoring",
      subtitle: "Track smart contract events and on-chain activities in real-time",
      stats: {
        totalEvents: "Total Events",
        activeWallets: "Active Wallets",
        smartAccounts: "Smart Accounts",
        gasSaved: "Gas Saved",
      },
      charts: {
        eventTimeline: "Event Timeline",
        activeWallets: "Active Wallets (24h)",
        eventDistribution: "Event Distribution",
        networkActivity: "Network Activity",
      },
    },
    events: {
      title: "Event History",
      subtitle: "Browse all blockchain events captured by ChainPulse",
      table: {
        type: "Type",
        from: "From",
        to: "To",
        value: "Value",
        network: "Network",
        time: "Time",
      },
    },
    settings: {
      title: "Settings",
      subtitle: "Configure your ChainPulse preferences",
      notifications: {
        title: "Notification Settings",
        browser: "Browser Notifications",
        sound: "Sound Alerts",
        telegram: "Telegram Notifications",
        discord: "Discord Notifications",
      },
      integrations: {
        title: "Third-party Integrations",
        telegram: {
          title: "Telegram Bot",
          chatId: "Chat ID",
          placeholder: "Enter your Telegram chat ID",
        },
        discord: {
          title: "Discord Webhook",
          url: "Webhook URL",
          placeholder: "Enter your Discord webhook URL",
        },
        save: "Save",
        test: "Test",
      },
    },
  },
  zh: {
    common: {
      appName: "ChainPulse",
      tagline: "实时监控",
      connectWallet: "连接钱包",
    },
    nav: {
      dashboard: "仪表板",
      events: "事件",
      settings: "设置",
    },
    dashboard: {
      title: "实时区块链监控",
      subtitle: "实时追踪智能合约事件和链上活动",
      stats: {
        totalEvents: "总事件数",
        activeWallets: "活跃钱包",
        smartAccounts: "智能账户",
        gasSaved: "节省Gas",
      },
      charts: {
        eventTimeline: "事件时间线",
        activeWallets: "活跃钱包 (24小时)",
        eventDistribution: "事件分布",
        networkActivity: "网络活动",
      },
    },
    events: {
      title: "事件历史",
      subtitle: "浏览ChainPulse捕获的所有区块链事件",
      table: {
        type: "类型",
        from: "发送方",
        to: "接收方",
        value: "金额",
        network: "网络",
        time: "时间",
      },
    },
    settings: {
      title: "设置",
      subtitle: "配置您的ChainPulse偏好",
      notifications: {
        title: "通知设置",
        browser: "浏览器通知",
        sound: "声音提醒",
        telegram: "Telegram通知",
        discord: "Discord通知",
      },
      integrations: {
        title: "第三方集成",
        telegram: {
          title: "Telegram机器人",
          chatId: "聊天ID",
          placeholder: "输入您的Telegram聊天ID",
        },
        discord: {
          title: "Discord Webhook",
          url: "Webhook URL",
          placeholder: "输入您的Discord webhook URL",
        },
        save: "保存",
        test: "测试",
      },
    },
  },
  ja: {
    common: {
      appName: "ChainPulse",
      tagline: "リアルタイム監視",
      connectWallet: "ウォレット接続",
    },
    nav: {
      dashboard: "ダッシュボード",
      events: "イベント",
      settings: "設定",
    },
    dashboard: {
      title: "リアルタイムブロックチェーン監視",
      subtitle: "スマートコントラクトイベントとオンチェーンアクティビティをリアルタイムで追跡",
      stats: {
        totalEvents: "総イベント数",
        activeWallets: "アクティブウォレット",
        smartAccounts: "スマートアカウント",
        gasSaved: "節約されたガス",
      },
      charts: {
        eventTimeline: "イベントタイムライン",
        activeWallets: "アクティブウォレット (24時間)",
        eventDistribution: "イベント分布",
        networkActivity: "ネットワークアクティビティ",
      },
    },
    events: {
      title: "イベント履歴",
      subtitle: "ChainPulseがキャプチャしたすべてのブロックチェーンイベントを閲覧",
      table: {
        type: "タイプ",
        from: "送信元",
        to: "送信先",
        value: "金額",
        network: "ネットワーク",
        time: "時間",
      },
    },
    settings: {
      title: "設定",
      subtitle: "ChainPulseの設定を構成",
      notifications: {
        title: "通知設定",
        browser: "ブラウザ通知",
        sound: "サウンドアラート",
        telegram: "Telegram通知",
        discord: "Discord通知",
      },
      integrations: {
        title: "サードパーティ統合",
        telegram: {
          title: "Telegramボット",
          chatId: "チャットID",
          placeholder: "TelegramチャットIDを入力",
        },
        discord: {
          title: "Discord Webhook",
          url: "Webhook URL",
          placeholder: "Discord webhook URLを入力",
        },
        save: "保存",
        test: "テスト",
      },
    },
  },
}

export type Locale = keyof typeof translations
export type TranslationKeys = typeof translations.en
