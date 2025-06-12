/**
 * Standardized Bun Logging Library using Pino
 * Provides consistent logging with pino-pretty formatter
 */

import type { LoggerOptions } from "pino";
import pino from "pino";

/**
 * Available log levels matching pino's levels
 */
export enum LogLevel {
  TRACE = 10,
  DEBUG = 20,
  INFO = 30,
  WARN = 40,
  ERROR = 50,
  FATAL = 60,
  SILENT = Infinity,
}

/**
 * Map string levels to numeric values
 */
const LOG_LEVEL_MAP: Record<string, number> = {
  TRACE: LogLevel.TRACE,
  DEBUG: LogLevel.DEBUG,
  INFO: LogLevel.INFO,
  WARN: LogLevel.WARN,
  ERROR: LogLevel.ERROR,
  FATAL: LogLevel.FATAL,
  SILENT: LogLevel.SILENT,
};

/**
 * Parse log level from environment variable or return default
 */
function parseLogLevel(level: string | undefined): number {
  if (!level) {
    return LogLevel.INFO; // Default to INFO level for debugging
  }

  const upperLevel = level.toUpperCase();
  return LOG_LEVEL_MAP[upperLevel] ?? LogLevel.INFO;
}

/**
 * Get pino configuration based on environment
 */
function getPinoConfig(): LoggerOptions {
  const isCI = process.env.CI === "true";
  const level = parseLogLevel(process.env.LOG_LEVEL);

  // In development/local, use pretty printing with default colors
  return {
    level: pino.levels.labels[level] || "info",
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss.l",
        ignore: "pid,hostname",
      },
    },
  };
}

/**
 * Create the pino logger instance
 */
const pinoLogger = pino(getPinoConfig());

/**
 * Success is not a standard pino level, so we'll use info with a special prefix
 */
function logSuccess(message: string, ...args: unknown[]): void {
  // Only show party emoji for final success messages
  const isImportantSuccess =
    message.toLowerCase().includes("success") ||
    message.toLowerCase().includes("complete") ||
    message.toLowerCase().includes("done") ||
    message.toLowerCase().includes("finished");

  if (isImportantSuccess && args.length === 0) {
    pinoLogger.info(`${message} 🎉`);
  } else {
    pinoLogger.info(message, ...args);
  }
}

/**
 * Logging interface matching the existing API
 */
export interface Logger {
  trace: (message: string, ...args: unknown[]) => void;
  debug: (message: string, ...args: unknown[]) => void;
  info: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  error: (message: string, ...args: unknown[]) => void;
  success: (message: string, ...args: unknown[]) => void;
  fatal: (message: string, ...args: unknown[]) => void;
  setLevel: (level: LogLevel | string) => void;
  getLevel: () => string;
  isLevelEnabled: (level: LogLevel) => boolean;
}

/**
 * Main logger instance wrapping pino
 */
export const logger: Logger = {
  trace: (message: string, ...args: unknown[]) => {
    pinoLogger.trace(message, ...args);
  },

  debug: (message: string, ...args: unknown[]) => {
    pinoLogger.debug(message, ...args);
  },

  info: (message: string, ...args: unknown[]) => {
    pinoLogger.info(message, ...args);
  },

  warn: (message: string, ...args: unknown[]) => {
    pinoLogger.warn(message, ...args);
  },

  error: (message: string, ...args: unknown[]) => {
    pinoLogger.error(message, ...args);
  },

  success: logSuccess,

  fatal: (message: string, ...args: unknown[]) => {
    pinoLogger.fatal(message, ...args);
  },

  setLevel: (level: LogLevel | string) => {
    const numericLevel =
      typeof level === "string" ? parseLogLevel(level) : level;
    pinoLogger.level = pino.levels.labels[numericLevel] || "info";
  },

  getLevel: () => pinoLogger.level,

  isLevelEnabled: (level: LogLevel) => {
    const currentLevel = pino.levels.values[pinoLogger.level] || LogLevel.INFO;
    return level >= currentLevel;
  },
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
export const fatal = logger.fatal;

/**
 * Default export is the logger instance
 */
export default logger;
