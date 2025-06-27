import { encodePacked, keccak256 } from 'viem';
import { ATKTopic } from '../constants/topics';
import { atkDeployer } from './deployer';

/**
 * Cached topic information
 */
interface CachedTopic {
  id: bigint;
  name: string;
  signature: string;
}

/**
 * Topic Manager Utility
 *
 * Manages topic ID caching and resolution for the SMART protocol.
 * Provides efficient access to topic IDs without repeated contract calls.
 */
export class TopicManager {
  private _topicCache = new Map<string, CachedTopic>();
  private _idToNameCache = new Map<bigint, string>();
  private _isInitialized = false;

  /**
   * Initialize the TopicManager with the topic scheme registry contract
   */
  public async initialize(): Promise<void> {
    await this._loadTopicsFromRegistry();
    this._isInitialized = true;
  }

  /**
   * Check if the TopicManager is initialized
   */
  public isInitialized(): boolean {
    return this._isInitialized;
  }

  /**
   * Get topic ID by name (uses cache if available)
   */
  public getTopicId(name: string): bigint {
    // First check cache
    const cached = this._topicCache.get(name);
    if (cached) {
      return cached.id;
    }

    // Calculate ID from name (same as Solidity: uint256(keccak256(abi.encodePacked(name))))
    const hash = keccak256(encodePacked(['string'], [name]));
    return BigInt(hash);
  }

  /**
   * Get topic name by ID (uses cache if available)
   */
  public getTopicName(id: bigint): string | null {
    return this._idToNameCache.get(id) || null;
  }

  /**
   * Get topic signature by name (uses cache if available)
   */
  public getTopicSignature(name: string): string | null {
    const cached = this._topicCache.get(name);
    return cached?.signature || null;
  }

  /**
   * Get topic signature by ID (uses cache if available)
   */
  public getTopicSignatureById(id: bigint): string | null {
    const name = this.getTopicName(id);
    return name ? this.getTopicSignature(name) : null;
  }

  /**
   * Get all cached topics
   */
  public getAllTopics(): CachedTopic[] {
    return Array.from(this._topicCache.values());
  }

  /**
   * Check if a topic exists by name
   */
  public hasTopicByName(name: string): boolean {
    return this._topicCache.has(name);
  }

  /**
   * Check if a topic exists by ID
   */
  public hasTopicById(id: bigint): boolean {
    return this._idToNameCache.has(id);
  }

  /**
   * Refresh the cache by reloading from the registry
   */
  public async refreshCache(): Promise<void> {
    await this._loadTopicsFromRegistry();
  }

  /**
   * Get topic IDs for the default SMART topics
   */
  public getDefaultTopicIds(): Record<ATKTopic, bigint> {
    const result = {} as Record<ATKTopic, bigint>;

    for (const [key, name] of Object.entries(ATKTopic)) {
      result[key as ATKTopic] = this.getTopicId(name);
    }

    return result;
  }

  /**
   * Load topics from the registry and cache them
   */
  private async _loadTopicsFromRegistry(): Promise<void> {
    const topicRegistry = atkDeployer.getTopicSchemeRegistryContract();

    try {
      // Get all topic IDs from the registry
      const topicIds = (await topicRegistry.read.getAllTopicIds()) as bigint[];

      // Clear existing cache
      this._topicCache.clear();
      this._idToNameCache.clear();

      // Load each topic's details
      for (const topicId of topicIds) {
        try {
          const signature = (await topicRegistry.read.getTopicSchemeSignature([
            topicId,
          ])) as string;

          // Try to find the name by checking against known topic names
          let topicName: string | null = null;

          // Check if this is one of the default topics
          for (const [, name] of Object.entries(ATKTopic)) {
            const calculatedId = this.getTopicId(name);
            if (calculatedId === topicId) {
              topicName = name;
              break;
            }
          }

          // If we couldn't find a matching name, we'll use a generated name
          // This handles custom topics that might be registered
          if (!topicName) {
            topicName = `topic_${topicId.toString(16)}`; // Use hex representation
          }

          const cached: CachedTopic = {
            id: topicId,
            name: topicName,
            signature,
          };

          this._topicCache.set(topicName, cached);
          this._idToNameCache.set(topicId, topicName);
        } catch (error) {
          console.warn(`Failed to load topic ${topicId}:`, error);
        }
      }

      console.log(
        `[TopicManager] Loaded ${this._topicCache.size} topics into cache`
      );
      console.log('[TopicManager] Default Topic IDs:', {
        kyc: this.getTopicId(ATKTopic.kyc).toString(),
        aml: this.getTopicId(ATKTopic.aml).toString(),
        collateral: this.getTopicId(ATKTopic.collateral).toString(),
        isin: this.getTopicId(ATKTopic.isin).toString(),
        assetClassification: this.getTopicId(
          ATKTopic.assetClassification
        ).toString(),
      });
    } catch (error) {
      console.error('Failed to load topics from registry:', error);
      throw error;
    }
  }

  /**
   * Clear all cached data
   */
  public clearCache(): void {
    this._topicCache.clear();
    this._idToNameCache.clear();
    this._isInitialized = false;
  }
}

/**
 * Singleton instance of TopicManager
 */
export const topicManager = new TopicManager();
