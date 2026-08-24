import { Injectable, ForbiddenException, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateElectionDto } from './dto/create-election.dto';
import { UpdateElectionDto } from './dto/update-election.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';
import { ElectionStatus } from '../common/enums/election-status.enum';

@Injectable()
export class ElectionsService {
  private readonly logger = new Logger(ElectionsService.name);

  constructor(private prisma: PrismaService) {}

  async create(createElectionDto: CreateElectionDto, userId: string) {
    this.logger.log(`Creating election by user ${userId}`);
    
    const { candidates, ...electionData } = createElectionDto;
    const status = (electionData as any).status ?? ElectionStatus.DRAFT;

    // Validate dates
    const startsAt = new Date(electionData.startsAt);
    const endsAt = new Date(electionData.endsAt);
    const now = new Date();

    if (isNaN(startsAt.getTime()) || isNaN(endsAt.getTime())) {
      throw new BadRequestException('Invalid date format for startsAt or endsAt');
    }

    if (endsAt <= startsAt) {
      throw new BadRequestException('Election end time must be after start time');
    }

    if (startsAt <= now && status !== ElectionStatus.DRAFT) {
      throw new BadRequestException('Election start time must be in the future unless status is draft');
    }

    const election = await this.prisma.election.create({
      data: {
        ...electionData,
        startsAt,
        endsAt,
        createdBy: userId,
        status,
        candidates: {
          create: candidates.map((candidate) => ({
            name: candidate.name,
            bio: candidate.bio,
            photoUrl: candidate.photoUrl,
            position: candidate.position ?? 0,
          })),
        },
      },
      include: {
        candidates: true,
      },
    });

    this.logger.log(`Election ${election.id} created successfully`);
    return election;
  }

  async findAll(pagination?: PaginationDto): Promise<PaginatedResult<any>> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.election.findMany({
        include: {
          candidates: {
            select: { id: true, name: true, photoUrl: true },
          },
          electionResults: {
            select: { candidateId: true, voteCount: true },
          },
          _count: {
            select: { votes: true, applications: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.election.count(),
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

  async findOne(id: string) {
    const election = await this.prisma.election.findUnique({
      where: { id },
      include: {
        candidates: {
          select: {
            id: true,
            name: true,
            bio: true,
            photoUrl: true,
            position: true,
            _count: {
              select: { votes: true },
            },
          },
        },
        electionResults: {
          select: {
            candidateId: true,
            voteCount: true,
          },
        },
        positions: {
          select: {
            id: true,
            title: true,
            isOpen: true,
            _count: {
              select: { applications: true },
            },
          },
        },
        _count: {
          select: { votes: true, applications: true },
        },
      },
    });

    if (!election) {
      throw new NotFoundException('Election not found');
    }

    return election;
  }

  async update(id: string, updateElectionDto: UpdateElectionDto, userId: string) {
    this.logger.log(`Updating election ${id} by user ${userId}`);
    
    const election = await this.findOne(id);

    if (election.createdBy !== userId) {
      throw new ForbiddenException('You can only update your own elections');
    }

    if (election.status === 'active' || election.status === 'closed') {
      throw new ForbiddenException('Cannot update an active or closed election');
    }

    const updateData: any = { ...updateElectionDto };
    let newStartsAt = election.startsAt;
    let newEndsAt = election.endsAt;

    if (updateElectionDto.startsAt) {
      newStartsAt = new Date(updateElectionDto.startsAt);
      updateData.startsAt = newStartsAt;
    }
    if (updateElectionDto.endsAt) {
      newEndsAt = new Date(updateElectionDto.endsAt);
      updateData.endsAt = newEndsAt;
    }

    // Validate dates if either was updated
    if (updateElectionDto.startsAt || updateElectionDto.endsAt) {
      if (isNaN(newStartsAt.getTime()) || isNaN(newEndsAt.getTime())) {
        throw new BadRequestException('Invalid date format for startsAt or endsAt');
      }

      if (newEndsAt <= newStartsAt) {
        throw new BadRequestException('Election end time must be after start time');
      }
    }

    const updated = await this.prisma.election.update({
      where: { id },
      data: updateData,
      include: {
        candidates: true,
        electionResults: true,
      },
    });

    this.logger.log(`Election ${id} updated successfully`);
    return updated;
  }

  async updateStatus(id: string, status: 'draft' | 'scheduled' | 'active' | 'closed', userId: string) {
    this.logger.log(`Updating election ${id} status to ${status}`);
    
    const election = await this.findOne(id);

    if (election.createdBy !== userId) {
      throw new ForbiddenException('You can only update your own elections');
    }

    // Validate status is in allowed enum
    const validStatuses = Object.values(ElectionStatus);
    if (!validStatuses.includes(status as ElectionStatus)) {
      throw new BadRequestException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    return this.prisma.election.update({
      where: { id },
      data: { status },
      include: {
        candidates: true,
        electionResults: true,
      },
    });
  }

  async scheduleElection(id: string, payload: { startsAt?: string; endsAt?: string }, userId: string) {
    const election = await this.findOne(id);

    if (election.createdBy !== userId) {
      throw new ForbiddenException('You can only schedule your own elections');
    }

    const startsAt = payload.startsAt ? new Date(payload.startsAt) : election.startsAt;
    const endsAt = payload.endsAt ? new Date(payload.endsAt) : election.endsAt;
    const now = new Date();

    if (isNaN(startsAt.getTime()) || isNaN(endsAt.getTime())) {
      throw new BadRequestException('Invalid date format for startsAt or endsAt');
    }

    if (endsAt <= startsAt) {
      throw new BadRequestException('Election end time must be after start time');
    }

    if (startsAt <= now) {
      throw new BadRequestException('Election start time must be in the future');
    }

    return this.prisma.election.update({
      where: { id },
      data: {
        startsAt,
        endsAt,
        status: 'scheduled',
      },
      include: {
        candidates: true,
        electionResults: true,
      },
    });
  }

  async delete(id: string, userId: string) {
    this.logger.log(`Deleting election ${id} by user ${userId}`);
    
    const election = await this.findOne(id);

    if (election.createdBy !== userId) {
      throw new ForbiddenException('You can only delete your own elections');
    }

    await this.prisma.election.delete({
      where: { id },
    });

    this.logger.log(`Election ${id} deleted successfully`);
    return { success: true, message: 'Election deleted' };
  }

  async getResults(electionId: string) {
    const results = await this.prisma.electionResult.findMany({
      where: { electionId },
      include: {
        candidate: {
          select: { id: true, name: true, photoUrl: true },
        },
      },
      orderBy: { voteCount: 'desc' },
    });

    const totalVotes = results.reduce((sum, r) => sum + r.voteCount, 0);

    return {
      totalVotes,
      results: results.map((result) => ({
        id: result.id,
        electionId: result.electionId,
        candidateId: result.candidateId,
        voteCount: result.voteCount,
        percentage: totalVotes > 0 ? ((result.voteCount / totalVotes) * 100).toFixed(2) : '0.00',
        candidate: result.candidate,
      })),
    };
  }

  async activateDueElections(now: Date) {
    return this.prisma.election.updateMany({
      where: {
        status: 'scheduled',
        startsAt: { lte: now },
      },
      data: { status: 'active' },
    });
  }

  async closeExpiredElections(now: Date) {
    const expired = await this.prisma.election.findMany({
      where: {
        status: 'active',
        endsAt: { lte: now },
      },
    });

    if (expired.length > 0) {
      await this.prisma.election.updateMany({
        where: {
          status: 'active',
          endsAt: { lte: now },
        },
        data: { status: 'closed' },
      });
    }

    return expired.map((election) => ({
      id: election.id,
      status: 'closed',
    }));
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async syncElectionStatuses() {
    const now = new Date();
    const activated = await this.activateDueElections(now);
    const closedElections = await this.closeExpiredElections(now);
    
    if (activated.count > 0) {
      this.logger.log(`Activated ${activated.count} elections`);
    }
    
    if (closedElections.length > 0) {
      this.logger.log(`Closed ${closedElections.length} elections`);
      
      for (const election of closedElections) {
        await this.prisma.election.update({
          where: { id: election.id },
          data: { status: 'closed' },
        });
      }
    }
  }
}
