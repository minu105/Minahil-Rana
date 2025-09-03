import { Body, Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async getById(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) return { message: 'User not found' };
    return { id: user.id, name: user.name, email: user.email, role: user.role, loyaltyPoints: user.loyaltyPoints };
  }

  // SUPERADMIN-only: change a user's role (e.g., CUSTOMER <-> ADMIN)
  @Patch(':id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  async updateRole(@Param('id') id: string, @Body() body: UpdateUserRoleDto) {
    await this.usersService.setRole(id, body.role as any);
    return { success: true };
  }
}
