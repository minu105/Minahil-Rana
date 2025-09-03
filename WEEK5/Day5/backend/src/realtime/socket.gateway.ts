import {
  ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect,
  SubscribeMessage, WebSocketGateway, WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';

@WebSocketGateway({
  cors: { 
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
  }
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    console.log('Client attempting to connect:', client.id);
    const token = (client.handshake.auth && client.handshake.auth.token) ||
                  (client.handshake.headers['authorization']?.toString().replace('Bearer ', ''));
    
    if (token) {
      try {
        const user: any = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
        (client as any).user = { _id: user.sub, email: user.email, name: user.name };
        client.join(`user:${user.sub}`);
        console.log(`User ${user.email} connected and joined room user:${user.sub}`);
      } catch (e: any) {
        console.error('JWT verification failed:', e.message);
      }
    } else {
      console.log('No token provided for connection');
    }
  }

  handleDisconnect(client: Socket) {}

  emitToRoom(room: string, event: string, payload: any) {
    console.log(`Emitting to room ${room}:`, event, payload);
    this.server.to(room).emit(event, payload);
  }

  emitToUser(userId: string, event: string, payload: any) {
    this.server.to(`user:${userId}`).emit(event, payload);
  }

  broadcastToAll(event: string, payload: any) {
    this.server.emit(event, payload);
  }

  @SubscribeMessage('join_auction')
  joinAuction(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    client.join(`auction:${data.auctionId}`);
    return { ok: true };
  }

  @SubscribeMessage('leave_auction')
  leaveAuction(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    client.leave(`auction:${data.auctionId}`);
    return { ok: true };
  }

}
