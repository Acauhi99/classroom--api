import * as memjs from "memjs";
import { ICacheService } from "../../@domain/interfaces/cache-service.interface.js";

class MemcachedService implements ICacheService {
  private client: memjs.Client;
  private defaultTTL: number;

  constructor() {
    const host = process.env.CACHE_HOST;
    const port = process.env.CACHE_PORT;
    const defaultTTL = process.env.CACHE_TTL;

    if (!host || !port || !defaultTTL) {
      throw new Error("Cache configuration is missing environment variables");
    }

    this.defaultTTL = parseInt(defaultTTL, 10);

    this.client = memjs.Client.create(`${host}:${port}`, {
      timeout: 1000,
      retries: 2,
    });

    console.log(`📦 Memcached client connected to ${host}:${port}`);
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const { value } = await this.client.get(key);
      if (!value) return null;
      return JSON.parse(value.toString()) as T;
    } catch (error) {
      console.error(`Error getting cache key ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      await this.client.set(key, serializedValue, {
        expires: ttl || this.defaultTTL,
      });
    } catch (error) {
      console.error(`Error setting cache key ${key}:`, error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.delete(key);
    } catch (error) {
      console.error(`Error deleting cache key ${key}:`, error);
    }
  }

  async flush(): Promise<void> {
    try {
      await this.client.flush();
    } catch (error) {
      console.error("Error flushing cache:", error);
    }
  }

  async close(): Promise<void> {
    await this.client.close();
  }
}

export const cacheService = new MemcachedService();
