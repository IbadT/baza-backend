import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';

export const getXDomainHeader = (req: Request) => {
  try {
    const xDomain = req.headers['x-domain'] as string;
    if (!xDomain.trim()) {
      throw new BadRequestException('X-Domain is required');
    }
    return xDomain;
  } catch {
    throw new BadRequestException('X-Domain is required');
  }
};
