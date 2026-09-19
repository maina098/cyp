import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsJwtGuard } from '../common/guards/ws-jwt.guard';
import { PrismaService } from '../prisma.service';

const MAX_CONNECTIONS = 1000;
const allowedOrigins = (process.env.FRONTEND_URL ?? 'http://localhost:3000,http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const publicSiteOrigin = 'https://www.coastalyouthparliament.org';
if (!allowedOrigins.includes(publicSiteOrigin)) {
  allowedOrigins.push(publicSiteOrigin);
}

@WebSocketGateway({
  cors: { 
    origin: allowedOrigins,
    credentials: true 
  },
  namespace: '/results',
  maxHttpBufferSize: 1e6, // 1 MB max payload
})
export class ResultsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ResultsGateway.name);
  private connectedClients = new Map<string, Set<string>>();
  private totalConnections = 0;

  constructor(private jwtService: JwtService, private prisma: PrismaService) {}

  async handleConnection(client: Socket) {
    // Connection limit check
    if (this.totalConnections >= MAX_CONNECTIONS) {
      this.logger.warn(`Connection rejected: max connections reached (${MAX_CONNECTIONS})`);
      client.emit('error', { message: 'Server busy. Please try again later.' });
      client.disconnect();
      return;
    }

    // Extract and verify token
    const cookieToken = client.handshake.headers.cookie
      ?.split(';')
      .map((value) => value.trim())
      .find((value) => value.startsWith('cyp_session='))
      ?.slice('cyp_session='.length);
    const token = cookieToken;

    if (!token) {
      this.logger.warn(`Client ${client.id} rejected: missing token`);
      client.emit('error', { message: 'Unauthorized: Authentication required' });
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify(token);
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || (payload.ver ?? 0) !== user.sessionVersion) throw new Error('Session revoked');
      client.data.user = payload;
      this.totalConnections++;
      this.logger.log(`Client ${client.id} connected (user: ${payload.email})`);
    } catch (err) {
      this.logger.warn(`Client ${client.id} rejected: invalid token`);
      client.emit('error', { message: 'Unauthorized: Invalid token' });
      client.disconnect();
      return;
    }
  }

  handleDisconnect(client: Socket) {
    if (client.data.user) {
      this.totalConnections--;
      this.logger.log(`Client ${client.id} disconnected (user: ${client.data.user.email})`);
    }
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('subscribeElection')
  handleSubscribe(
    @MessageBody() electionId: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (!electionId) {
      return { ok: false, error: 'Election ID required' };
    }

    // Verify user is authenticated
    if (!client.data.user) {
      return { ok: false, error: 'Unauthorized' };
    }

    client.join(`election:${electionId}`);
    this.trackClientSubscription(client.id, `election:${electionId}`);
    this.logger.debug(`Client ${client.id} subscribed to election ${electionId}`);
    return { ok: true, electionId };
  }

  @SubscribeMessage('subscribeApplications')
  handleSubscribeApplications(
    @MessageBody() electionId: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (!electionId) {
      return { ok: false, error: 'Election ID required' };
    }

    // Only admins can subscribe to applications
    if (client.data.user?.role !== 'ADMIN') {
      this.logger.warn(`Non-admin user attempted to subscribe to applications`);
      return { ok: false, error: 'Forbidden: Admin access required' };
    }

    client.join(`applications:${electionId}`);
    this.trackClientSubscription(client.id, `applications:${electionId}`);
    return { ok: true, electionId };
  }

  @SubscribeMessage('subscribeSystemActivity')
  handleSubscribeSystemActivity(
    @ConnectedSocket() client: Socket,
  ) {
    // Only admins can subscribe to system activity
    if (client.data.user?.role !== 'ADMIN') {
      this.logger.warn(`Non-admin user attempted to subscribe to system activity`);
      return { ok: false, error: 'Forbidden: Admin access required' };
    }

    client.join('system:activity');
    this.trackClientSubscription(client.id, 'system:activity');
    return { ok: true };
  }

  broadcastResults(electionId: string, results: any[]) {
    this.server.to(`election:${electionId}`).emit('resultsUpdate', {
      results,
      timestamp: new Date(),
      type: 'results_update',
    });
  }

  broadcastStatusChange(election: { id: string; status: string }) {
    if (!this.server) {
      return;
    }
    this.server.to(`election:${election.id}`).emit('statusUpdate', {
      status: election.status,
      electionId: election.id,
      timestamp: new Date(),
      type: 'election_status_change',
    });
  }

  broadcastNewApplication(electionId: string, application: any) {
    if (!this.server) {
      return;
    }
    this.server.to(`applications:${electionId}`).emit('newApplication', {
      application,
      timestamp: new Date(),
      type: 'new_application',
    });

    // Also broadcast to system activity (admin only)
    this.broadcastSystemActivity({
      type: 'new_application',
      data: {
        applicantName: application.name,
        email: application.email,
        position: application.position?.title,
        county: application.county,
      },
    });
  }

  broadcastApplicationStatusUpdate(electionId: string, application: any) {
    if (!this.server) {
      return;
    }
    this.server.to(`applications:${electionId}`).emit('applicationStatusUpdate', {
      application,
      timestamp: new Date(),
      type: 'application_status_update',
    });

    this.broadcastSystemActivity({
      type: 'application_status_update',
      data: {
        applicantName: application.name,
        status: application.status,
        position: application.position?.title,
      },
    });
  }

  broadcastPositionStatusChange(electionId: string, position: any) {
    if (!this.server) {
      return;
    }
    this.server.to(`applications:${electionId}`).emit('positionStatusChange', {
      position,
      timestamp: new Date(),
      type: 'position_status_change',
    });
  }

  broadcastPositionsUpdate(electionId: string, positions: any[]) {
    if (!this.server) {
      return;
    }
    this.server.to(`applications:${electionId}`).emit('positionsUpdate', {
      positions,
      timestamp: new Date(),
      type: 'positions_update',
    });
  }

  broadcastSystemActivity(activity: any) {
    if (!this.server) {
      return;
    }
    this.server.to('system:activity').emit('systemActivity', {
      ...activity,
      timestamp: new Date(),
    });
  }

  broadcastUserLogin(user: { id: string; email: string; name: string }) {
    this.broadcastSystemActivity({
      type: 'user_login',
      data: { email: user.email, name: user.name },
    });
  }

  broadcastUserLogout(userId: string) {
    this.broadcastSystemActivity({
      type: 'user_logout',
      data: { userId },
    });
  }

  broadcastVoteCasted(electionId: string, candidateName: string) {
    this.broadcastSystemActivity({
      type: 'vote_casted',
      data: { electionId, candidateName },
    });

    this.server.to(`election:${electionId}`).emit('voteCasted', {
      candidateName,
      timestamp: new Date(),
    });
  }

  private trackClientSubscription(clientId: string, room: string) {
    if (!this.connectedClients.has(clientId)) {
      this.connectedClients.set(clientId, new Set());
    }
    this.connectedClients.get(clientId)?.add(room);
  }

  getConnectedClientsCount(): number {
    return this.totalConnections;
  }

  getConnectionsPerRoom(room: string): number {
    let count = 0;
    for (const rooms of this.connectedClients.values()) {
      if (rooms.has(room)) count++;
    }
    return count;
  }
}
