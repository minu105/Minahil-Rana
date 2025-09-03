import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3000' } })
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  emitSale(productId: string, message: string) {
    this.server.emit('sale', { productId, message });
  }

  emitOrderStatus(userId: string, payload: any) {
    this.server.to(userId).emit('order_status', payload);
  }
}
