import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PositionsService {
  private readonly logger = new Logger(PositionsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get all election positions for a specific election
   */
  async findAll(electionId: string) {
    this.logger.debug(`Fetching all positions for election ${electionId}`);
    return this.prisma.electionPosition.findMany({
      where: { electionId },
      include: {
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Get only open positions (for users viewing available applications)
   */
  async findOpen(electionId?: string) {
    const where: any = { isOpen: true };
    if (electionId) {
      where.electionId = electionId;
    }

    return this.prisma.electionPosition.findMany({
      where,
      include: {
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Get a single position with details
   */
  async findOne(id: string) {
    return this.prisma.electionPosition.findUnique({
      where: { id },
      include: {
        election: true,
        applications: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: { applications: true },
        },
      },
    });
  }

  /**
   * Open or close a position for applications (admin only)
   */
  async updateStatus(id: string, isOpen: boolean) {
    return this.prisma.electionPosition.update({
      where: { id },
      data: { isOpen },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });
  }

  /**
   * Get positions by election with application stats
   */
  async getPositionStats(electionId: string) {
    return this.prisma.electionPosition.findMany({
      where: { electionId },
      include: {
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
