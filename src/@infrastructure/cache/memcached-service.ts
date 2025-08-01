import * as memjs from "memjs";
import { ICacheService } from "../../@domain/interfaces/cache-service.interface.js";
import { Either, left, right } from "../../shared/errors/either.js";
import { MissingEnvVarError } from "../../shared/errors/config.errors.js";

type CacheConfig = {
  host: string;
  port: string;
  ttl: number;
};

function getCacheConfig(): Either<MissingEnvVarError, CacheConfig> {
  const DECIMAL_BASE = 10;
  const host = process.env.CACHE_HOST;
  const port = process.env.CACHE_PORT;
  const ttl = process.env.CACHE_TTL;

  if (!host) return left(new MissingEnvVarError("CACHE_HOST"));
  if (!port) return left(new MissingEnvVarError("CACHE_PORT"));
  if (!ttl) return left(new MissingEnvVarError("CACHE_TTL"));

  return right({ host, port, ttl: parseInt(ttl, DECIMAL_BASE) });
}

class MemcachedService implements ICacheService {
  private client: memjs.Client;
  private defaultTTL: number;

  private constructor(client: memjs.Client, defaultTTL: number) {
    this.client = client;
    this.defaultTTL = defaultTTL;
  }

  static create(): Either<MissingEnvVarError, MemcachedService> {
    const configResult = getCacheConfig();

    if (configResult.isLeft()) {
      return left(configResult.value);
    }

    const { host, port, ttl } = configResult.value;
    const client = memjs.Client.create(`${host}:${port}`, {
      timeout: 1000,
      retries: 2,
    });

    console.log(`📦 Memcached client connected to ${host}:${port}`);

    return right(new MemcachedService(client, ttl));
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
    this.client.close();
  }
}

export { MemcachedService };
