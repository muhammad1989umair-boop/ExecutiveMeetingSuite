// HEALTH CHECK & MONITORING SYSTEM

import { pool } from '../config/database'

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  checks: {
    database: boolean
    memory: boolean
    uptime: number
  }
}

export const health = {
  async check(): Promise<HealthStatus> {
    const checks = {
      database: await this.checkDatabase(),
      memory: this.checkMemory(),
      uptime: this.getUptime()
    }

    const status = checks.database ? 'healthy' : 'unhealthy'

    return {
      status: status as 'healthy' | 'degraded' | 'unhealthy',
      timestamp: new Date().toISOString(),
      checks
    }
  },

  async checkDatabase(): Promise<boolean> {
    try {
      const result = await pool.query('SELECT 1')
      return result.rows.length === 1
    } catch {
      return false
    }
  },

  checkMemory(): boolean {
    const usage = process.memoryUsage()
    const heapUsedPercent = (usage.heapUsed / usage.heapTotal) * 100
    return heapUsedPercent < 90 // OK if under 90%
  },

  getUptime(): number {
    return Math.floor(process.uptime())
  }
}

// Track metrics
export const metrics = {
  requests: 0,
  errors: 0,
  avgResponseTime: 0,

  recordRequest(duration: number) {
    this.requests++
    this.avgResponseTime = (this.avgResponseTime + duration) / 2
  },

  recordError() {
    this.errors++
  },

  getMetrics() {
    return {
      totalRequests: this.requests,
      totalErrors: this.errors,
      errorRate: (this.errors / this.requests * 100).toFixed(2) + '%',
      avgResponseTime: this.avgResponseTime.toFixed(2) + 'ms'
    }
  }
}
