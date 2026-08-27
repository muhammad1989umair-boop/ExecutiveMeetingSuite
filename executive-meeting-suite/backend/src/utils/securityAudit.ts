// SECURITY AUDIT - Automatic security verification

import { config } from '../config'

export const securityAudit = {
  issues: [] as string[],

  async run() {
    this.issues = []
    this.checkSecrets()
    this.checkEnvironment()
    this.checkConfig()
    return this.report()
  },

  checkSecrets() {
    if (config.app.isProd && config.jwt.secret === 'dev-secret-key-change-in-production') {
      this.issues.push('❌ JWT_SECRET is using default value in production!')
    }
    if (config.email.password && config.app.isProd && config.email.password.includes('example')) {
      this.issues.push('❌ EMAIL_PASSWORD looks like a placeholder in production!')
    }
  },

  checkEnvironment() {
    if (config.app.isProd && config.cors.origin === '*') {
      this.issues.push('⚠️ CORS_ORIGIN is "*" in production (security risk)')
    }
    if (!config.database.url && config.app.isProd) {
      this.issues.push('⚠️ Not using DATABASE_URL in production (harder to manage)')
    }
  },

  checkConfig() {
    if (!process.env.DB_PASSWORD || process.env.DB_PASSWORD === 'postgres') {
      this.issues.push('⚠️ Using default database password (change in production)')
    }
    if (!process.env.JWT_SECRET) {
      this.issues.push('❌ JWT_SECRET not set!')
    }
  },

  report() {
    const passed = this.issues.length === 0
    const summary = passed
      ? '✅ All security checks passed!'
      : `⚠️ ${this.issues.length} security issue(s) found:`

    return {
      passed,
      summary,
      issues: this.issues,
      timestamp: new Date().toISOString()
    }
  },

  async runOnStartup() {
    const audit = await this.run()
    if (!audit.passed) {
      console.log('\n🔒 SECURITY AUDIT RESULTS:')
      console.log(audit.summary)
      audit.issues.forEach(issue => console.log(issue))
      if (config.app.isProd && audit.issues.some(i => i.startsWith('❌'))) {
        console.error('\n⛔ Critical security issues in production! Fix before deploying.')
        process.exit(1)
      }
    }
    return audit
  }
}
