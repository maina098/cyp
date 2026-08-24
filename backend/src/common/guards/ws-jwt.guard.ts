import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient<Socket>();
    
    // Extract token from handshake auth or headers
    const token =
      client.handshake.auth?.token ||
      client.handshake.headers?.authorization?.replace('Bearer ', '') ||
      client.handshake.query?.token as string;

    if (!token) {
      this.logger.warn(`WebSocket connection rejected: missing token from ${client.id}`);
      client.emit('error', { message: 'Unauthorized: Authentication required' });
      client.disconnect();
      return false;
    }

    try {
      const payload = this.jwtService.verify(token);
      client.data.user = payload; // Attach user to socket for later use
      this.logger.debug(`WebSocket authenticated for user ${payload.sub}`);
      return true;
    } catch (err) {
      this.logger.warn(`WebSocket connection rejected: invalid token from ${client.id}`);
      client.emit('error', { message: 'Unauthorized: Invalid token' });
      client.disconnect();
      return false;
    }
  }
}
