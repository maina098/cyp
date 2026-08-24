import { Injectable, ConflictException, NotFoundException, ForbiddenException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CastVoteDto } from './dto/cast-vote.dto';

@Injectable()
export class VotesService {
  private readonly logger = new Logger(VotesService.name);

  constructor(private prisma: PrismaService) {}

  async castVote(electionId: string, castVoteDto: CastVoteDto, voterId: string, resultsGateway?: any) {
    this.logger.log(`User ${voterId} attempting to vote in election ${electionId}`);

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Verify election exists and is active
        const election = await tx.election.findUnique({
          where: { id: electionId },
        });

        if (!election) {
          throw new NotFoundException('Election not found');
        }

        const now = new Date();
        if (election.status !== 'active') {
          throw new ForbiddenException('Election is not currently active');
        }

        if (now < election.startsAt || now > election.endsAt) {
          throw new ForbiddenException('Outside voting window');
        }

        // Verify candidate exists
        const candidate = await tx.candidate.findUnique({
          where: { id: castVoteDto.candidateId },
        });

        if (!candidate) {
          throw new NotFoundException('Candidate not found');
        }

        if (candidate.electionId !== electionId) {
          throw new ForbiddenException('Candidate does not belong to this election');
        }

        // Fetch voter details for audit logging
        const voter = await tx.user.findUnique({
          where: { id: voterId },
        });

        // Create vote (unique constraint prevents duplicates)
        const vote = await tx.vote.create({
          data: {
            electionId,
            candidateId: castVoteDto.candidateId,
            voterId,
          },
        });

        // Update the aggregated results
        await tx.electionResult.upsert({
          where: {
            electionId_candidateId: {
              electionId,
              candidateId: castVoteDto.candidateId,
            },
          },
          update: {
            voteCount: {
              increment: 1,
            },
          },
          create: {
            electionId,
            candidateId: castVoteDto.candidateId,
            voteCount: 1,
          },
        });

        // Track user activity with complete voter details
        await tx.userActivity.create({
          data: {
            userId: voterId,
            email: voter?.email || '',
            name: voter?.name || '',
            action: 'vote',
            details: `Voted in election ${electionId} for candidate ${castVoteDto.candidateId}`,
          },
        });

        return vote;
      });

      // Fetch and broadcast updated results (outside transaction)
      if (resultsGateway) {
        const results = await this.prisma.electionResult.findMany({
          where: { electionId },
          include: { candidate: true },
          orderBy: { voteCount: 'desc' },
        });
        resultsGateway.broadcastResults(electionId, results);
      }

      this.logger.log(`User ${voterId} successfully voted in election ${electionId}`);
      return { success: true, message: 'Vote cast successfully' };
    } catch (error) {
      if (error.code === 'P2002') {
        // Unique constraint violation - user already voted
        this.logger.warn(`Duplicate vote attempt by user ${voterId} in election ${electionId}`);
        throw new ConflictException('You have already voted in this election');
      }
      
      this.logger.error(`Vote failed for user ${voterId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getUserVote(electionId: string, voterId: string) {
    return this.prisma.vote.findUnique({
      where: {
        electionId_voterId: {
          electionId,
          voterId,
        },
      },
    });
  }

  async getElectionVotes(electionId: string, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      this.prisma.vote.findMany({
        where: { electionId },
        include: { 
          candidate: { select: { id: true, name: true } }, 
          voter: { select: { id: true, name: true } } 
        },
        skip,
        take: limit,
        orderBy: { votedAt: 'desc' },
      }),
      this.prisma.vote.count({ where: { electionId } }),
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
}
