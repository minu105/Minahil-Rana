import { Module } from '@nestjs/common';
import { AppGateway } from './app.gateway';
import { PresenceService } from './presence.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [AppGateway, PresenceService],
  exports: [AppGateway, PresenceService],
})
export class RealtimeModule {}
