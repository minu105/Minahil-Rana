import { Body, Controller, Delete, Get, Param, Post, Patch, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { NotificationsService } from '../notifications/notifications.service';

@UseGuards(JwtAuthGuard)
@Controller('comments')
export class CommentsController {
  constructor(
    private readonly comments: CommentsService,
    private readonly notifications: NotificationsService,
  ) {}

  @Get()
  listTop() { return this.comments.listTop(); }

  @Get(':id/replies')
  listReplies(@Param('id') id: string) { return this.comments.listReplies(id); }

  @Post()
  async createTop(@Body() body: { content: string }, @CurrentUser() me: any) {
    const saved = await this.comments.create({ content: body.content, authorId: me.id, parentId: null });
    await this.notifications.onNewCommentBroadcast(saved, me.id);
    return saved;
  }

  @Post(':id/replies')
  async reply(
    @Param('id') id: string,
    @Body() body: { content: string },
    @CurrentUser() me: any
  ) {
    const saved = await this.comments.create({
      content: body.content,
      authorId: me.id,
      parentId: id,
    });

    await this.notifications.onReplyNotifyParent(saved, me.id);

    return saved;
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() me: any) {
    await this.comments.delete(id, me.id);
    return { message: 'Comment deleted successfully' };
  }

  // ✨ New: Update Comment (only author can edit)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { content: string },
    @CurrentUser() me: any,
  ) {
    return this.comments.update(id, body.content, me.id);
  }
}
