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
var ApplicationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const results_gateway_1 = require("../results/results.gateway");
let ApplicationsService = ApplicationsService_1 = class ApplicationsService {
    prisma;
    resultsGateway;
    logger = new common_1.Logger(ApplicationsService_1.name);
    constructor(prisma, resultsGateway) {
        this.prisma = prisma;
        this.resultsGateway = resultsGateway;
    }
    async create(dto, userId) {
        const position = await this.prisma.electionPosition.findUnique({
            where: { id: dto.positionId },
        });
        if (!position) {
            throw new common_1.BadRequestException('Position not found');
        }
        if (position.electionId !== dto.electionId) {
            throw new common_1.BadRequestException('The position does not belong to this election');
        }
        const election = await this.prisma.election.findUnique({ where: { id: dto.electionId } });
        if (!election) {
            throw new common_1.BadRequestException('Election not found');
        }
        const now = new Date();
        if (!['scheduled', 'active'].includes(election.status) || now < election.startsAt || now > election.endsAt) {
            throw new common_1.BadRequestException('Applications are not open for this election');
        }
        if (!position.isOpen) {
            throw new common_1.BadRequestException('This position is not currently accepting applications');
        }
        const existingApplication = await this.prisma.electionApplication.findUnique({
            where: {
                positionId_userId: {
                    positionId: dto.positionId,
                    userId,
                },
            },
        });
        if (existingApplication) {
            throw new common_1.BadRequestException('You have already applied for this position');
        }
        const applicationCount = await this.prisma.electionApplication.count({
            where: {
                positionId: dto.positionId,
            },
        });
        if (applicationCount >= position.maxApplicants) {
            throw new common_1.BadRequestException(`This position has reached its maximum number of applicants (${position.maxApplicants})`);
        }
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
        await this.prisma.userActivity.create({
            data: {
                userId,
                email: dto.email,
                name: dto.name,
                action: 'application_submitted',
                details: `Applied for position: ${position.title}`,
            },
        });
        this.resultsGateway.broadcastNewApplication(dto.electionId, application);
        return application;
    }
    async findByUser(userId) {
        return this.prisma.electionApplication.findMany({
            where: { userId },
            include: {
                position: true,
                election: true,
            },
            orderBy: { appliedAt: 'desc' },
        });
    }
    async findAll(filters) {
        const where = {};
        if (filters?.electionId)
            where.electionId = filters.electionId;
        if (filters?.positionId)
            where.positionId = filters.positionId;
        if (filters?.status)
            where.status = filters.status;
        if (filters?.county)
            where.county = filters.county;
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
    async findOne(id) {
        return this.prisma.electionApplication.findUnique({
            where: { id },
            include: {
                position: true,
                election: true,
                user: { select: { id: true, email: true, name: true } },
            },
        });
    }
    async updateStatus(id, dto, userId, userRole) {
        if (userRole !== 'ADMIN') {
            throw new common_1.ForbiddenException('Only admins can update application status');
        }
        const application = await this.prisma.electionApplication.findUnique({
            where: { id },
            include: { position: true },
        });
        if (!application) {
            throw new common_1.BadRequestException('Application not found');
        }
        this.logger.log(`Admin ${userId} updating application ${id} status to ${dto.status}`);
        const updated = await this.prisma.$transaction(async (tx) => {
            const next = await tx.electionApplication.update({
                where: { id },
                data: { status: dto.status },
                include: {
                    position: true,
                    election: true,
                    user: { select: { id: true, email: true, name: true } },
                },
            });
            const candidate = await tx.candidate.findFirst({
                where: { electionId: application.electionId, positionId: application.positionId, name: application.name },
                include: { _count: { select: { votes: true } } },
            });
            if (dto.status === 'approved' && !candidate) {
                await tx.candidate.create({
                    data: {
                        electionId: application.electionId,
                        positionId: application.positionId,
                        name: application.name,
                        bio: application.description,
                        photoUrl: null,
                        position: 0,
                    },
                });
            }
            else if (dto.status !== 'approved' && candidate) {
                if (candidate._count.votes > 0) {
                    throw new common_1.BadRequestException('Cannot remove a candidate who has received votes');
                }
                await tx.candidate.delete({ where: { id: candidate.id } });
            }
            return next;
        });
        try {
            this.resultsGateway.broadcastApplicationStatusUpdate(application.electionId, updated);
        }
        catch (error) {
            this.logger.error(`Failed to broadcast application status update: ${error.message}`);
        }
        return updated;
    }
    async getApplicationStats(electionId) {
        const stats = await this.prisma.electionApplication.groupBy({
            by: ['status'],
            where: { electionId },
            _count: {
                id: true,
            },
        });
        return stats.reduce((acc, stat) => {
            acc[stat.status] = stat._count.id;
            return acc;
        }, {});
    }
    async findByPosition(positionId) {
        return this.prisma.electionApplication.findMany({
            where: { positionId },
            include: {
                user: { select: { id: true, email: true, name: true } },
            },
            orderBy: { appliedAt: 'desc' },
        });
    }
};
exports.ApplicationsService = ApplicationsService;
exports.ApplicationsService = ApplicationsService = ApplicationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        results_gateway_1.ResultsGateway])
], ApplicationsService);
//# sourceMappingURL=applications.service.js.map