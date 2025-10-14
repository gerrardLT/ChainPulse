import winston from 'winston'

const { combine, timestamp, printf, colorize, errors } = winston.format

// 自定义日志格式
const logFormat = printf(({ level, message, timestamp, stack }) => {
  if (stack) {
    return `${timestamp} [${level}]: ${message}\n${stack}`
  }
  return `${timestamp} [${level}]: ${message}`
})

// 创建 Winston Logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    // 错误日志文件
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // 所有日志文件
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
})

// 开发环境添加控制台输出
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      ),
    })
  )
}

// 导出便捷方法
export const log = {
  info: (message: string, meta?: any) => logger.info(message, meta),
  error: (message: string, error?: Error | any) => {
    if (error instanceof Error) {
      logger.error(message, { error: error.message, stack: error.stack })
    } else {
      logger.error(message, { error })
    }
  },
  warn: (message: string, meta?: any) => logger.warn(message, meta),
  debug: (message: string, meta?: any) => logger.debug(message, meta),
}

