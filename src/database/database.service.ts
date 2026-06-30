import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sql from 'mssql';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool: sql.ConnectionPool | null = null;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const server =
      this.configService.get<string>('DB_SERVER')?.trim() ||
      this.configService.get<string>('DB_HOST')?.trim() ||
      this.configService.getOrThrow<string>('DB_SERVER');
    const user =
      this.configService.get<string>('DB_USER')?.trim() ||
      this.configService.get<string>('DB_USERNAME')?.trim() ||
      this.configService.getOrThrow<string>('DB_USER');

    const config: sql.config = {
      server,
      database: this.configService.getOrThrow<string>('DB_DATABASE'),
      user,
      password: this.configService.getOrThrow<string>('DB_PASSWORD'),
      port: parseInt(this.configService.get<string>('DB_PORT') || '1433', 10),
      options: {
        encrypt: this.configService.get<string>('DB_ENCRYPT') !== 'false',
        trustServerCertificate:
          this.configService.get<string>('DB_TRUST_SERVER_CERTIFICATE') !==
          'false',
      },
    };

    try {
      this.pool = await new sql.ConnectionPool(config).connect();
      this.logger.log('MSSQL connection pool initialized');
    } catch (error) {
      this.logger.error(
        'Failed to initialize MSSQL connection pool',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.pool) {
      try {
        await this.pool.close();
        this.logger.log('MSSQL connection pool closed');
      } catch (error) {
        this.logger.error(
          'Error closing MSSQL connection pool',
          error instanceof Error ? error.stack : String(error),
        );
      }
    }
  }

  getPool(): sql.ConnectionPool {
    if (!this.pool) {
      throw new Error('MSSQL connection pool is not initialized');
    }
    return this.pool;
  }

  async close(): Promise<void> {
    return this.onModuleDestroy();
  }

  logResult(label: string, result: sql.IResult<any>): void {
    this.logger.log(
      `[DB RESULT: ${label}] rows: ${result.recordset?.length ?? 0}`,
    );
  }
}
