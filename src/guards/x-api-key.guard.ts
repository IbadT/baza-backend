import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class XApiKeyGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const request = ctx.switchToHttp().getRequest<Request>();
    const apiKey =
      (request.headers as any)['x-api-key'] ||
      (request.headers as any)['X-API-Key'] ||
      (request.headers as any).xApiKey;

    if (!apiKey || typeof apiKey !== 'string') {
      throw new BadRequestException('X-API-Key обязателен');
    }

    const allowedApiKeys = this.configService.get<string>('ALLOWED_API_KEYS');

    if (!allowedApiKeys) {
      throw new UnauthorizedException('X-API-Key не валиден');
    }

    const validApiKeys = allowedApiKeys.split(',').map((key) => key.trim());

    if (!validApiKeys.includes(apiKey)) {
      throw new UnauthorizedException('Неверный X-API-Key');
    }

    return true;
  }
}
