import { Controller, Get, Param, Patch, Body, UseGuards } from '@nestjs/common';
import { UserService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() me: any) { return this.users.findById(me.id); }

  @Get(':id')
  profile(@Param('id') id: string) { return this.users.findByEmail(id); }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  update(@CurrentUser() me: any, @Body() dto: UpdateProfileDto) {
    return this.users.updateProfile(me.id, dto);
  }

  @Get('by-id/:id')
  getById(@Param('id') id: string) { return this.users.findById(id); }

}
