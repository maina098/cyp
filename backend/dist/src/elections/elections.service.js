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
var ElectionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElectionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const schedule_1 = require("@nestjs/schedule");
const election_status_enum_1 = require("../common/enums/election-status.enum");
let ElectionsService = ElectionsService_1 = class ElectionsService {
    prisma;
    logger = new common_1.Logger(ElectionsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createElectionDto, userId) {
        this.logger.log(`Creating election by user ${userId}`);
        const { candidates, ...electionData } = createElectionDto;
        const status = electionData.status ?? election_status_enum_1.ElectionStatus.DRAFT;
        const startsAt = new Date(electionData.startsAt);
        const endsAt = new Date(electionData.endsAt);
        const now = new Date();
        if (isNaN(startsAt.getTime()) || isNaN(endsAt.getTime())) {
            throw new common_1.BadRequestException('Invalid date format for startsAt or endsAt');
        }
        if (endsAt <= startsAt) {
            throw new common_1.BadRequestException('Election end time must be after start time');
        }
        if (startsAt <= now && status !== election_status_enum_1.ElectionStatus.DRAFT) {
            throw new common_1.BadRequestException('Election start time must be in the future unless status is draft');
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
    async findAll(pagination) {
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
    async findOne(id) {
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
            throw new common_1.NotFoundException('Election not found');
        }
        return election;
    }
    async update(id, updateElectionDto, userId) {
        this.logger.log(`Updating election ${id} by user ${userId}`);
        const election = await this.findOne(id);
        if (election.createdBy !== userId) {
            throw new common_1.ForbiddenException('You can only update your own elections');
        }
        if (election.status === 'active' || election.status === 'closed') {
            throw new common_1.ForbiddenException('Cannot update an active or closed election');
        }
        const updateData = { ...updateElectionDto };
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
        if (updateElectionDto.startsAt || updateElectionDto.endsAt) {
            if (isNaN(newStartsAt.getTime()) || isNaN(newEndsAt.getTime())) {
                throw new common_1.BadRequestException('Invalid date format for startsAt or endsAt');
            }
            if (newEndsAt <= newStartsAt) {
                throw new common_1.BadRequestException('Election end time must be after start time');
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
    async updateStatus(id, status, userId) {
        this.logger.log(`Updating election ${id} status to ${status}`);
        const election = await this.findOne(id);
        if (election.createdBy !== userId) {
            throw new common_1.ForbiddenException('You can only update your own elections');
        }
        const validStatuses = Object.values(election_status_enum_1.ElectionStatus);
        if (!validStatuses.includes(status)) {
            throw new common_1.BadRequestException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
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
    async scheduleElection(id, payload, userId) {
        const election = await this.findOne(id);
        if (election.createdBy !== userId) {
            throw new common_1.ForbiddenException('You can only schedule your own elections');
        }
        const startsAt = payload.startsAt ? new Date(payload.startsAt) : election.startsAt;
        const endsAt = payload.endsAt ? new Date(payload.endsAt) : election.endsAt;
        const now = new Date();
        if (isNaN(startsAt.getTime()) || isNaN(endsAt.getTime())) {
            throw new common_1.BadRequestException('Invalid date format for startsAt or endsAt');
        }
        if (endsAt <= startsAt) {
            throw new common_1.BadRequestException('Election end time must be after start time');
        }
        if (startsAt <= now) {
            throw new common_1.BadRequestException('Election start time must be in the future');
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
    async delete(id, userId) {
        this.logger.log(`Deleting election ${id} by user ${userId}`);
        const election = await this.findOne(id);
        if (election.createdBy !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own elections');
        }
        await this.prisma.election.delete({
            where: { id },
        });
        this.logger.log(`Election ${id} deleted successfully`);
        return { success: true, message: 'Election deleted' };
    }
    async getResults(electionId) {
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
    async activateDueElections(now) {
        return this.prisma.election.updateMany({
            where: {
                status: 'scheduled',
                startsAt: { lte: now },
            },
            data: { status: 'active' },
        });
    }
    async closeExpiredElections(now) {
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
};
exports.ElectionsService = ElectionsService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ElectionsService.prototype, "syncElectionStatuses", null);
exports.ElectionsService = ElectionsService = ElectionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ElectionsService);
//# sourceMappingURL=elections.service.js.map