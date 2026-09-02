export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

export const logger = {
  debug: (msg: string, data?: any) => {
    console.log(`[${LogLevel.DEBUG}]`, msg, data || '');
  },
  info: (msg: string, data?: any) => {
    console.log(`[${LogLevel.INFO}]`, msg, data || '');
  },
  warn: (msg: string, data?: any) => {
    console.warn(`[${LogLevel.WARN}]`, msg, data || '');
  },
  error: (msg: string, error?: Error) => {
    console.error(`[${LogLevel.ERROR}]`, msg, error?.message || '');
  }
};

export const logSecurity = (action: string, user: string, status: 'SUCCESS' | 'FAILED') => {
  logger.info(`SECURITY: ${action} - User: ${user} - Status: ${status}`);
};
