import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PresenceService } from './presence.service';

@WebSocketGateway({ cors: { origin: [process.env.CORS_ORIGIN || 'http://localhost:3000'], credentials: true } })
export class AppGateway {
  @WebSocketServer() server: Server;
  constructor(private readonly jwt: JwtService, private readonly presence: PresenceService) {}

  handleConnection(client: Socket) {
    const raw = (client.handshake as any)?.auth?.token || client.handshake.headers?.authorization || '';
    const token = (raw || '').toString().replace(/^Bearer\s+/i, '');
    try {
      const payload: any = this.jwt.verify(token, { secret: process.env.JWT_SECRET as string });
      client.data.user = { id: payload.sub, email: payload.email, name: payload.name };
      this.presence.add(payload.sub, client.id);
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const user = client.data.user;
    if (user?.id) this.presence.remove(user.id, client.id);
  }
}
