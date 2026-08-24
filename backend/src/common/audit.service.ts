import { Injectable, Logger } from '@nestjs/common';
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

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  async log(data: AuditLogData): Promise<void> {
    try {
      await this.prisma.userActivity.create({
        data: {
          userId: data.userId,
          email: data.email || '',
          name: data.name || '',
          action: data.action,
          details: data.details,
        },
      });

      this.logger.debug(`Audit log: ${data.action} by user ${data.userId}`);
    } catch (error) {
      // Don't fail the main operation if audit logging fails
      this.logger.error(`Failed to create audit log: ${error.message}`);
    }
  }

  async logLogin(userId: string, email: string, name: string): Promise<void> {
    await this.log({
      userId,
      email,
      name,
      action: 'login',
      details: `User logged in at ${new Date().toISOString()}`,
    });
  }

  async logLogout(userId: string, email: string): Promise<void> {
    await this.log({
      userId,
      email,
      action: 'logout',
      details: `User logged out at ${new Date().toISOString()}`,
    });
  }

  async logVote(userId: string, electionId: string, candidateId: string): Promise<void> {
    await this.log({
      userId,
      action: 'vote_cast',
      details: `Voted in election ${electionId} for candidate ${candidateId}`,
    });
  }

  async logApplicationCreate(userId: string, electionId: string, positionId: string): Promise<void> {
    await this.log({
      userId,
      action: 'application_created',
      details: `Applied for position ${positionId} in election ${electionId}`,
    });
  }

  async logApplicationStatusChange(
    adminUserId: string,
    applicationId: string,
    oldStatus: string,
    newStatus: string,
  ): Promise<void> {
    await this.log({
      userId: adminUserId,
      action: 'application_status_changed',
      details: `Changed application ${applicationId} status from ${oldStatus} to ${newStatus}`,
    });
  }

  async logElectionCreate(userId: string, electionId: string, title: string): Promise<void> {
    await this.log({
      userId,
      action: 'election_created',
      details: `Created election "${title}" (${electionId})`,
    });
  }

  async logElectionStatusChange(
    userId: string,
    electionId: string,
    oldStatus: string,
    newStatus: string,
  ): Promise<void> {
    await this.log({
      userId,
      action: 'election_status_changed',
      details: `Changed election ${electionId} status from ${oldStatus} to ${newStatus}`,
    });
  }

  async logFailedLogin(email: string, ipAddress?: string): Promise<void> {
    await this.log({
      userId: 'anonymous',
      email,
      action: 'failed_login',
      details: `Failed login attempt for ${email} from ${ipAddress || 'unknown IP'}`,
    });
  }
}
