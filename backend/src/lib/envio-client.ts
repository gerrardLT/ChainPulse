import { ApolloClient, InMemoryCache, HttpLink, NormalizedCacheObject } from '@apollo/client/core'
import fetch from 'cross-fetch'
import { log } from '../utils/logger'

/**
 * Envio GraphQL 客户端
 * 用于查询索引器数据
 */
class EnvioClient {
  private client: ApolloClient<NormalizedCacheObject> | null = null
  private readonly uri: string

  constructor() {
    // 从环境变量获取 Envio GraphQL URL，默认为本地开发环境
    this.uri = process.env.ENVIO_GRAPHQL_URL || 'http://localhost:8080/graphql'
    this.initClient()
  }

  /**
   * 初始化 Apollo Client
   */
  private initClient() {
    try {
      this.client = new ApolloClient({
        link: new HttpLink({
          uri: this.uri,
          fetch,
        }),
        cache: new InMemoryCache({
          // 配置缓存策略
          typePolicies: {
            Query: {
              fields: {
                transactions: {
                  // 分页合并策略
                  keyArgs: ['where', 'orderBy', 'orderDirection'],
                  merge(existing = [], incoming) {
                    return [...existing, ...incoming]
                  },
                },
                smartAccounts: {
                  keyArgs: ['where', 'orderBy', 'orderDirection'],
                  merge(existing = [], incoming) {
                    return [...existing, ...incoming]
                  },
                },
              },
            },
          },
        }),
        defaultOptions: {
          query: {
            errorPolicy: 'all',
            fetchPolicy: 'network-only', // 始终从网络获取最新数据
          },
        },
      })

      log.info(`✅ Envio GraphQL Client initialized: ${this.uri}`)
    } catch (error) {
      log.error('❌ Failed to initialize Envio GraphQL Client:', error)
      this.client = null
    }
  }

  /**
   * 获取 Apollo Client 实例
   */
  getClient(): ApolloClient<NormalizedCacheObject> {
    if (!this.client) {
      throw new Error('Envio GraphQL Client not initialized')
    }
    return this.client
  }

  /**
   * 检查客户端是否可用
   */
  isAvailable(): boolean {
    return this.client !== null
  }

  /**
   * 重新初始化客户端（用于错误恢复）
   */
  reinitialize() {
    log.info('🔄 Reinitializing Envio GraphQL Client...')
    this.initClient()
  }
}

// 导出单例
export const envioClient = new EnvioClient()

