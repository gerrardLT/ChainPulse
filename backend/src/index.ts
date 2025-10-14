import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { log } from './utils/logger'
import { requestLogger } from './middleware/logger.middleware'
import { errorHandler, notFoundHandler } from './middleware/error.middleware'
import authRoutes from './routes/auth.routes'
import userRoutes from './routes/user.routes'
import notificationRoutes from './routes/notification.routes'
import smartAccountRoutes from './routes/smart-account.routes'
import subscriptionRoutes from './routes/subscription.routes'
import statsRoutes from './routes/stats.routes'
import automationRuleRoutes from './routes/automation-rule.routes'
import eventsRoutes from './routes/events.routes'
import integrationsRoutes from './routes/integrations.routes'
import { initializeWebSocket } from './websocket'

// Load environment variables
dotenv.config()

const app = express()
const httpServer = createServer(app)
const PORT = process.env.PORT || 4000

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3001',
    'http://localhost:3000', // 兼容旧端口
    'http://localhost:3001'  // 新端口
  ],
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(requestLogger)

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'ChainPulse Backend'
    }
  })
})

// API v1 routes
app.get('/api/v1', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'ChainPulse API v1',
      version: '1.0.0',
      endpoints: {
        auth: '/api/v1/auth',
        users: '/api/v1/users',
        smartAccounts: '/api/v1/smart-accounts',
        subscriptions: '/api/v1/subscriptions',
        notifications: '/api/v1/notifications',
        automationRules: '/api/v1/automation-rules',
        integrations: '/api/v1/integrations',
        stats: '/api/v1/stats',
        events: '/api/v1/events'
      }
    }
  })
})

// API Routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/notifications', notificationRoutes)
app.use('/api/v1/smart-accounts', smartAccountRoutes)
app.use('/api/v1/subscriptions', subscriptionRoutes)
app.use('/api/v1/stats', statsRoutes)
app.use('/api/v1/automation-rules', automationRuleRoutes)
app.use('/api/v1/events', eventsRoutes)
app.use('/api/v1/integrations', integrationsRoutes)

// 404 handler
app.use(notFoundHandler)

// Error handler
app.use(errorHandler)

// Initialize WebSocket server
initializeWebSocket(httpServer)
log.info('✅ WebSocket server initialized')

// Start server
httpServer.listen(PORT, () => {
  log.info(`🚀 ChainPulse Backend Server started on port ${PORT}`)
  log.info(`📊 Health check: http://localhost:${PORT}/health`)
  log.info(`📡 API: http://localhost:${PORT}/api/v1`)
  log.info(`🔌 WebSocket: http://localhost:${PORT}`)
  log.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  log.info('SIGTERM signal received: closing HTTP server')
  httpServer.close(() => {
    log.info('HTTP server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  log.info('SIGINT signal received: closing HTTP server')
  httpServer.close(() => {
    log.info('HTTP server closed')
    process.exit(0)
  })
})

export { app, httpServer }

