// ULTIMATE SIMPLIFIED SERVER - 50 lines that does everything!

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { config, validateConfig } from './config'
import { pool } from './config/database'
import { errorHandler } from './middleware/errorHandler'
import { health, metrics } from './utils/health'
import { generateRoutes } from './utils/routeGenerator'
import { authService } from './utils/authService'
import { meetingService } from './utils/meetingService'
import { actionItemService } from './utils/actionItemService'
import { dashboardService } from './utils/dashboardService'

// Validate environment
validateConfig()

// Create app
const app = express()

// Middleware
app.use(helmet())
app.use(cors({ origin: config.cors.origin }))
app.use(express.json())
app.use(rateLimit(config.rateLimit))

// Request timing
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - start
    metrics.recordRequest(duration)
  })
  next()
})

// Initialize database
pool.on('error', () => metrics.recordError())

// Health endpoints
app.get('/health', (req, res) => res.json({ status: 'ok' }))
app.get('/health/status', async (req, res) => res.json(await health.check()))
app.get('/metrics', (req, res) => res.json(metrics.getMetrics()))

// Auto-generate REST routes from services
app.use('/api/auth', generateRoutes('auth', authService))
app.use('/api/meetings', generateRoutes('meetings', meetingService))
app.use('/api/action-items', generateRoutes('actionItems', actionItemService))
app.use('/api/dashboard', generateRoutes('dashboard', dashboardService))

// Error handler (last middleware)
app.use(errorHandler)

// Start server
const PORT = config.app.port
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`)
  console.log(`🔒 Environment: ${config.app.env}`)
  console.log(`📊 Health: /health`)
  console.log(`📈 Metrics: /metrics`)
})
