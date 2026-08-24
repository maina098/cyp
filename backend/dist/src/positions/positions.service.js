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
var PositionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PositionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let PositionsService = PositionsService_1 = class PositionsService {
    prisma;
    logger = new common_1.Logger(PositionsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(electionId) {
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
    async findOpen(electionId) {
        const where = { isOpen: true };
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
    async findOne(id) {
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
    async updateStatus(id, isOpen) {
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
    async getPositionStats(electionId) {
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
};
exports.PositionsService = PositionsService;
exports.PositionsService = PositionsService = PositionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PositionsService);
//# sourceMappingURL=positions.service.js.map