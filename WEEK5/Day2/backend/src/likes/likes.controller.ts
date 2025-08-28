import { Controller, Delete, Param, Post, UseGuards } from '@nestjs/common';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('likes')
export class LikesController {
  constructor(private readonly likes: LikesService) {}

  @Post(':commentId')
  like(@Param('commentId') commentId: string, @CurrentUser() me: any) {
    return this.likes.like(commentId, me.id);
  }

  @Delete(':commentId')
  unlike(@Param('commentId') commentId: string, @CurrentUser() me: any) {
    return this.likes.unlike(commentId, me.id);
  }
}
