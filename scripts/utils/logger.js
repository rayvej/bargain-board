export const logger = {
  info: (msg) => console.log(`\x1b[34m[INFO] ${new Date().toISOString()}\x1b[0m - ${msg}`),
  success: (msg) => console.log(`\x1b[32m[SUCCESS] ${new Date().toISOString()}\x1b[0m - ${msg}`),
  warn: (msg) => console.warn(`\x1b[33m[WARN] ${new Date().toISOString()}\x1b[0m - ${msg}`),
  error: (msg, err = '') => console.error(`\x1b[31m[ERROR] ${new Date().toISOString()}\x1b[0m - ${msg}`, err)
};
