import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class XDomainMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const xDomain = req.headers['x-domain'];
    if (!xDomain || typeof xDomain !== 'string') {
      throw new BadRequestException('Missing or invalid X-Domain header');
    }
    // req["x-domain"] = xDomain;
    req.xDomain = xDomain;
    next();
  }
}
