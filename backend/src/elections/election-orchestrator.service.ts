import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ResultsGateway } from '../results/results.gateway';

export enum ElectionStatusTransition {
  DRAFT_TO_SCHEDULED = 'draft->scheduled',
  SCHEDULED_TO_ACTIVE = 'scheduled->active',
  ACTIVE_TO_CLOSED = 'active->closed',
  DRAFT_TO_ACTIVE = 'draft->active',
  ANY_TO_DRAFT = 'any->draft', // Reset capability
}

@Injectable()
export class ElectionOrchestratorService {
  constructor(
    private prisma: PrismaService,
    private resultsGateway: ResultsGateway,
  ) {}

  async addCandidate(
    electionId: string,
    data: { name: string; bio?: string; photoUrl?: string; position?: number; positionId?: string },
    userId: string,
    userRole?: string,
  ) {
    const election = await this.prisma.election.findUnique({ where: { id: electionId } });
    if (!election) throw new NotFoundException('Election not found');
    if (election.createdBy !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Only admins or the election creator can add candidates');
    }
    if (!data.name?.trim()) throw new BadRequestException('Candidate name is required');
    if (election.status === 'closed') throw new BadRequestException('Cannot add candidates to a closed election');
    if (!data.positionId) throw new BadRequestException('Candidate position is required');

    return this.prisma.candidate.create({
      data: {
        electionId,
        positionId: data.positionId,
        name: data.name.trim(),
        bio: data.bio?.trim() || null,
        photoUrl: data.photoUrl || null,
        position: data.position ?? 0,
      },
    });
  }

  async removeCandidate(electionId: string, candidateId: string, userId: string, userRole?: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: candidateId },
      include: { election: true, _count: { select: { votes: true } } },
    });
    if (!candidate || candidate.electionId !== electionId) throw new NotFoundException('Candidate not found');
    if (candidate.election.createdBy !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Only admins or the election creator can remove candidates');
    }
    if (candidate._count.votes > 0) throw new BadRequestException('Cannot remove a candidate who has received votes');
    await this.prisma.candidate.delete({ where: { id: candidateId } });
    return { success: true, message: 'Candidate removed' };
  }

  /**
   * Initialize an election with default positions
   * Called when creating a new election
   */
  async initializeElectionWithPositions(electionId: string, userId: string, userRole?: string) {
    const defaultPositions = [
      'COUNTY YOUTH GOVERNOR',
      'SECRETARY GENERAL',
      'DELEGATE FOR GENDER AND INCLUSION',
      'DELEGATE FOR PWDS AND SPECIAL INTERESTS',
      'LIAISON OFFICER',
    ];

    const election = await this.prisma.election.findUnique({
      where: { id: electionId },
    });

    if (!election) {
      throw new NotFoundException('Election not found');
    }

    if (election.createdBy !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You can only initialize your own elections');
    }

    // Create positions that are missing while preserving existing positions.
    for (const title of defaultPositions) {
      const existingPosition = await this.prisma.electionPosition.findUnique({
        where: {
          electionId_title: {
            electionId,
            title,
          },
        },
      });

      if (!existingPosition) {
        await this.prisma.electionPosition.create({
          data: {
            electionId,
            title,
            description: `Application period for ${title} position`,
            isOpen: false,
            maxApplicants: 100,
          },
        });
      }
    }

    return this.prisma.election.findUnique({
      where: { id: electionId },
      include: { positions: true },
    });
  }

  /**
   * Transition election status with cascading effects
   * draft -> scheduled: prepare positions
   * scheduled -> active: open positions and voting
   * active -> closed: finalize results
   */
  async transitionElectionStatus(
    electionId: string,
    newStatus: 'draft' | 'scheduled' | 'active' | 'closed',
    userId: string,
    userRole?: string,
  ) {
    const election = await this.prisma.election.findUnique({
      where: { id: electionId },
      include: { positions: true, applications: true },
    });

    if (!election) {
      throw new NotFoundException('Election not found');
    }

    if (election.createdBy !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You can only update your own elections');
    }

    // Validate transition
    const currentStatus = election.status;
    const isValidTransition = this.isValidStatusTransition(currentStatus, newStatus);
    if (!isValidTransition) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
      );
    }

    // Execute transition-specific logic
    const updatedElection = await this.executeStatusTransition(
      election,
      newStatus,
    );

    // Broadcast status change with error handling
    try {
      this.resultsGateway.broadcastStatusChange(updatedElection);
    } catch (error) {
      console.error(`Failed to broadcast election status change: ${error.message}`);
      // Continue - broadcast is best-effort, don't fail the request
    }

    return updatedElection;
  }

  /**
   * Open positions for applications
   * Admin can selectively open positions
   */
  async openPositionsForApplications(
    electionId: string,
    positionIds: string[],
    userId: string,
    userRole?: string,
  ) {
    const election = await this.prisma.election.findUnique({
      where: { id: electionId },
    });

    if (!election) {
      throw new NotFoundException('Election not found');
    }

    if (election.createdBy !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'Only election creator can open positions',
      );
    }

    if (election.status !== 'active') {
      throw new BadRequestException(
        'Election must be active before positions can open for applications or voting.',
      );
    }

    // Update specified positions
    await this.prisma.electionPosition.updateMany({
      where: {
        id: { in: positionIds },
        electionId,
      },
      data: { isOpen: true },
    });

    // Get and broadcast updated positions with error handling
    const positions = await this.prisma.electionPosition.findMany({
      where: { electionId },
    });

    try {
      this.resultsGateway.broadcastPositionsUpdate(electionId, positions);
    } catch (error) {
      console.error(`Failed to broadcast positions update: ${error.message}`);
    }

    return positions;
  }

  /**
   * Close positions for applications
   */
  async closePositionsForApplications(
    electionId: string,
    positionIds: string[],
    userId: string,
    userRole?: string,
  ) {
    const election = await this.prisma.election.findUnique({
      where: { id: electionId },
    });

    if (!election) {
      throw new NotFoundException('Election not found');
    }

    if (election.createdBy !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'Only election creator can close positions',
      );
    }

    const updatedPositions = await this.prisma.electionPosition.updateMany({
      where: {
        id: { in: positionIds },
        electionId,
      },
      data: { isOpen: false },
    });

    const positions = await this.prisma.electionPosition.findMany({
      where: { electionId },
    });

    try {
      this.resultsGateway.broadcastPositionsUpdate(electionId, positions);
    } catch (error) {
      console.error(`Failed to broadcast positions update: ${error.message}`);
    }

    return positions;
  }

  /**
   * Get comprehensive election dashboard data
   */
  async getElectionDashboardStats(electionId: string) {
    const election = await this.prisma.election.findUnique({
      where: { id: electionId },
      include: {
        positions: true,
        applications: true,
        votes: true,
        candidates: true,
      },
    });

    if (!election) {
      throw new NotFoundException('Election not found');
    }

    const stats = {
      electionId: election.id,
      title: election.title,
      status: election.status,
      startsAt: election.startsAt,
      endsAt: election.endsAt,
      totalCandidates: election.candidates.length,
      totalApplications: election.applications.length,
      totalVotes: election.votes.length,
      positions: election.positions.map((pos) => ({
        id: pos.id,
        title: pos.title,
        isOpen: pos.isOpen,
        applicationCount: election.applications.filter(
          (application) => application.positionId === pos.id,
        ).length,
        maxApplicants: pos.maxApplicants,
      })),
      applicationsByStatus: {
        pending: election.applications.filter((a) => a.status === 'pending')
          .length,
        approved: election.applications.filter((a) => a.status === 'approved')
          .length,
        rejected: election.applications.filter((a) => a.status === 'rejected')
          .length,
        withdrawn: election.applications.filter((a) => a.status === 'withdrawn')
          .length,
      },
    };

    return stats;
  }

  /**
   * Get real-time user activity in system
   */
  async getSystemActivity(limit: number = 50) {
    return this.prisma.userActivity.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get applications by election with full details
   */
  async getElectionApplications(electionId: string, filters?: {
    status?: string;
    positionId?: string;
    county?: string;
  }) {
    const whereClause: any = { electionId };

    if (filters?.status) whereClause.status = filters.status;
    if (filters?.positionId) whereClause.positionId = filters.positionId;
    if (filters?.county) whereClause.county = filters.county;

    return this.prisma.electionApplication.findMany({
      where: whereClause,
      include: {
        position: true,
        election: true,
        user: { select: { id: true, email: true, name: true } },
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  /**
   * Approve application and auto-create candidate entry
   * Wrapped in transaction to prevent race conditions
   */
  async approveApplicationAndCreateCandidate(
    applicationId: string,
    electionId: string,
    userId: string,
    userRole?: string,
  ) {
    const application = await this.prisma.electionApplication.findUnique({
      where: { id: applicationId },
      include: { election: true, position: true },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.electionId !== electionId) {
      throw new BadRequestException('Application does not belong to this election');
    }

    if (application.election.createdBy !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Only election creator can approve applications');
    }

    // Wrap entire approval process in transaction to prevent race conditions
    const result = await this.prisma.$transaction(async (tx) => {
      // Update application status
      const updatedApp = await tx.electionApplication.update({
        where: { id: applicationId },
        data: { status: 'approved' },
        include: { position: true, election: true },
      });

      const electionPositions = await tx.electionPosition.findMany({
        where: { electionId: application.electionId },
        orderBy: { createdAt: 'asc' },
        select: { id: true },
      });
      const candidatePosition = electionPositions.findIndex((position) => position.id === application.positionId) + 1;

      // Create candidate entry if not exists (checked within transaction)
      const existingCandidate = await tx.candidate.findFirst({
        where: {
          electionId: application.electionId,
          positionId: application.positionId,
          name: application.name,
          position: candidatePosition,
        },
      });

      let candidate = existingCandidate;
      if (!candidate) {
        candidate = await tx.candidate.create({
          data: {
            electionId: application.electionId,
            positionId: application.positionId,
            name: application.name,
            bio: application.description,
            photoUrl: null,
            position: candidatePosition,
          },
        });
      }

      // Track activity within transaction
      await tx.userActivity.create({
        data: {
          userId: application.userId,
          email: application.email,
          name: application.name,
          action: 'application_approved',
          details: `Approved for position: ${application.position.title}`,
        },
      });

      return { application: updatedApp, candidate };
    });

    // Broadcast update after transaction completes
    try {
      this.resultsGateway.broadcastApplicationStatusUpdate(
        application.electionId,
        result.application,
      );
    } catch (error) {
      // Log but don't fail - broadcast is best-effort
      console.error(`Failed to broadcast application status update: ${error.message}`);
    }

    return result;
  }

  /**
   * Reject application
   * Wrapped in transaction for data consistency
   */
  async rejectApplication(applicationId: string, electionId: string, userId: string, userRole?: string) {
    const application = await this.prisma.electionApplication.findUnique({
      where: { id: applicationId },
      include: { election: true },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.electionId !== electionId) {
      throw new BadRequestException('Application does not belong to this election');
    }

    if (application.election.createdBy !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Only election creator can reject applications');
    }

    const updatedApp = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.electionApplication.update({
        where: { id: applicationId },
        data: { status: 'rejected' },
        include: { position: true },
      });

      await tx.userActivity.create({
        data: {
          userId: application.userId,
          email: application.email,
          name: application.name,
          action: 'application_rejected',
          details: `Rejected for position: ${updated.position.title}`,
        },
      });

      return updated;
    });

    try {
      this.resultsGateway.broadcastApplicationStatusUpdate(
        application.electionId,
        updatedApp,
      );
    } catch (error) {
      console.error(`Failed to broadcast application status update: ${error.message}`);
    }

    return updatedApp;
  }

  /**
   * Get election lifecycle timeline
   */
  async getElectionTimeline(electionId: string) {
    const election = await this.prisma.election.findUnique({
      where: { id: electionId },
    });

    if (!election) {
      throw new NotFoundException('Election not found');
    }

    const now = new Date();
    const timeline = {
      electionId,
      title: election.title,
      status: election.status,
      currentPhase: this.getCurrentPhase(election, now),
      schedule: {
        startsAt: election.startsAt,
        endsAt: election.endsAt,
        daysUntilStart: Math.ceil(
          (election.startsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        ),
        daysUntilEnd: Math.ceil(
          (election.endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        ),
      },
    };

    return timeline;
  }

  // ==================== PRIVATE HELPERS ====================

  private isValidStatusTransition(
    currentStatus: string,
    newStatus: string,
  ): boolean {
    const validTransitions: Record<string, string[]> = {
      draft: ['scheduled', 'active', 'draft'], // can reset
      scheduled: ['active', 'draft', 'scheduled'],
      active: ['closed', 'draft'],
      closed: ['draft'], // can only reset
    };

    return (
      validTransitions[currentStatus]?.includes(newStatus) || false
    );
  }

  private async executeStatusTransition(
    election: any,
    newStatus: string,
  ) {
    const now = new Date();

    // Wrap entire status transition in transaction to ensure consistency
    return await this.prisma.$transaction(async (tx) => {
      // Close positions when transitioning to closed
      if (newStatus === 'closed') {
        await tx.electionPosition.updateMany({
          where: { electionId: election.id },
          data: { isOpen: false },
        });

        await this.computePositionResultsSnapshot(tx, election.id);
      }

      return tx.election.update({
        where: { id: election.id },
        data: {
          status: newStatus,
          updatedAt: now,
        },
        include: {
          positions: true,
          candidates: true,
          electionResults: true,
        },
      });
    });
  }

  private async computePositionResultsSnapshot(
    tx: any,
    electionId: string,
  ) {
    const positions = await tx.electionPosition.findMany({
      where: { electionId },
      include: { positionCandidates: true },
    });

    for (const position of positions) {
      const votesByCandidate = await tx.vote.groupBy({
        by: ['candidateId'],
        where: { electionId, positionId: position.id },
        _count: { _all: true },
      });

      const totalVotes = votesByCandidate.reduce((sum: number, item: any) => sum + item._count._all, 0);
      const topCount = votesByCandidate.length ? Math.max(...votesByCandidate.map((item: any) => item._count._all)) : 0;
      const leaders = votesByCandidate.filter((item: any) => item._count._all === topCount);
      const winnerId = leaders.length === 1 ? leaders[0].candidateId : null;

      await tx.positionResult.upsert({
        where: {
          electionId_positionId: {
            electionId,
            positionId: position.id,
          },
        },
        update: {
          candidateId: winnerId,
          totalVotes,
          isTie: leaders.length > 1,
          computedAt: new Date(),
        },
        create: {
          electionId,
          positionId: position.id,
          candidateId: winnerId,
          totalVotes,
          isTie: leaders.length > 1,
        },
      });
    }
  }

  private getCurrentPhase(election: any, now: Date): string {
    if (election.status === 'draft') return 'Draft - Setup Phase';
    if (election.status === 'scheduled') return 'Scheduled - Applications Opening Soon';
    if (election.status === 'active') {
      if (now < election.endsAt) {
        return 'Active - Voting in Progress';
      }
      return 'Active - Voting Window Closed';
    }
    if (election.status === 'closed') return 'Closed - Results Final';
    return 'Unknown Phase';
  }
}
