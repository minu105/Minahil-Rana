import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto, UpdateVariantsDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Get()
  list(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('sort') sort?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 12,
    @Query('colors') colors?: string | string[],
    @Query('sizes') sizes?: string | string[],
    @Query('styles') styles?: string | string[],
    @Query('priceMin') priceMin?: string,
    @Query('priceMax') priceMax?: string,
    @Query('inStock') inStock?: string,
  ) {
    const arr = (val?: string | string[]) => (Array.isArray(val) ? val : val ? [val] : undefined);
    return this.service.list({
      search,
      category,
      sort,
      page: Number(page),
      limit: Number(limit),
      colors: arr(colors),
      sizes: arr(sizes),
      styles: arr(styles),
      priceMin: priceMin != null ? Number(priceMin) : undefined,
      priceMax: priceMax != null ? Number(priceMax) : undefined,
      inStock: inStock === 'true' ? true : undefined,
    });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Patch(':id/stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  adjustStock(@Param('id') id: string, @Body() body: { delta: number }) {
    return this.service.adjustStock(id, body.delta);
  }

  // ----- Variants Management -----
  @Patch(':id/variants')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  updateVariants(@Param('id') id: string, @Body() body: UpdateVariantsDto) {
    return this.service.updateVariants(id, body);
  }

  @Patch(':id/variants/:sku/stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  adjustVariantStock(@Param('id') id: string, @Param('sku') sku: string, @Body() body: { delta: number }) {
    return this.service.adjustVariantStock(id, sku, body.delta);
  }

  @Patch(':id/sale')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  setSale(
    @Param('id') id: string,
    @Body() body: { onSale: boolean; salePrice?: number; discountPercent?: number },
  ) {
    return this.service.setSale(id, body);
  }

  // Public: new arrivals and top selling
  @Get('lists/new-arrivals')
  newArrivals(@Query('limit') limit = 6) {
    return this.service.newArrivals(Number(limit));
  }

  @Get('lists/top-selling')
  topSelling(@Query('limit') limit = 6) {
    return this.service.topSelling(Number(limit));
  }

  // Admin/Superadmin: manage product categories
  @Patch(':id/categories/add')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  addCategories(@Param('id') id: string, @Body() body: { categoryIds: string[] }) {
    return this.service.addCategories(id, body.categoryIds || []);
  }

  @Patch(':id/categories/remove')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  removeCategories(@Param('id') id: string, @Body() body: { categoryIds: string[] }) {
    return this.service.removeCategories(id, body.categoryIds || []);
  }
}
