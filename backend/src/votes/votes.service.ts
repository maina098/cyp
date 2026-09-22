import { Injectable, ConflictException, NotFoundException, ForbiddenException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CastVoteDto } from './dto/cast-vote.dto';
import { createHash, randomInt } from 'crypto';
import { EmailService } from '../auth/email.service';

@Injectable()
export class VotesService {
  private readonly logger = new Logger(VotesService.name);

  constructor(private prisma: PrismaService, private emailService: EmailService) {}

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

        if (!castVoteDto?.positionId) {
          throw new BadRequestException('Position id is required to cast a vote');
        }

        const candidateFinder = tx.candidate.findFirst ?? tx.candidate.findUnique;
        const candidate = await candidateFinder.call(tx.candidate, {
          where: {
            id: castVoteDto.candidateId,
            electionId,
            positionId: castVoteDto.positionId,
          },
        });

        if (!candidate) {
          throw new BadRequestException('Candidate does not belong to the chosen position in this election');
        }

        if (candidate.electionId !== electionId) {
          throw new ForbiddenException('Candidate does not belong to this election');
        }

        if (candidate.positionId !== castVoteDto.positionId) {
          throw new BadRequestException('Candidate does not belong to the chosen position in this election');
        }

        // Fetch voter details for audit logging
        const voter = tx.user
          ? await tx.user.findUnique({ where: { id: voterId } })
          : null;

        // Create vote; uniqueness is enforced per election + position + voter
        const vote = await tx.vote.create({
          data: {
            electionId,
            candidateId: castVoteDto.candidateId,
            positionId: castVoteDto.positionId,
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
        throw new ConflictException('You have already voted for this position');
      }
      
      this.logger.error(`Vote failed for user ${voterId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async requestVotingOtp(electionId: string, userId: string) {
    const election = await this.prisma.election.findUnique({ where: { id: electionId } });
    if (!election) {
      throw new NotFoundException('Election not found');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new ForbiddenException('User not found');
    }

    const otpCode = randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const otpHash = this.hashOptCode(otpCode);

    const otp = await this.prisma.voteOtp.create({
      data: {
        electionId,
        userId,
        codeHash: otpHash,
        expiresAt,
      },
    });

    await this.emailService.sendVotingOtpEmail(user.email, otpCode, election.title);

    return {
      otpId: otp.id,
      expiresAt,
      message: 'OTP created. Use the code in the verification step.',
    };
  }

  async verifyVotingOtp(electionId: string, userId: string, otpId: string, otpCode: string) {
    const otp = await this.prisma.voteOtp.findFirst({
      where: {
        id: otpId,
        electionId,
        userId,
        usedAt: null,
      },
    });

    if (!otp) {
      throw new BadRequestException('OTP is invalid or already used');
    }

    if (otp.expiresAt <= new Date()) {
      throw new BadRequestException('OTP has expired');
    }

    if (this.hashOptCode(otpCode) !== otp.codeHash) {
      throw new BadRequestException('OTP is incorrect');
    }

    await this.prisma.voteOtp.update({
      where: { id: otp.id },
      data: { verifiedAt: new Date() },
    });

    return {
      valid: true,
      otpId: otp.id,
      expiresAt: otp.expiresAt,
      message: 'OTP verified successfully',
    };
  }

  async createVotingSession(electionId: string, userId: string, otpId: string) {
    const otp = await this.prisma.voteOtp.findUnique({ where: { id: otpId } });
    if (!otp || otp.userId !== userId || otp.electionId !== electionId || !otp.verifiedAt) {
      throw new BadRequestException('OTP has not been verified for this election');
    }

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const session = await this.prisma.votingSession.create({
      data: {
        electionId,
        userId,
        otpId,
        expiresAt,
      },
    });

    return {
      sessionId: session.id,
      expiresAt,
      message: 'Voting session started successfully',
    };
  }

  async validateVotingSession(electionId: string, userId: string, sessionId: string) {
    const session = await this.prisma.votingSession.findFirst({
      where: {
        id: sessionId,
        electionId,
        userId,
        completedAt: null,
      },
    });

    if (!session) {
      throw new BadRequestException('Voting session is invalid or already completed');
    }

    if (session.expiresAt <= new Date()) {
      throw new BadRequestException('Voting session has expired');
    }

    return { valid: true, sessionId: session.id, expiresAt: session.expiresAt };
  }

  private hashOptCode(code: string) {
    return createHash('sha256').update(code).digest('hex');
  }

  async getUserVote(electionId: string, voterId: string) {
    return this.prisma.vote.findMany({
      where: { electionId, voterId },
      orderBy: { votedAt: 'asc' },
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
