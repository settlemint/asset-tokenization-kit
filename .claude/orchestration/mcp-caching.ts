// MCP Tool Caching Strategy Implementation

import type {
  AgentContext,
  CacheEntry,
  CacheStore,
} from "./context-management";

export interface MCPCacheConfig {
  tool: string;
  defaultTTL: number;
  scope: "session" | "task" | "global";
  keyStrategy: (params: any) => string;
}

export const MCP_CACHE_CONFIGS: Record<string, MCPCacheConfig> = {
  context7: {
    tool: "mcp__context7__get_library_docs",
    defaultTTL: 3600000, // 1 hour
    scope: "session",
    keyStrategy: (params) =>
      `${params.context7CompatibleLibraryID}_${params.topic || "general"}`,
  },

  gemini: {
    tool: "mcp__gemini_cli__ask_gemini",
    defaultTTL: 600000, // 10 minutes
    scope: "task",
    keyStrategy: (params) => {
      const prompt = params.prompt.slice(0, 100).replace(/[^a-zA-Z0-9]/g, "_");
      return `${prompt}_${params.model || "default"}_${params.changeMode || false}`;
    },
  },

  grep: {
    tool: "mcp__grep__searchGitHub",
    defaultTTL: 86400000, // 24 hours
    scope: "global",
    keyStrategy: (params) => {
      const query = params.query.replace(/[^a-zA-Z0-9]/g, "_");
      const lang = params.language?.join("_") || "all";
      return `${query}_${lang}_${params.repo || "all"}`;
    },
  },

  linear: {
    tool: "mcp__linear__",
    defaultTTL: 300000, // 5 minutes for issue data
    scope: "task",
    keyStrategy: (params) =>
      `linear_${params.issueId || params.query || "list"}`,
  },

  sentry: {
    tool: "mcp__sentry__",
    defaultTTL: 300000, // 5 minutes for error data
    scope: "task",
    keyStrategy: (params) =>
      `sentry_${params.issueId || params.query || "list"}`,
  },
};

export class MCPCacheManager {
  private cache: CacheStore;

  constructor(private context: AgentContext) {
    this.cache = context.caches;
  }

  async get<T>(
    toolName: string,
    params: any,
    fetcher: () => Promise<T>
  ): Promise<T> {
    const config = this.findConfig(toolName);
    if (!config) {
      // No caching for this tool
      return fetcher();
    }

    const cacheKey = config.keyStrategy(params);
    const cacheCategory = this.getCacheCategory(toolName);
    const existingEntry = this.cache[cacheCategory]?.[cacheKey] as
      | CacheEntry
      | undefined;

    // Check if cache is valid
    if (existingEntry && this.isValidCache(existingEntry)) {
      console.log(`[CACHE HIT] ${toolName} - ${cacheKey}`);
      return existingEntry.data as T;
    }

    // Fetch new data
    console.log(`[CACHE MISS] ${toolName} - ${cacheKey}`);
    const data = await fetcher();

    // Store in cache
    this.set(toolName, cacheKey, data, config);

    return data;
  }

  private set(
    toolName: string,
    cacheKey: string,
    data: any,
    config: MCPCacheConfig
  ): void {
    const cacheCategory = this.getCacheCategory(toolName);
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl: config.defaultTTL,
      scope: config.scope,
    };

    if (!this.cache[cacheCategory]) {
      this.cache[cacheCategory] = {};
    }

    this.cache[cacheCategory][cacheKey] = entry;
  }

  private isValidCache(entry: CacheEntry): boolean {
    const now = Date.now();
    const age = now - entry.timestamp;

    // Check TTL
    if (age > entry.ttl) {
      return false;
    }

    // Check scope
    switch (entry.scope) {
      case "global":
        return true; // Always valid within TTL
      case "session":
        return this.context.sessionId === this.context.sessionId; // Same session
      case "task":
        return this.context.taskId === this.context.taskId; // Same task
      default:
        return false;
    }
  }

  private findConfig(toolName: string): MCPCacheConfig | undefined {
    return Object.values(MCP_CACHE_CONFIGS).find((config) =>
      toolName.startsWith(config.tool)
    );
  }

  private getCacheCategory(toolName: string): keyof CacheStore {
    if (toolName.includes("context7")) return "context7";
    if (toolName.includes("gemini")) return "gemini";
    if (toolName.includes("grep")) return "realWorldExamples";
    return "gemini"; // Default fallback
  }

  // Clear expired entries
  cleanup(): void {
    const now = Date.now();

    Object.keys(this.cache).forEach((category) => {
      const categoryCache = this.cache[category as keyof CacheStore];
      if (typeof categoryCache === "object" && categoryCache !== null) {
        Object.keys(categoryCache).forEach((key) => {
          const entry = categoryCache[key] as CacheEntry;
          if (entry && !this.isValidCache(entry)) {
            delete categoryCache[key];
          }
        });
      }
    });
  }

  // Get cache statistics
  getStats(): {
    totalEntries: number;
    byCategory: Record<string, number>;
    totalSize: number;
  } {
    let totalEntries = 0;
    const byCategory: Record<string, number> = {};
    let totalSize = 0;

    Object.keys(this.cache).forEach((category) => {
      const categoryCache = this.cache[category as keyof CacheStore];
      if (typeof categoryCache === "object" && categoryCache !== null) {
        const count = Object.keys(categoryCache).length;
        totalEntries += count;
        byCategory[category] = count;

        // Rough size estimation
        totalSize += JSON.stringify(categoryCache).length;
      }
    });

    return { totalEntries, byCategory, totalSize };
  }
}

// Helper function for agents to use caching
export async function withMCPCache<T>(
  context: AgentContext,
  toolName: string,
  params: any,
  fetcher: () => Promise<T>
): Promise<T> {
  const cacheManager = new MCPCacheManager(context);
  return cacheManager.get(toolName, params, fetcher);
}

// Example usage in an agent:
/*
// In react-dev agent
const reactDocs = await withMCPCache(
  context,
  'mcp__context7__get_library_docs',
  { context7CompatibleLibraryID: '/facebook/react', topic: 'hooks' },
  async () => {
    return await mcp__context7__get_library_docs({
      context7CompatibleLibraryID: '/facebook/react',
      topic: 'hooks',
      tokens: 5000
    });
  }
);

// In solidity-expert agent
const examples = await withMCPCache(
  context,
  'mcp__grep__searchGitHub',
  { query: 'ERC20 transfer', language: ['Solidity'] },
  async () => {
    return await mcp__grep__searchGitHub({
      query: 'ERC20 transfer',
      language: ['Solidity'],
      matchCase: true
    });
  }
);
*/
