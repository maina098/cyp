import { PrismaService } from '../prisma.service';
export interface AuditLogData {
    userId: string;
    action: string;
    email?: string;
    name?: string;
    details?: string;
    ipAddress?: string;
    userAgent?: string;
}
export declare class AuditService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    log(data: AuditLogData): Promise<void>;
    logLogin(userId: string, email: string, name: string): Promise<void>;
    logLogout(userId: string, email: string): Promise<void>;
    logVote(userId: string, electionId: string, candidateId: string): Promise<void>;
    logApplicationCreate(userId: string, electionId: string, positionId: string): Promise<void>;
    logApplicationStatusChange(adminUserId: string, applicationId: string, oldStatus: string, newStatus: string): Promise<void>;
    logElectionCreate(userId: string, electionId: string, title: string): Promise<void>;
    logElectionStatusChange(userId: string, electionId: string, oldStatus: string, newStatus: string): Promise<void>;
    logFailedLogin(email: string, ipAddress?: string): Promise<void>;
}
