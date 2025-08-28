import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const raw: string | undefined =
      client.handshake?.auth?.token ||
      client.handshake?.headers?.authorization ||
      client.handshake?.query?.token;
    if (!raw) throw new UnauthorizedException('Missing token');
    const token = raw.replace(/^Bearer\s+/i, '');
    try {
      const payload = this.jwt.verify(token, { secret: process.env.JWT_SECRET as string });
      client.data.user = { id: payload.sub, email: payload.email, name: payload.name };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
