import { Injectable, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateApplicationDto, UpdateApplicationStatusDto } from './applications.dto';
import { ResultsGateway } from '../results/results.gateway';

@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  constructor(
    private prisma: PrismaService,
    private resultsGateway: ResultsGateway,
  ) {}

  /**
   * Submit a new application
   */
  async create(dto: CreateApplicationDto, userId: string) {
    // Verify position exists and is open
    const position = await this.prisma.electionPosition.findUnique({
      where: { id: dto.positionId },
    });

    if (!position) {
      throw new BadRequestException('Position not found');
    }

    if (position.electionId !== dto.electionId) {
      throw new BadRequestException('The position does not belong to this election');
    }

    const election = await this.prisma.election.findUnique({ where: { id: dto.electionId } });
    if (!election) {
      throw new BadRequestException('Election not found');
    }
    const now = new Date();
    if (!['scheduled', 'active'].includes(election.status) || now < election.startsAt || now > election.endsAt) {
      throw new BadRequestException('Applications are not open for this election');
    }

    if (!position.isOpen) {
      throw new BadRequestException('This position is not currently accepting applications');
    }

    // Check if user already applied for this position
    const existingApplication = await this.prisma.electionApplication.findUnique({
      where: {
        positionId_userId: {
          positionId: dto.positionId,
          userId,
        },
      },
    });

    if (existingApplication) {
      throw new BadRequestException('You have already applied for this position');
    }

    // Check if position has reached maximum applicants
    const applicationCount = await this.prisma.electionApplication.count({
      where: {
        positionId: dto.positionId,
      },
    });

    if (applicationCount >= position.maxApplicants) {
      throw new BadRequestException(
        `This position has reached its maximum number of applicants (${position.maxApplicants})`,
      );
    }

    // Create application
    const application = await this.prisma.electionApplication.create({
      data: {
        positionId: dto.positionId,
        electionId: dto.electionId,
        userId,
        name: dto.name,
        email: dto.email,
        county: dto.county,
        constituency: dto.constituency,
        age: dto.age,
        description: dto.description,
        reasonForApplying: dto.reasonForApplying,
        changeChampion: dto.changeChampion,
        comments: dto.comments,
        status: 'pending',
      },
      include: {
        position: true,
        user: { select: { id: true, email: true, name: true } },
      },
    });

    // Track user activity
    await this.prisma.userActivity.create({
      data: {
        userId,
        email: dto.email,
        name: dto.name,
        action: 'application_submitted',
        details: `Applied for position: ${position.title}`,
      },
    });

    // Broadcast new application to admin via WebSocket
    this.resultsGateway.broadcastNewApplication(dto.electionId, application);

    return application;
  }

  /**
   * Get user's own applications
   */
  async findByUser(userId: string) {
    return this.prisma.electionApplication.findMany({
      where: { userId },
      include: {
        position: true,
        election: true,
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  /**
   * Get all applications (admin)
   */
  async findAll(filters?: {
    electionId?: string;
    positionId?: string;
    status?: string;
    county?: string;
  }) {
    const where: any = {};

    if (filters?.electionId) where.electionId = filters.electionId;
    if (filters?.positionId) where.positionId = filters.positionId;
    if (filters?.status) where.status = filters.status;
    if (filters?.county) where.county = filters.county;

    return this.prisma.electionApplication.findMany({
      where,
      include: {
        position: true,
        election: true,
        user: { select: { id: true, email: true, name: true } },
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  /**
   * Get a single application
   */
  async findOne(id: string) {
    return this.prisma.electionApplication.findUnique({
      where: { id },
      include: {
        position: true,
        election: true,
        user: { select: { id: true, email: true, name: true } },
      },
    });
  }

  /**
   * Update application status (admin only)
   */
  async updateStatus(id: string, dto: UpdateApplicationStatusDto, userId: string, userRole: string) {
    // Authorization check - only admins can update status
    if (userRole !== 'ADMIN') {
      throw new ForbiddenException('Only admins can update application status');
    }

    const application = await this.prisma.electionApplication.findUnique({
      where: { id },
      include: { position: true },
    });

    if (!application) {
      throw new BadRequestException('Application not found');
    }

    this.logger.log(`Admin ${userId} updating application ${id} status to ${dto.status}`);

    const updated = await this.prisma.electionApplication.update({
      where: { id },
      data: { status: dto.status },
      include: {
        position: true,
        election: true,
        user: { select: { id: true, email: true, name: true } },
      },
    });

    // Broadcast status update to all connected clients
    try {
      this.resultsGateway.broadcastApplicationStatusUpdate(
        application.electionId,
        updated,
      );
    } catch (error) {
      this.logger.error(`Failed to broadcast application status update: ${error.message}`);
    }

    return updated;
  }

  /**
   * Get application count by status for an election
   */
  async getApplicationStats(electionId: string) {
    const stats = await this.prisma.electionApplication.groupBy({
      by: ['status'],
      where: { electionId },
      _count: {
        id: true,
      },
    });

    return stats.reduce(
      (acc, stat) => {
        acc[stat.status] = stat._count.id;
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  /**
   * Get applications for a specific position
   */
  async findByPosition(positionId: string) {
    return this.prisma.electionApplication.findMany({
      where: { positionId },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
      orderBy: { appliedAt: 'desc' },
    });
  }
}
