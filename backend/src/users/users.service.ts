import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import {
  ChangePasswordDto,
  CreateCommunityServiceDto,
  CreateEventParticipationDto,
  RecordContentReadDto,
  UpdateProfileDto,
} from './users.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private userSelect = {
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
  } as const;

  getProfile(userId: string) {
    return this.prisma.user.findUniqueOrThrow({ where: { id: userId }, select: this.userSelect });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    if (dto.email) {
      const existing = await this.prisma.user.findFirst({ where: { email: dto.email, NOT: { id: userId } } });
      if (existing) throw new ConflictException('Email already registered');
    }
    return this.prisma.user.update({ where: { id: userId }, data: dto, select: this.userSelect });
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !(await bcrypt.compare(dto.currentPassword, user.passwordHash))) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash: await bcrypt.hash(dto.newPassword, 12) } });
    return { message: 'Password changed successfully' };
  }

  async getDashboard(userId: string) {
    const [user, eventsAttended, publishedContentRead, publishedContentTotal, communityServices, recentActivity, events, resources, elections] = await Promise.all([
      this.getProfile(userId),
      this.prisma.userEventParticipation.count({ where: { userId, status: { in: ['ATTENDED', 'APPROVED'] } } }),
      this.prisma.userContentRead.count({
        where: { userId, contentType: { in: ['news', 'event', 'resource', 'governor', 'secretariat'] } },
      }),
      Promise.all([
        this.prisma.news.count({ where: { published: true } }),
        this.prisma.event.count({ where: { status: { not: 'CANCELLED' } } }),
        this.prisma.resource.count(),
        this.prisma.governor.count({ where: { status: 'ACTIVE' } }),
        this.prisma.secretariatMember.count({ where: { status: 'ACTIVE' } }),
      ]).then((counts) => counts.reduce((total, count) => total + count, 0)),
      this.prisma.communityService.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      this.prisma.userActivity.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      this.prisma.userEventParticipation.findMany({ where: { userId }, include: { event: true }, orderBy: { createdAt: 'desc' } }),
      this.prisma.resource.findMany({ orderBy: { createdAt: 'desc' } }),
      this.getElectionOverview(userId),
    ]);

    const communityScore = communityServices.reduce((score, item) => {
      if (item.status === 'APPROVED') return score + 10;
      if (item.status === 'PENDING') return score + 5;
      return score;
    }, 0);
    return {
      user,
      stats: {
        eventsAttended,
        newsRead: publishedContentRead,
        publishedContentRead,
        publishedContentTotal,
        communityScore,
        communityServicesInitiated: communityServices.length,
      },
      recentActivity,
      events,
      resources,
      elections,
    };
  }

  getActivities(userId: string) {
    return this.prisma.userActivity.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 100 });
  }

  async recordContentRead(userId: string, dto: RecordContentReadDto) {
    return this.prisma.userContentRead.upsert({
      where: { userId_contentType_contentId: { userId, contentType: dto.contentType, contentId: dto.contentId } },
      update: { readAt: new Date() },
      create: { userId, contentType: dto.contentType, contentId: dto.contentId },
    });
  }

  async getEvents(userId: string) {
    return this.prisma.userEventParticipation.findMany({ where: { userId }, include: { event: true }, orderBy: { createdAt: 'desc' } });
  }

  async addEventParticipation(userId: string, eventId: string, dto: CreateEventParticipationDto) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');
    const participation = await this.prisma.userEventParticipation.create({ data: { userId, eventId, ...dto } });
    await this.prisma.userActivity.create({ data: { userId, email: (await this.getProfile(userId)).email, name: (await this.getProfile(userId)).name, action: 'event_submission', details: `Submitted participation for ${event.title}` } });
    return participation;
  }

  async addCommunityService(userId: string, dto: CreateCommunityServiceDto) {
    const service = await this.prisma.communityService.create({ data: { userId, ...dto } });
    const user = await this.getProfile(userId);
    await this.prisma.userActivity.create({ data: { userId, email: user.email, name: user.name, action: 'community_service_submission', details: `Submitted ${dto.title}` } });
    return service;
  }

  private getElectionOverview(userId: string) {
    return this.prisma.election.findMany({
      where: { status: { in: ['scheduled', 'active'] } },
      orderBy: { startsAt: 'asc' },
      include: {
        positions: { where: { isOpen: true }, orderBy: { createdAt: 'asc' } },
        candidates: { orderBy: { position: 'asc' } },
        applications: { where: { userId }, include: { position: true }, orderBy: { appliedAt: 'desc' } },
        electionResults: { include: { candidate: true }, orderBy: { voteCount: 'desc' } },
      },
    });
  }
}
