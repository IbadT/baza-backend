import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

export interface ISetRedisData<T> {
  baseKey: string;
  ttl?: number;
  value: T;
}

@Injectable()
export class CacheService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly configService: ConfigService,
  ) {}

  private buildCacheKey(
    baseKey: string,
    ...parts: Array<string | number>
  ): string {
    return [baseKey, ...parts].join(':');
  }

  async get<T>(
    baseKey: string,
    ...params: (string | number)[]
  ): Promise<T | null> {
    console.log('get', baseKey, ...params);
    const key = this.buildCacheKey(baseKey, ...params);
    console.log('key', key);
    const data = await this.redis.get(key);
    console.log('data', data);
    return data ? (JSON.parse(data) as T) : null;
  }

  async set<T>(
    {
      baseKey,
      ttl = Number(this.configService.getOrThrow<string>('REDIS_DEFAULT_TTL')),
      value,
    }: ISetRedisData<T>,
    ...params: (string | number)[]
  ) {
    const key = this.buildCacheKey(baseKey, ...params);
    const payload = JSON.stringify(value);
    await this.redis.setex(key, ttl, payload);
  }
}
