import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  async getDashboardOverview() {
    const [governors, secretariat, news, events, resources] = await Promise.all([
      this.prisma.governor.count({ where: { status: 'ACTIVE' } }),
      this.prisma.secretariatMember.count({ where: { status: 'ACTIVE' } }),
      this.prisma.news.count({ where: { published: true } }),
      this.prisma.event.count(),
      this.prisma.resource.count(),
    ]);

    return {
      stats: {
        governors,
        secretariat,
        news,
        events,
        resources,
      },
      sections: [
        'About',
        'Resources',
        'News & Updates',
        'Events',
        'Contact',
      ],
    };
  }

  async getPublishedNews() {
    return this.prisma.news.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
      take: 10,
    });
  }

  async getUpcomingEvents() {
    return this.prisma.event.findMany({
      orderBy: { date: 'asc' },
      take: 10,
    });
  }

  async getResources() {
    return this.prisma.resource.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async getGovernors() {
    return this.prisma.governor.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' },
    });
  }

  async getSecretariat() {
    return this.prisma.secretariatMember.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' },
    });
  }
}
