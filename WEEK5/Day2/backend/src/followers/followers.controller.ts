import { Controller, Post, Delete, Get, Param, Body } from '@nestjs/common';
import { FollowersService } from './followers.service';

@Controller('followers')
export class FollowersController {
  constructor(private readonly followersService: FollowersService) {}

  @Post(':userId')
  async follow(@Param('userId') userId: string, @Body('me') me: string) {
    return this.followersService.follow(me, userId);
  }

  @Delete(':userId')
  async unfollow(@Param('userId') userId: string, @Body('me') me: string) {
    return this.followersService.unfollow(me, userId);
  }

  @Get(':userId/status/:meId')
  async status(
    @Param('userId') userId: string,
    @Param('meId') meId: string,
  ) {
    return this.followersService.status(meId, userId);
  }

  @Get(':userId/counts')
  async getCounts(@Param('userId') userId: string) {
    return this.followersService.counts(userId);
  }
}
