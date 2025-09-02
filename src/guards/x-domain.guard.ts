import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class XDomainGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const request = ctx.switchToHttp().getRequest<Request>();
    const xDomain =
      (request.headers as any)['x-domain'] ||
      (request.headers as any)['X-Domain'] ||
      (request.headers as any).xDomain;

    if (!xDomain || typeof xDomain !== 'string') {
      throw new BadRequestException('X-Domain обязателен');
    }

    const allowedDomains = ['.ru', '.by'];
    const isValidDomain = allowedDomains.some((domain) =>
      xDomain.endsWith(domain),
    );

    if (!isValidDomain) {
      throw new BadRequestException(`Домен ${xDomain} не разрешен`);
    }

    return true;
  }
}
