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
var AdminService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const results_gateway_1 = require("../results/results.gateway");
let AdminService = AdminService_1 = class AdminService {
    prisma;
    resultsGateway;
    logger = new common_1.Logger(AdminService_1.name);
    constructor(prisma, resultsGateway) {
        this.prisma = prisma;
        this.resultsGateway = resultsGateway;
    }
    async getNews(page = 1, limit = 20) {
        this.logger.debug(`Fetching news items - page ${page}, limit ${limit}`);
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.news.findMany({
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.news.count(),
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
    async createNews(data) {
        return this.prisma.news.create({ data: { ...data, published: false } });
    }
    async updateNews(id, data) {
        const item = await this.prisma.news.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('News item not found');
        return this.prisma.news.update({ where: { id }, data });
    }
    async deleteNews(id) {
        const item = await this.prisma.news.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('News item not found');
        return this.prisma.news.delete({ where: { id } });
    }
    async getEvents() {
        return this.prisma.event.findMany({
            orderBy: { date: 'asc' },
        });
    }
    async getMemberEventSubmissions() {
        return this.prisma.userEventParticipation.findMany({
            include: {
                user: { select: { id: true, name: true, email: true, profileImageUrl: true } },
                event: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getMemberCommunityServices() {
        return this.prisma.communityService.findMany({
            include: {
                user: { select: { id: true, name: true, email: true, profileImageUrl: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createEvent(data) {
        return this.prisma.event.create({ data });
    }
    async updateEvent(id, data) {
        const item = await this.prisma.event.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Event not found');
        return this.prisma.event.update({ where: { id }, data });
    }
    async deleteEvent(id) {
        const item = await this.prisma.event.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Event not found');
        return this.prisma.event.delete({ where: { id } });
    }
    async getResources() {
        return this.prisma.resource.findMany();
    }
    async createResource(data) {
        return this.prisma.resource.create({ data });
    }
    async updateResource(id, data) {
        const item = await this.prisma.resource.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Resource not found');
        return this.prisma.resource.update({ where: { id }, data });
    }
    async deleteResource(id) {
        const item = await this.prisma.resource.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Resource not found');
        return this.prisma.resource.delete({ where: { id } });
    }
    async createPosition(electionId, data) {
        const election = await this.prisma.election.findUnique({ where: { id: electionId } });
        if (!election) {
            throw new common_1.NotFoundException('Election not found');
        }
        const existing = await this.prisma.electionPosition.findUnique({
            where: { electionId_title: { electionId, title: data.title } },
        });
        if (existing) {
            throw new common_1.BadRequestException('Position already exists for this election');
        }
        const position = await this.prisma.electionPosition.create({
            data: {
                electionId,
                title: data.title,
                description: data.description,
                maxApplicants: data.maxApplicants || 100,
                isOpen: false,
            },
        });
        return position;
    }
    async getPositions(electionId) {
        return this.prisma.electionPosition.findMany({
            where: { electionId },
            include: { applications: true },
            orderBy: { createdAt: 'asc' },
        });
    }
    async openPosition(electionId, positionId) {
        const position = await this.prisma.electionPosition.findUnique({
            where: { id: positionId },
        });
        if (!position || position.electionId !== electionId) {
            throw new common_1.NotFoundException('Position not found');
        }
        const updated = await this.prisma.electionPosition.update({
            where: { id: positionId },
            data: { isOpen: true },
            include: { applications: true },
        });
        this.resultsGateway.broadcastPositionStatusChange(electionId, updated);
        return updated;
    }
    async closePosition(electionId, positionId) {
        const position = await this.prisma.electionPosition.findUnique({
            where: { id: positionId },
        });
        if (!position || position.electionId !== electionId) {
            throw new common_1.NotFoundException('Position not found');
        }
        const updated = await this.prisma.electionPosition.update({
            where: { id: positionId },
            data: { isOpen: false },
            include: { applications: true },
        });
        this.resultsGateway.broadcastPositionStatusChange(electionId, updated);
        return updated;
    }
    async getApplicationsByPosition(positionId) {
        const position = await this.prisma.electionPosition.findUnique({
            where: { id: positionId },
        });
        if (!position) {
            throw new common_1.NotFoundException('Position not found');
        }
        return this.prisma.electionApplication.findMany({
            where: { positionId },
            include: {
                user: { select: { id: true, email: true, name: true } },
                position: true,
                election: true,
            },
            orderBy: { appliedAt: 'desc' },
        });
    }
    async getApplicationStats(electionId) {
        const positions = await this.prisma.electionPosition.findMany({
            where: { electionId },
            include: { applications: true },
        });
        const stats = {
            totalApplications: 0,
            byPosition: {},
            byStatus: { pending: 0, approved: 0, rejected: 0, withdrawn: 0 },
            byCounty: {},
        };
        for (const position of positions) {
            const appCount = position.applications.length;
            stats.totalApplications += appCount;
            stats.byPosition[position.id] = {
                title: position.title,
                count: appCount,
                statuses: {
                    pending: position.applications.filter((a) => a.status === 'pending').length,
                    approved: position.applications.filter((a) => a.status === 'approved').length,
                    rejected: position.applications.filter((a) => a.status === 'rejected').length,
                    withdrawn: position.applications.filter((a) => a.status === 'withdrawn').length,
                },
            };
            for (const app of position.applications) {
                stats.byStatus[app.status] = (stats.byStatus[app.status] || 0) + 1;
                stats.byCounty[app.county] = (stats.byCounty[app.county] || 0) + 1;
            }
        }
        return stats;
    }
    async trackUserActivity(userId, email, name, action, details) {
        return this.prisma.userActivity.create({
            data: {
                userId,
                email,
                name,
                action,
                details,
            },
        });
    }
    async getUserActivity(limit = 50, page = 1) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.userActivity.findMany({
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.userActivity.count(),
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
    async getUserActivityStats() {
        const activities = await this.prisma.userActivity.findMany({
            orderBy: { createdAt: 'desc' },
            take: 1000,
        });
        const stats = {
            totalActivities: activities.length,
            activeUsers: new Set(activities.map(a => a.userId)).size,
            byAction: {},
            recentActivities: activities.slice(0, 20),
        };
        for (const activity of activities) {
            stats.byAction[activity.action] = (stats.byAction[activity.action] || 0) + 1;
        }
        return stats;
    }
    async getAllApplications(filters, pagination) {
        const page = pagination?.page ?? 1;
        const limit = pagination?.limit ?? 50;
        const skip = (page - 1) * limit;
        const where = {};
        if (filters?.electionId)
            where.electionId = filters.electionId;
        if (filters?.positionId)
            where.positionId = filters.positionId;
        if (filters?.status)
            where.status = filters.status;
        if (filters?.county)
            where.county = filters.county;
        const [data, total] = await Promise.all([
            this.prisma.electionApplication.findMany({
                where,
                include: {
                    user: { select: { id: true, email: true, name: true } },
                    position: {
                        select: { id: true, title: true },
                    },
                    election: {
                        select: { id: true, title: true },
                    },
                },
                skip,
                take: limit,
                orderBy: { appliedAt: 'desc' },
            }),
            this.prisma.electionApplication.count({ where }),
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
    async updateApplicationStatus(applicationId, status) {
        const application = await this.prisma.electionApplication.findUnique({
            where: { id: applicationId },
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        return this.prisma.electionApplication.update({
            where: { id: applicationId },
            data: { status },
            include: {
                user: { select: { id: true, email: true, name: true } },
                position: true,
                election: true,
            },
        });
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = AdminService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        results_gateway_1.ResultsGateway])
], AdminService);
//# sourceMappingURL=admin.service.js.map