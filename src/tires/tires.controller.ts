import { Controller, Get, Param, Req, Query, UseGuards } from '@nestjs/common';
import { TiresService } from './tires.service';
import { Request } from 'express';
import {
  IResponsePopularBrandModels,
  IResponsePopularBrands,
  IResponsePopularSize,
} from './types/types';
import { GetPupularSizesQueryDTO } from './dto/get-popular-sizes.dto';
import { GetPupularBrandsQueryDTO } from './dto/get-popular-brands.dto';
import { GetPopularBrandModelsApiDocs } from './decorators/GetPopularBrandModels.decorator';
import { GetPopularSizesApiDocs } from './decorators/GetPopularSizes.decorator';
import { GetPopularBrandsApiDocs } from './decorators/GetPopularBrands.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { XDomainGuard } from 'src/guards/x-domain.guard';
import { getXDomainHeader } from 'src/helpers/get_xDomain_header.helper';
import { AuthGuard } from 'src/guards/auth.guard';
import { XApiKeyGuard } from 'src/guards/x-api-key.guard';

@ApiTags('Tires')
@ApiBearerAuth('JWT-auth')
@Controller('tires')
export class TiresController {
  constructor(private readonly tiresService: TiresService) {}

  @GetPopularSizesApiDocs()
  @UseGuards(XDomainGuard, XApiKeyGuard, AuthGuard)
  @Get('popular-sizes')
  findAllPopularSize(
    @Query() query: GetPupularSizesQueryDTO,
    @Req() req: Request,
  ): Promise<IResponsePopularSize | null> {
    const xDomain = getXDomainHeader(req);
    // !!! limitPerDiameter опциональный может быть undefined
    return this.tiresService.findAllPopularSize(query, xDomain);
  }

  @GetPopularBrandsApiDocs()
  @UseGuards(XDomainGuard, XApiKeyGuard, AuthGuard)
  @Get('popular-brands')
  async findAllPopularBrands(
    @Query() query: GetPupularBrandsQueryDTO,
    @Req() req: Request,
  ): Promise<IResponsePopularBrands | null> {
    const { limit = 10 } = query;

    const xDomain = getXDomainHeader(req);
    return this.tiresService.findAllPopularBrands(limit, xDomain);
  }

  @GetPopularBrandModelsApiDocs()
  @UseGuards(XDomainGuard, XApiKeyGuard, AuthGuard)
  @Get('brand-models/:brandId')
  async findAllPopularBrandModels(
    @Param('brandId') brandId: string,
    @Req() req: Request,
  ): Promise<IResponsePopularBrandModels | null> {
    const xDomain = getXDomainHeader(req);
    return this.tiresService.findAllPopularBrandModels(brandId, xDomain);
  }
}
