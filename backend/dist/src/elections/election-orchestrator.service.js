"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElectionOrchestratorService = exports.ElectionStatusTransition = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const results_gateway_1 = require("../results/results.gateway");
var ElectionStatusTransition;
(function (ElectionStatusTransition) {
    ElectionStatusTransition["DRAFT_TO_SCHEDULED"] = "draft->scheduled";
    ElectionStatusTransition["SCHEDULED_TO_ACTIVE"] = "scheduled->active";
    ElectionStatusTransition["ACTIVE_TO_CLOSED"] = "active->closed";
    ElectionStatusTransition["DRAFT_TO_ACTIVE"] = "draft->active";
    ElectionStatusTransition["ANY_TO_DRAFT"] = "any->draft";
})(ElectionStatusTransition || (exports.ElectionStatusTransition = ElectionStatusTransition = {}));
let ElectionOrchestratorService = class ElectionOrchestratorService {
    prisma;
    resultsGateway;
    constructor(prisma, resultsGateway) {
        this.prisma = prisma;
        this.resultsGateway = resultsGateway;
    }
    async addCandidate(electionId, data, userId, userRole) {
        const election = await this.prisma.election.findUnique({ where: { id: electionId } });
        if (!election)
            throw new common_1.NotFoundException('Election not found');
        if (election.createdBy !== userId && userRole !== 'ADMIN') {
            throw new common_1.ForbiddenException('Only admins or the election creator can add candidates');
        }
        if (!data.name?.trim())
            throw new common_1.BadRequestException('Candidate name is required');
        if (election.status === 'closed')
            throw new common_1.BadRequestException('Cannot add candidates to a closed election');
        if (!data.positionId)
            throw new common_1.BadRequestException('Candidate position is required');
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
    async removeCandidate(electionId, candidateId, userId, userRole) {
        const candidate = await this.prisma.candidate.findUnique({
            where: { id: candidateId },
            include: { election: true, _count: { select: { votes: true } } },
        });
        if (!candidate || candidate.electionId !== electionId)
            throw new common_1.NotFoundException('Candidate not found');
        if (candidate.election.createdBy !== userId && userRole !== 'ADMIN') {
            throw new common_1.ForbiddenException('Only admins or the election creator can remove candidates');
        }
        if (candidate._count.votes > 0)
            throw new common_1.BadRequestException('Cannot remove a candidate who has received votes');
        await this.prisma.candidate.delete({ where: { id: candidateId } });
        return { success: true, message: 'Candidate removed' };
    }
    async initializeElectionWithPositions(electionId, userId, userRole) {
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
            throw new common_1.NotFoundException('Election not found');
        }
        if (election.createdBy !== userId && userRole !== 'ADMIN') {
            throw new common_1.ForbiddenException('You can only initialize your own elections');
        }
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
    async transitionElectionStatus(electionId, newStatus, userId, userRole) {
        const election = await this.prisma.election.findUnique({
            where: { id: electionId },
            include: { positions: true, applications: true },
        });
        if (!election) {
            throw new common_1.NotFoundException('Election not found');
        }
        if (election.createdBy !== userId && userRole !== 'ADMIN') {
            throw new common_1.ForbiddenException('You can only update your own elections');
        }
        const currentStatus = election.status;
        const isValidTransition = this.isValidStatusTransition(currentStatus, newStatus);
        if (!isValidTransition) {
            throw new common_1.BadRequestException(`Cannot transition from ${currentStatus} to ${newStatus}`);
        }
        const updatedElection = await this.executeStatusTransition(election, newStatus);
        try {
            this.resultsGateway.broadcastStatusChange(updatedElection);
        }
        catch (error) {
            console.error(`Failed to broadcast election status change: ${error.message}`);
        }
        return updatedElection;
    }
    async openPositionsForApplications(electionId, positionIds, userId, userRole) {
        const election = await this.prisma.election.findUnique({
            where: { id: electionId },
        });
        if (!election) {
            throw new common_1.NotFoundException('Election not found');
        }
        if (election.createdBy !== userId && userRole !== 'ADMIN') {
            throw new common_1.ForbiddenException('Only election creator can open positions');
        }
        if (election.status !== 'active') {
            throw new common_1.BadRequestException('Election must be active before positions can open for applications or voting.');
        }
        await this.prisma.electionPosition.updateMany({
            where: {
                id: { in: positionIds },
                electionId,
            },
            data: { isOpen: true },
        });
        const positions = await this.prisma.electionPosition.findMany({
            where: { electionId },
        });
        try {
            this.resultsGateway.broadcastPositionsUpdate(electionId, positions);
        }
        catch (error) {
            console.error(`Failed to broadcast positions update: ${error.message}`);
        }
        return positions;
    }
    async closePositionsForApplications(electionId, positionIds, userId, userRole) {
        const election = await this.prisma.election.findUnique({
            where: { id: electionId },
        });
        if (!election) {
            throw new common_1.NotFoundException('Election not found');
        }
        if (election.createdBy !== userId && userRole !== 'ADMIN') {
            throw new common_1.ForbiddenException('Only election creator can close positions');
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
        }
        catch (error) {
            console.error(`Failed to broadcast positions update: ${error.message}`);
        }
        return positions;
    }
    async getElectionDashboardStats(electionId) {
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
            throw new common_1.NotFoundException('Election not found');
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
                applicationCount: election.applications.filter((application) => application.positionId === pos.id).length,
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
    async getSystemActivity(limit = 50) {
        return this.prisma.userActivity.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    async getElectionApplications(electionId, filters) {
        const whereClause = { electionId };
        if (filters?.status)
            whereClause.status = filters.status;
        if (filters?.positionId)
            whereClause.positionId = filters.positionId;
        if (filters?.county)
            whereClause.county = filters.county;
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
    async approveApplicationAndCreateCandidate(applicationId, electionId, userId, userRole) {
        const application = await this.prisma.electionApplication.findUnique({
            where: { id: applicationId },
            include: { election: true, position: true },
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        if (application.electionId !== electionId) {
            throw new common_1.BadRequestException('Application does not belong to this election');
        }
        if (application.election.createdBy !== userId && userRole !== 'ADMIN') {
            throw new common_1.ForbiddenException('Only election creator can approve applications');
        }
        const result = await this.prisma.$transaction(async (tx) => {
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
        try {
            this.resultsGateway.broadcastApplicationStatusUpdate(application.electionId, result.application);
        }
        catch (error) {
            console.error(`Failed to broadcast application status update: ${error.message}`);
        }
        return result;
    }
    async rejectApplication(applicationId, electionId, userId, userRole) {
        const application = await this.prisma.electionApplication.findUnique({
            where: { id: applicationId },
            include: { election: true },
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        if (application.electionId !== electionId) {
            throw new common_1.BadRequestException('Application does not belong to this election');
        }
        if (application.election.createdBy !== userId && userRole !== 'ADMIN') {
            throw new common_1.ForbiddenException('Only election creator can reject applications');
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
            this.resultsGateway.broadcastApplicationStatusUpdate(application.electionId, updatedApp);
        }
        catch (error) {
            console.error(`Failed to broadcast application status update: ${error.message}`);
        }
        return updatedApp;
    }
    async getElectionTimeline(electionId) {
        const election = await this.prisma.election.findUnique({
            where: { id: electionId },
        });
        if (!election) {
            throw new common_1.NotFoundException('Election not found');
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
                daysUntilStart: Math.ceil((election.startsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
                daysUntilEnd: Math.ceil((election.endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
            },
        };
        return timeline;
    }
    isValidStatusTransition(currentStatus, newStatus) {
        const validTransitions = {
            draft: ['scheduled', 'active', 'draft'],
            scheduled: ['active', 'draft', 'scheduled'],
            active: ['closed', 'draft'],
            closed: ['draft'],
        };
        return (validTransitions[currentStatus]?.includes(newStatus) || false);
    }
    async executeStatusTransition(election, newStatus) {
        const now = new Date();
        return await this.prisma.$transaction(async (tx) => {
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
    async computePositionResultsSnapshot(tx, electionId) {
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
            const totalVotes = votesByCandidate.reduce((sum, item) => sum + item._count._all, 0);
            const topCount = votesByCandidate.length ? Math.max(...votesByCandidate.map((item) => item._count._all)) : 0;
            const leaders = votesByCandidate.filter((item) => item._count._all === topCount);
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
    getCurrentPhase(election, now) {
        if (election.status === 'draft')
            return 'Draft - Setup Phase';
        if (election.status === 'scheduled')
            return 'Scheduled - Applications Opening Soon';
        if (election.status === 'active') {
            if (now < election.endsAt) {
                return 'Active - Voting in Progress';
            }
            return 'Active - Voting Window Closed';
        }
        if (election.status === 'closed')
            return 'Closed - Results Final';
        return 'Unknown Phase';
    }
};
exports.ElectionOrchestratorService = ElectionOrchestratorService;
exports.ElectionOrchestratorService = ElectionOrchestratorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        results_gateway_1.ResultsGateway])
], ElectionOrchestratorService);
//# sourceMappingURL=election-orchestrator.service.js.map