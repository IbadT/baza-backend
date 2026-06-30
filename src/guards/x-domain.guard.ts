import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class XDomainGuard implements CanActivate {
  constructor(private readonly databaseService: DatabaseService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const request = ctx.switchToHttp().getRequest<Request>();
    const xDomain =
      (request.headers as any)['x-domain'] ||
      (request.headers as any)['X-Domain'] ||
      (request.headers as any).xDomain;

    if (!xDomain || typeof xDomain !== 'string') {
      throw new BadRequestException('X-Domain обязателен');
    }

    const userId = xDomain.trim();
    if (!userId) {
      throw new BadRequestException('X-Domain не может быть пустым');
    }

    const pool = this.databaseService.getPool();
    const result = await pool
      .request()
      .input('userId', userId)
      .query(
        'SELECT TOP 1 1 as found FROM UserToCustomerGroupPolicies WHERE UserId = @userId',
      );

    if (!result.recordset.length) {
      throw new ForbiddenException(`Пользователь ${userId} не найден`);
    }

    return true;
  }
}
