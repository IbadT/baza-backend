import { Controller, Get, Param, Req, Query, UseGuards } from '@nestjs/common';
import { TiresService } from './tires.service';
import { Request } from 'express';
import {
  IResponsePopularBrandModels,
  IResponsePopularBrands,
  IResponsePopularSize,
} from './types/types';
import { GetPopularSizesQueryDTO } from './dto/get-popular-sizes.dto';
import { GetPopularBrandsQueryDTO } from './dto/get-popular-brands.dto';
import { GetPopularBrandModelsApiDocs } from './decorators/GetPopularBrandModels.decorator';
import { GetPopularSizesApiDocs } from './decorators/GetPopularSizes.decorator';
import { GetPopularBrandsApiDocs } from './decorators/GetPopularBrands.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { XDomainGuard } from 'src/guards/x-domain.guard';
import { getXDomainHeader } from 'src/helpers/get_xDomain_header.helper';
import { AuthGuard } from 'src/guards/auth.guard';
import { XApiKeyGuard } from 'src/guards/x-api-key.guard';
import { AppLogger } from 'src/logger/logger.service';

@ApiTags('Tires')
@ApiBearerAuth('JWT-auth')
@Controller('tires')
export class TiresController {
  constructor(
    private readonly tiresService: TiresService,
    private readonly logger: AppLogger,
  ) {}

  @GetPopularSizesApiDocs()
  @UseGuards(XDomainGuard, XApiKeyGuard, AuthGuard)
  @Get('popular-sizes')
  findAllPopularSize(
    @Query() query: GetPopularSizesQueryDTO,
    @Req() req: Request,
  ): Promise<IResponsePopularSize | null> {
    const startTime = Date.now();
    try {
      const userId = getXDomainHeader(req);
      // !!! limitPerDiameter опциональный может быть undefined
      return this.tiresService.findAllPopularSize(query, userId);
    } finally {
      const executionTime = Date.now() - startTime;
      this.logger.log(
        `[TiresController.findAllPopularSize] Execution time: ${executionTime}ms`,
        'TiresController',
      );
    }
  }

  @GetPopularBrandsApiDocs()
  @UseGuards(XDomainGuard, XApiKeyGuard, AuthGuard)
  @Get('popular-brands')
  async findAllPopularBrands(
    @Query() query: GetPopularBrandsQueryDTO,
    @Req() req: Request,
  ): Promise<IResponsePopularBrands | null> {
    const startTime = Date.now();
    try {
      const { limit = 10 } = query;

      const userId = getXDomainHeader(req);
      return this.tiresService.findAllPopularBrands(limit, userId);
    } finally {
      const executionTime = Date.now() - startTime;
      this.logger.log(
        `[TiresController.findAllPopularBrands] Execution time: ${executionTime}ms`,
        'TiresController',
      );
    }
  }

  @GetPopularBrandModelsApiDocs()
  @UseGuards(XDomainGuard, XApiKeyGuard, AuthGuard)
  @Get('brand-models/:brandId')
  async findAllPopularBrandModels(
    @Param('brandId') brandId: string,
    @Req() req: Request,
  ): Promise<IResponsePopularBrandModels | null> {
    const startTime = Date.now();
    try {
      const userId = getXDomainHeader(req);
      return this.tiresService.findAllPopularBrandModels(brandId, userId);
    } finally {
      const executionTime = Date.now() - startTime;
      this.logger.log(
        `[TiresController.findAllPopularBrandModels] Execution time: ${executionTime}ms`,
        'TiresController',
      );
    }
  }
}
