import { Module } from '@nestjs/common';
import { RealtimeGateway } from './socket.gateway';

@Module({
  providers: [RealtimeGateway],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
