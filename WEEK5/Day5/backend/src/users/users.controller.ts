import { Body, Controller, Get, Patch, Post, UseGuards, UseInterceptors, UploadedFile, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
// Avoid strict typing on multer/express to prevent missing type packages from breaking build
type ReqAny = any;

@Controller('api/users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: any) { return this.users.findById(user._id); }

  @Patch('me')
  update(@CurrentUser() user: any, @Body() body: any) {
    delete body.passwordHash;
    return this.users.updateMe(user._id, body);
  }

  // Fetch any user by id (auth required). Used by frontend to enrich bidder profiles.
  @Get(':id')
  getById(@Param('id') id: string) { return this.users.findById(id); }

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req: ReqAny, file: any, cb: (error: Error | null, destination: string) => void) => {
        const dir = `${process.cwd()}/uploads/avatars`;
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: (req: ReqAny, file: any, cb: (error: Error | null, filename: string) => void) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + extname(file.originalname));
      }
    })
  }))
  uploadAvatar(@CurrentUser() user: any, @UploadedFile() file: any) {
    const url = `/uploads/avatars/${file.filename}`;
    return this.users.updateMe(user._id, { avatarUrl: url });
  }
}
