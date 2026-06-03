import fs from 'fs';
import path from 'path';

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'SECURITY' | 'AUDIT';

export function writeLog(level: LogLevel, tenant: string, user: string, message: string) {
  const date = new Date();
  
  // Format: may-25-2026.log
  const month = date.toLocaleString('en-US', { month: 'short' }).toLowerCase();
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  const filename = `${month}-${day}-${year}.log`;
  
  const logDir = path.join(process.cwd(), 'storage', 'logs');
  
  // Ensure directory exists
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  // Format: [2026-05-25 14:32:10] [INFO] [tenant:acme] [user:42] Mensaje
  const timestamp = date.toISOString().replace('T', ' ').substring(0, 19);
  const logEntry = `[${timestamp}] [${level}] [tenant:${tenant}] [user:${user}] ${message}\n`;
  
  fs.appendFileSync(path.join(logDir, filename), logEntry);
  
  // Also log to console in dev
  if (process.env.NODE_ENV !== 'production') {
    console.log(logEntry.trim());
  }
}
