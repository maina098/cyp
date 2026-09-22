"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ResultsGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma.service");
const MAX_CONNECTIONS = 1000;
const allowedOrigins = (process.env.FRONTEND_URL ?? 'http://localhost:3000,http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
const publicSiteOrigin = 'https://www.coastalyouthparliament.org';
if (!allowedOrigins.includes(publicSiteOrigin)) {
    allowedOrigins.push(publicSiteOrigin);
}
let ResultsGateway = ResultsGateway_1 = class ResultsGateway {
    jwtService;
    prisma;
    server;
    logger = new common_1.Logger(ResultsGateway_1.name);
    connectedClients = new Map();
    totalConnections = 0;
    constructor(jwtService, prisma) {
        this.jwtService = jwtService;
        this.prisma = prisma;
    }
    async handleConnection(client) {
        if (this.totalConnections >= MAX_CONNECTIONS) {
            this.logger.warn(`Connection rejected: max connections reached (${MAX_CONNECTIONS})`);
            client.emit('error', { message: 'Server busy. Please try again later.' });
            client.disconnect();
            return;
        }
        const cookieToken = client.handshake.headers.cookie
            ?.split(';')
            .map((value) => value.trim())
            .find((value) => value.startsWith('cyp_session='))
            ?.slice('cyp_session='.length);
        const token = cookieToken;
        if (!token) {
            client.data.user = null;
            client.data.isPublic = true;
            this.totalConnections++;
            this.logger.log(`Client ${client.id} connected as public observer`);
            return;
        }
        try {
            const payload = this.jwtService.verify(token);
            const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
            if (!user || (payload.ver ?? 0) !== user.sessionVersion)
                throw new Error('Session revoked');
            client.data.user = payload;
            this.totalConnections++;
            this.logger.log(`Client ${client.id} connected (user: ${payload.email})`);
        }
        catch (err) {
            this.logger.warn(`Client ${client.id} rejected: invalid token`);
            client.emit('error', { message: 'Unauthorized: Invalid token' });
            client.disconnect();
            return;
        }
    }
    handleDisconnect(client) {
        if (this.totalConnections > 0) {
            this.totalConnections--;
        }
        if (client.data.user) {
            this.logger.log(`Client ${client.id} disconnected (user: ${client.data.user.email})`);
        }
        else {
            this.logger.log(`Client ${client.id} disconnected as public observer`);
        }
        this.connectedClients.delete(client.id);
    }
    handleSubscribe(electionId, client) {
        if (!electionId) {
            return { ok: false, error: 'Election ID required' };
        }
        client.join(`election:${electionId}`);
        this.trackClientSubscription(client.id, `election:${electionId}`);
        this.logger.debug(`Client ${client.id} subscribed to election ${electionId}`);
        return { ok: true, electionId };
    }
    handleSubscribeApplications(electionId, client) {
        if (!electionId) {
            return { ok: false, error: 'Election ID required' };
        }
        if (client.data.user?.role !== 'ADMIN') {
            this.logger.warn(`Non-admin user attempted to subscribe to applications`);
            return { ok: false, error: 'Forbidden: Admin access required' };
        }
        client.join(`applications:${electionId}`);
        this.trackClientSubscription(client.id, `applications:${electionId}`);
        return { ok: true, electionId };
    }
    handleSubscribeSystemActivity(client) {
        if (client.data.user?.role !== 'ADMIN') {
            this.logger.warn(`Non-admin user attempted to subscribe to system activity`);
            return { ok: false, error: 'Forbidden: Admin access required' };
        }
        client.join('system:activity');
        this.trackClientSubscription(client.id, 'system:activity');
        return { ok: true };
    }
    broadcastResults(electionId, results) {
        this.server.to(`election:${electionId}`).emit('resultsUpdate', {
            results,
            timestamp: new Date(),
            type: 'results_update',
        });
    }
    broadcastStatusChange(election) {
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
    broadcastNewApplication(electionId, application) {
        if (!this.server) {
            return;
        }
        this.server.to(`applications:${electionId}`).emit('newApplication', {
            application,
            timestamp: new Date(),
            type: 'new_application',
        });
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
    broadcastApplicationStatusUpdate(electionId, application) {
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
    broadcastPositionStatusChange(electionId, position) {
        if (!this.server) {
            return;
        }
        this.server.to(`applications:${electionId}`).emit('positionStatusChange', {
            position,
            timestamp: new Date(),
            type: 'position_status_change',
        });
    }
    broadcastPositionsUpdate(electionId, positions) {
        if (!this.server) {
            return;
        }
        this.server.to(`applications:${electionId}`).emit('positionsUpdate', {
            positions,
            timestamp: new Date(),
            type: 'positions_update',
        });
    }
    broadcastSystemActivity(activity) {
        if (!this.server) {
            return;
        }
        this.server.to('system:activity').emit('systemActivity', {
            ...activity,
            timestamp: new Date(),
        });
    }
    broadcastUserLogin(user) {
        this.broadcastSystemActivity({
            type: 'user_login',
            data: { email: user.email, name: user.name },
        });
    }
    broadcastUserLogout(userId) {
        this.broadcastSystemActivity({
            type: 'user_logout',
            data: { userId },
        });
    }
    broadcastVoteCasted(electionId, candidateName) {
        this.broadcastSystemActivity({
            type: 'vote_casted',
            data: { electionId, candidateName },
        });
        this.server.to(`election:${electionId}`).emit('voteCasted', {
            candidateName,
            timestamp: new Date(),
        });
    }
    trackClientSubscription(clientId, room) {
        if (!this.connectedClients.has(clientId)) {
            this.connectedClients.set(clientId, new Set());
        }
        this.connectedClients.get(clientId)?.add(room);
    }
    getConnectedClientsCount() {
        return this.totalConnections;
    }
    getConnectionsPerRoom(room) {
        let count = 0;
        for (const rooms of this.connectedClients.values()) {
            if (rooms.has(room))
                count++;
        }
        return count;
    }
};
exports.ResultsGateway = ResultsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ResultsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribeElection'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ResultsGateway.prototype, "handleSubscribe", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribeApplications'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ResultsGateway.prototype, "handleSubscribeApplications", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribeSystemActivity'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ResultsGateway.prototype, "handleSubscribeSystemActivity", null);
exports.ResultsGateway = ResultsGateway = ResultsGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: allowedOrigins,
            credentials: true
        },
        namespace: '/results',
        maxHttpBufferSize: 1e6,
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService, prisma_service_1.PrismaService])
], ResultsGateway);
//# sourceMappingURL=results.gateway.js.map