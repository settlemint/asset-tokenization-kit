/**
 * Configuration for streaming endpoints in the ORPC API.
 * 
 * Streaming endpoints return AsyncIterator responses and should not be batched
 * by the BatchLinkPlugin to ensure real-time event delivery.
 * 
 * This configuration is used by the ORPC client to determine which endpoints
 * should bypass request batching.
 * 
 * To add a new streaming endpoint:
 * 1. Add the endpoint path to STREAMING_ENDPOINTS array
 * 2. Add configuration to STREAMING_ENDPOINT_CONFIG object
 * 3. The endpoint will automatically be excluded from batching
 * 
 * Example:
 * ```typescript
 * // In your contract file:
 * const deploy = baseContract
 *   .route({ method: "POST", path: "/assets/deploy" })
 *   .input(DeploySchema)
 *   .output(eventIterator(DeployOutputSchema)); // <-- eventIterator indicates streaming
 * 
 * // Then add to this file:
 * STREAMING_ENDPOINTS: ["asset.deploy", ...]
 * STREAMING_ENDPOINT_CONFIG: {
 *   "asset.deploy": {
 *     excludeFromBatching: true,
 *     infiniteRetries: false,
 *   }
 * }
 * ```
 */

/**
 * List of endpoint paths that return streaming responses.
 * These endpoints will be excluded from request batching.
 */
export const STREAMING_ENDPOINTS = [
  // System endpoints
  "system.create",
  "system.deploy",
  
  // Transaction tracking endpoints (legacy)
  "transaction.track",
  
  // Add new streaming endpoints here as they are created
] as const;

/**
 * Type for streaming endpoint paths
 */
export type StreamingEndpoint = typeof STREAMING_ENDPOINTS[number];

/**
 * Helper function to check if an endpoint path is a streaming endpoint.
 * 
 * @param path - The endpoint path to check (e.g., "system.create" or ["system", "create"])
 * @returns true if the endpoint is a streaming endpoint
 */
export function isStreamingEndpoint(path: string | readonly string[]): boolean {
  const pathStr = Array.isArray(path) ? path.join('.') : path;
  return STREAMING_ENDPOINTS.some(endpoint => pathStr.includes(endpoint));
}

/**
 * Configuration options for streaming behavior
 */
export interface StreamingConfig {
  /** Whether to exclude this endpoint from batching */
  excludeFromBatching?: boolean;
  /** Whether to enable infinite retries for this endpoint */
  infiniteRetries?: boolean;
  /** Custom retry configuration */
  retryConfig?: {
    maxRetries?: number;
    retryDelay?: number;
  };
}

/**
 * Detailed configuration for specific streaming endpoints
 */
export const STREAMING_ENDPOINT_CONFIG: Record<StreamingEndpoint, StreamingConfig> = {
  "system.create": {
    excludeFromBatching: true,
    infiniteRetries: false,
  },
  "system.deploy": {
    excludeFromBatching: true,
    infiniteRetries: false,
  },
  "transaction.track": {
    excludeFromBatching: true,
    infiniteRetries: true, // Legacy behavior for transaction tracking
  },
};

/**
 * Get the streaming configuration for a specific endpoint
 * 
 * @param path - The endpoint path (e.g., "system.create" or ["system", "create"])
 * @returns The streaming configuration or undefined if not a streaming endpoint
 */
export function getStreamingConfig(path: string | readonly string[]): StreamingConfig | undefined {
  const pathStr = Array.isArray(path) ? path.join('.') : path;
  const endpoint = STREAMING_ENDPOINTS.find(ep => pathStr.includes(ep));
  return endpoint ? STREAMING_ENDPOINT_CONFIG[endpoint] : undefined;
}