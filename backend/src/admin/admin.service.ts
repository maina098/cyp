import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ResultsGateway } from '../results/results.gateway';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private prisma: PrismaService,
    private resultsGateway: ResultsGateway,
  ) {}

  async getNews(page: number = 1, limit: number = 20) {
    this.logger.debug(`Fetching news items - page ${page}, limit ${limit}`);
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      this.prisma.news.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.news.count(),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createNews(data: { title: string; slug: string; summary: string; content: string; category: string; imageUrl?: string; published?: boolean }) {
    return this.prisma.news.create({ data: { ...data, published: data.published ?? true } });
  }

  async updateNews(id: string, data: Partial<{ title: string; slug: string; summary: string; content: string; category: string; imageUrl: string; published: boolean }>) {
    const item = await this.prisma.news.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('News item not found');

    return this.prisma.news.update({ where: { id }, data });
  }

  async deleteNews(id: string) {
    const item = await this.prisma.news.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('News item not found');

    return this.prisma.news.delete({ where: { id } });
  }

  async getEvents() {
    return this.prisma.event.findMany({
      orderBy: { date: 'asc' },
    });
  }

  async getMemberEventSubmissions() {
    return this.prisma.userEventParticipation.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, profileImageUrl: true } },
        event: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateMemberEventSubmissionStatus(submissionId: string, status: string) {
    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      throw new BadRequestException('Invalid event submission status');
    }

    const submission = await this.prisma.userEventParticipation.findUnique({
      where: { id: submissionId },
      include: { user: true, event: true },
    });
    if (!submission) throw new NotFoundException('Event submission not found');

    const updated = await this.prisma.userEventParticipation.update({
      where: { id: submissionId },
      data: { status },
      include: { user: { select: { id: true, name: true, email: true } }, event: true },
    });
    await this.prisma.userActivity.create({
      data: {
        userId: submission.userId,
        email: submission.user.email,
        name: submission.user.name,
        action: `event_submission_${status.toLowerCase()}`,
        details: `${status} activity submission for ${submission.event.title}`,
      },
    });
    return updated;
  }

  async getMemberCommunityServices() {
    return this.prisma.communityService.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, profileImageUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createEvent(data: { title: string; description: string; location: string; date: Date; status?: string; imageUrl?: string }) {
    return this.prisma.event.create({ data });
  }

  async updateEvent(id: string, data: Partial<{ title: string; description: string; location: string; date: Date; status: string; imageUrl: string }>) {
    const item = await this.prisma.event.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Event not found');

    return this.prisma.event.update({ where: { id }, data });
  }

  async deleteEvent(id: string) {
    const item = await this.prisma.event.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Event not found');

    return this.prisma.event.delete({ where: { id } });
  }

  async getResources() {
    return this.prisma.resource.findMany();
  }

  async createResource(data: { title: string; description?: string; fileUrl: string; category: string; downloadsCount?: number }) {
    return this.prisma.resource.create({ data });
  }

  async updateResource(id: string, data: Partial<{ title: string; description: string; fileUrl: string; category: string; downloadsCount: number }>) {
    const item = await this.prisma.resource.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Resource not found');

    return this.prisma.resource.update({ where: { id }, data });
  }

  async deleteResource(id: string) {
    const item = await this.prisma.resource.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Resource not found');

    return this.prisma.resource.delete({ where: { id } });
  }

  // Election Positions Management
  async createPosition(electionId: string, data: { title: string; description?: string; maxApplicants?: number }) {
    const election = await this.prisma.election.findUnique({ where: { id: electionId } });
    if (!election) {
      throw new NotFoundException('Election not found');
    }

    const existing = await this.prisma.electionPosition.findUnique({
      where: { electionId_title: { electionId, title: data.title } },
    });

    if (existing) {
      throw new BadRequestException('Position already exists for this election');
    }

    const position = await this.prisma.electionPosition.create({
      data: {
        electionId,
        title: data.title,
        description: data.description,
        maxApplicants: data.maxApplicants || 100,
        isOpen: false,
      },
    });

    return position;
  }

  async getPositions(electionId: string) {
    return this.prisma.electionPosition.findMany({
      where: { electionId },
      include: { applications: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async openPosition(electionId: string, positionId: string) {
    const election = await this.prisma.election.findUnique({ where: { id: electionId } });
    if (!election) throw new NotFoundException('Election not found');
    if (!['draft', 'scheduled', 'active'].includes(election.status)) {
      throw new BadRequestException('Applications can only be opened for draft, scheduled, or active elections');
    }

    const position = await this.prisma.electionPosition.findUnique({
      where: { id: positionId },
    });

    if (!position || position.electionId !== electionId) {
      throw new NotFoundException('Position not found');
    }

    const updated = await this.prisma.electionPosition.update({
      where: { id: positionId },
      data: { isOpen: true },
      include: { applications: true },
    });

    this.resultsGateway.broadcastPositionStatusChange(electionId, updated);
    return updated;
  }

  async closePosition(electionId: string, positionId: string) {
    const position = await this.prisma.electionPosition.findUnique({
      where: { id: positionId },
    });

    if (!position || position.electionId !== electionId) {
      throw new NotFoundException('Position not found');
    }

    const updated = await this.prisma.electionPosition.update({
      where: { id: positionId },
      data: { isOpen: false },
      include: { applications: true },
    });

    this.resultsGateway.broadcastPositionStatusChange(electionId, updated);
    return updated;
  }

  async getApplicationsByPosition(positionId: string) {
    const position = await this.prisma.electionPosition.findUnique({
      where: { id: positionId },
    });

    if (!position) {
      throw new NotFoundException('Position not found');
    }

    return this.prisma.electionApplication.findMany({
      where: { positionId },
      include: {
        user: { select: { id: true, email: true, name: true } },
        position: true,
        election: true,
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  async getApplicationStats(electionId: string) {
    const positions = await this.prisma.electionPosition.findMany({
      where: { electionId },
      include: { applications: true },
    });

    const stats = {
      totalApplications: 0,
      byPosition: {} as Record<string, { title: string; count: number; statuses: Record<string, number> }>,
      byStatus: { pending: 0, approved: 0, rejected: 0, withdrawn: 0 },
      byCounty: {} as Record<string, number>,
    };

    for (const position of positions) {
      const appCount = position.applications.length;
      stats.totalApplications += appCount;

      stats.byPosition[position.id] = {
        title: position.title,
        count: appCount,
        statuses: {
          pending: position.applications.filter((a) => a.status === 'pending').length,
          approved: position.applications.filter((a) => a.status === 'approved').length,
          rejected: position.applications.filter((a) => a.status === 'rejected').length,
          withdrawn: position.applications.filter((a) => a.status === 'withdrawn').length,
        },
      };

      for (const app of position.applications) {
        stats.byStatus[app.status] = (stats.byStatus[app.status] || 0) + 1;
        stats.byCounty[app.county] = (stats.byCounty[app.county] || 0) + 1;
      }
    }

    return stats;
  }

  // User Activity Tracking
  async trackUserActivity(userId: string, email: string, name: string, action: string, details?: string) {
    return this.prisma.userActivity.create({
      data: {
        userId,
        email,
        name,
        action,
        details,
      },
    });
  }

  async getUserActivity(limit: number = 50, page: number = 1) {
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      this.prisma.userActivity.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.userActivity.count(),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserActivityStats() {
    const activities = await this.prisma.userActivity.findMany({
      orderBy: { createdAt: 'desc' },
      take: 1000, // Limit for performance
    });

    const stats = {
      totalActivities: activities.length,
      activeUsers: new Set(activities.map(a => a.userId)).size,
      byAction: {} as Record<string, number>,
      recentActivities: activities.slice(0, 20),
    };

    for (const activity of activities) {
      stats.byAction[activity.action] = (stats.byAction[activity.action] || 0) + 1;
    }

    return stats;
  }

  async getUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profileImageUrl: true,
        phone: true,
        county: true,
        constituency: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { activities: true, applications: true, votes: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateUserRole(userId: string, role: string) {
    const normalizedRole = role.toUpperCase();
    if (!['USER', 'ADMIN'].includes(normalizedRole)) {
      throw new BadRequestException('Role must be USER or ADMIN');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id: userId },
      data: { role: normalizedRole },
      select: { id: true, email: true, name: true, role: true },
    });
  }

  // Applications Management for Admin
  async getAllApplications(
    filters?: {
      electionId?: string;
      positionId?: string;
      status?: string;
      county?: string;
    },
    pagination?: { page?: number; limit?: number },
  ) {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 50;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters?.electionId) where.electionId = filters.electionId;
    if (filters?.positionId) where.positionId = filters.positionId;
    if (filters?.status) where.status = filters.status;
    if (filters?.county) where.county = filters.county;

    const [data, total] = await Promise.all([
      this.prisma.electionApplication.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, name: true } },
          position: {
            select: { id: true, title: true },
          },
          election: {
            select: { id: true, title: true },
          },
        },
        skip,
        take: limit,
        orderBy: { appliedAt: 'desc' },
      }),
      this.prisma.electionApplication.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateApplicationStatus(applicationId: string, status: string) {
    const application = await this.prisma.electionApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return this.prisma.electionApplication.update({
      where: { id: applicationId },
      data: { status },
      include: {
        user: { select: { id: true, email: true, name: true } },
        position: true,
        election: true,
      },
    });
  }
}

