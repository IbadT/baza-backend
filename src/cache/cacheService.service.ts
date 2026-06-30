// import { InjectRedis } from '@nestjs-modules/ioredis';
// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { Redis } from 'ioredis';
// import { AppLogger } from 'src/logger/logger.service';
//
// export interface ISetRedisData<T> {
//   baseKey: string;
//   ttl?: number;
//   value: T;
// }
//
// @Injectable()
// export class CacheService {
//   constructor(
//     @InjectRedis() private readonly redis: Redis,
//     private readonly configService: ConfigService,
//     private readonly logger: AppLogger,
//   ) {}
//
//   private buildCacheKey(
//     baseKey: string,
//     ...parts: Array<string | number>
//   ): string {
//     return [baseKey, ...parts].join(':');
//   }
//
//   async get<T>(
//     baseKey: string,
//     ...params: (string | number)[]
//   ): Promise<T | null> {
//     this.logger.debug(`Cache get: ${baseKey}`, 'CacheService');
//     const key = this.buildCacheKey(baseKey, ...params);
//     const data = await this.redis.get(key);
//     this.logger.debug(
//       data ? `Cache hit: ${key}` : `Cache miss: ${key}`,
//       'CacheService',
//     );
//     return data ? (JSON.parse(data) as T) : null;
//   }
//
//   async set<T>(
//     {
//       baseKey,
//       ttl = Number(this.configService.getOrThrow<string>('REDIS_DEFAULT_TTL')),
//       value,
//     }: ISetRedisData<T>,
//     ...params: (string | number)[]
//   ) {
//     const key = this.buildCacheKey(baseKey, ...params);
//     const payload = JSON.stringify(value);
//     this.logger.debug(`Cache set: ${key} (TTL: ${ttl}s)`, 'CacheService');
//     await this.redis.setex(key, ttl, payload);
//   }
// }
