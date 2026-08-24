import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
export declare class ResultsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    server: Server;
    private readonly logger;
    private connectedClients;
    private totalConnections;
    constructor(jwtService: JwtService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleSubscribe(electionId: string, client: Socket): {
        ok: boolean;
        error: string;
        electionId?: undefined;
    } | {
        ok: boolean;
        electionId: string;
        error?: undefined;
    };
    handleSubscribeApplications(electionId: string, client: Socket): {
        ok: boolean;
        error: string;
        electionId?: undefined;
    } | {
        ok: boolean;
        electionId: string;
        error?: undefined;
    };
    handleSubscribeSystemActivity(client: Socket): {
        ok: boolean;
        error: string;
    } | {
        ok: boolean;
        error?: undefined;
    };
    broadcastResults(electionId: string, results: any[]): void;
    broadcastStatusChange(election: {
        id: string;
        status: string;
    }): void;
    broadcastNewApplication(electionId: string, application: any): void;
    broadcastApplicationStatusUpdate(electionId: string, application: any): void;
    broadcastPositionStatusChange(electionId: string, position: any): void;
    broadcastPositionsUpdate(electionId: string, positions: any[]): void;
    broadcastSystemActivity(activity: any): void;
    broadcastUserLogin(user: {
        id: string;
        email: string;
        name: string;
    }): void;
    broadcastUserLogout(userId: string): void;
    broadcastVoteCasted(electionId: string, candidateName: string): void;
    private trackClientSubscription;
    getConnectedClientsCount(): number;
    getConnectionsPerRoom(room: string): number;
}
