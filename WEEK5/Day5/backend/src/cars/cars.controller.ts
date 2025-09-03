import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CarsService } from './cars.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { CreateCarDto } from './dtos';

@Controller('api/cars')
export class CarsController {
  constructor(private cars: CarsService) {}

  @Get()
  list(@Query() q: any) { return this.cars.list(q); }

  @Get(':id')
  get(@Param('id') id: string) { return this.cars.findOne(id); }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateCarDto) {
    return this.cars.create(user._id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  patch(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    return this.cars.update(user._id, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  del(@CurrentUser() user: any, @Param('id') id: string) {
    return this.cars.remove(user._id, id);
  }
}
