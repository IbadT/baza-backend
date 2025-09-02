import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Request } from 'express';
import { GetProductQueryDTO } from './dto/get-product-query.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GetProductsByCategoryApiDocs } from './decorators/GetProductsByCategory.decorator';
import { XDomainGuard } from 'src/guards/x-domain.guard';
import { XApiKeyGuard } from 'src/guards/x-api-key.guard';
import { getXDomainHeader } from 'src/helpers/get_xDomain_header.helper';
import { AuthGuard } from 'src/guards/auth.guard';

@ApiTags('Products')
@ApiBearerAuth('JWT-auth')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('/debug-sentry')
  getError() {
    throw new Error('My first Sentry error!');
  }

  // curl -X GET "http://localhost:3000/api/products?category=tires&page=1&limit=10&sortdBy=price_asc" -H "X-Domain: domain.ru"
  // curl -G "http://localhost:3000/api/products" \
  // -H "X-Domain: test.ru" \
  // --data-urlencode "category=tires" \
  // --data-urlencode "page=1" \
  // --data-urlencode "limit=10" \
  // --data-urlencode "sortdBy=price_asc"
  @Get()
  @GetProductsByCategoryApiDocs()
  @UseGuards(XDomainGuard, XApiKeyGuard, AuthGuard)
  async findAllProductsByCategory(
    @Query() query: GetProductQueryDTO,
    @Req() req: Request,
  ) {
    const xDomain = getXDomainHeader(req);
    return await this.productsService.findAllProductsByCategory(query, xDomain);
  }
}
