import { Controller, Get, Post, Req, UseGuards, Query, Patch, Param, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles, Role } from '../auth/roles.decorator';
import { OrderStatus } from './schemas/order.schema';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Post('checkout')
  checkout(@Req() req: any) {
    return this.service.checkout(req.user.id);
  }

  @Get()
  list(@Req() req: any) {
    return this.service.listMine(req.user.id);
  }

  // Admin endpoints
  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  listAll(
    @Query('status') status?: OrderStatus,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.adminList({ status, from, to, q, page: Number(page) || 1, limit: Number(limit) || 20 });
  }

  @Patch('admin/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  updateStatus(@Param('id') id: string, @Body('status') status: OrderStatus) {
    return this.service.adminUpdateStatus(id, status);
  }

  @Get('admin/metrics/overview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  overview() {
    return this.service.metricsOverview();
  }

  @Get('admin/metrics/sales-series')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  salesSeries(@Query('from') from?: string, @Query('to') to?: string, @Query('granularity') granularity: 'day' | 'month' = 'day') {
    return this.service.salesSeries({ from, to, granularity });
  }

  @Get('admin/metrics/top-products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  topProducts(@Query('limit') limit?: string, @Query('from') from?: string, @Query('to') to?: string) {
    return this.service.topProducts({ limit: Number(limit) || 5, from, to });
  }
}
