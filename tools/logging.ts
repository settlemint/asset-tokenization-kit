/**
 * Optimized Bun Logging Library
 * Provides colorful, emoji-enhanced logging with configurable levels
 */

/**
 * Available log levels with their priority values
 */
export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  SUCCESS = 5,
  SILENT = 6,
}

/**
 * ANSI color codes for terminal output
 */
const Colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",

  // Text colors
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",

  // Background colors
  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m",
} as const;

/**
 * Log level configuration with emojis and colors
 */
const LOG_CONFIG = {
  [LogLevel.TRACE]: {
    emoji: "🔍",
    color: Colors.gray,
    name: "TRACE",
    method: "log" as const,
  },
  [LogLevel.DEBUG]: {
    emoji: "🐛",
    color: Colors.cyan,
    name: "DEBUG",
    method: "debug" as const,
  },
  [LogLevel.INFO]: {
    emoji: "ℹ️",
    color: Colors.blue,
    name: "INFO",
    method: "info" as const,
  },
  [LogLevel.WARN]: {
    emoji: "⚠️",
    color: Colors.yellow,
    name: "WARN",
    method: "warn" as const,
  },
  [LogLevel.ERROR]: {
    emoji: "❌",
    color: Colors.red,
    name: "ERROR",
    method: "error" as const,
  },
  [LogLevel.SUCCESS]: {
    emoji: "✅",
    color: Colors.green,
    name: "SUCCESS",
    method: "log" as const,
  },
} as const;

/**
 * Parse log level from environment variable or return default
 */
function parseLogLevel(): LogLevel {
  const envLevel = process.env.LOG_LEVEL?.toUpperCase();

  switch (envLevel) {
    case "TRACE":
      return LogLevel.TRACE;
    case "DEBUG":
      return LogLevel.DEBUG;
    case "INFO":
      return LogLevel.INFO;
    case "WARN":
      return LogLevel.WARN;
    case "ERROR":
      return LogLevel.ERROR;
    case "SUCCESS":
      return LogLevel.SUCCESS;
    case "SILENT":
      return LogLevel.SILENT;
    default:
      return LogLevel.WARN; // Default level - shows WARN, ERROR, SUCCESS
  }
}

/**
 * Current active log level
 */
const currentLogLevel = parseLogLevel();

/**
 * Format timestamp for log output
 */
function formatTimestamp(): string {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");
  const milliseconds = now.getMilliseconds().toString().padStart(3, "0");

  return `${Colors.gray}${hours}:${minutes}:${seconds}.${milliseconds}${Colors.reset}`;
}

/**
 * Format log level badge
 */
function formatLogLevel(level: LogLevel): string {
  const config = LOG_CONFIG[level];
  return `${config.emoji} ${config.color}${Colors.bright}${config.name}${Colors.reset}`;
}

/**
 * Core logging function
 */
function log(level: LogLevel, message: string, ...args: unknown[]): void {
  // Check if this log level should be output
  if (level < currentLogLevel || level === LogLevel.SILENT) {
    return;
  }

  const config = LOG_CONFIG[level];
  const timestamp = formatTimestamp();
  const levelBadge = formatLogLevel(level);

  // Format the message with colors
  const coloredMessage = `${config.color}${message}${Colors.reset}`;

  // Use appropriate console method
  console[config.method](
    `${timestamp} ${levelBadge} ${coloredMessage}`,
    ...args
  );
}

/**
 * Logging interface with all available methods
 */
export interface Logger {
  trace: (message: string, ...args: unknown[]) => void;
  debug: (message: string, ...args: unknown[]) => void;
  info: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  error: (message: string, ...args: unknown[]) => void;
  success: (message: string, ...args: unknown[]) => void;
  setLevel: (level: LogLevel) => void;
  getLevel: () => LogLevel;
  isLevelEnabled: (level: LogLevel) => boolean;
}

/**
 * Set the current log level programmatically
 */
function setLogLevel(level: LogLevel): void {
  // We'll store this in a module variable since we can't modify the const
  Object.defineProperty(logger, "_currentLevel", {
    value: level,
    writable: true,
    enumerable: false,
  });
}

/**
 * Get the current log level
 */
function getLogLevel(): LogLevel {
  return (logger as any)._currentLevel ?? currentLogLevel;
}

/**
 * Check if a log level is enabled
 */
function isLevelEnabled(level: LogLevel): boolean {
  return level >= getLogLevel() && level !== LogLevel.SILENT;
}

/**
 * Main logger instance
 */
export const logger: Logger = {
  trace: (message: string, ...args: unknown[]) => {
    if (isLevelEnabled(LogLevel.TRACE)) {
      log(LogLevel.TRACE, message, ...args);
    }
  },

  debug: (message: string, ...args: unknown[]) => {
    if (isLevelEnabled(LogLevel.DEBUG)) {
      log(LogLevel.DEBUG, message, ...args);
    }
  },

  info: (message: string, ...args: unknown[]) => {
    if (isLevelEnabled(LogLevel.INFO)) {
      log(LogLevel.INFO, message, ...args);
    }
  },

  warn: (message: string, ...args: unknown[]) => {
    if (isLevelEnabled(LogLevel.WARN)) {
      log(LogLevel.WARN, message, ...args);
    }
  },

  error: (message: string, ...args: unknown[]) => {
    if (isLevelEnabled(LogLevel.ERROR)) {
      log(LogLevel.ERROR, message, ...args);
    }
  },

  success: (message: string, ...args: unknown[]) => {
    if (isLevelEnabled(LogLevel.SUCCESS)) {
      log(LogLevel.SUCCESS, message, ...args);
    }
  },

  setLevel: setLogLevel,
  getLevel: getLogLevel,
  isLevelEnabled,
};

/**
 * Export individual logging functions for convenience
 */
export const trace = logger.trace;
export const debug = logger.debug;
export const info = logger.info;
export const warn = logger.warn;
export const error = logger.error;
export const success = logger.success;

/**
 * Default export is the logger instance
 */
export default logger;
